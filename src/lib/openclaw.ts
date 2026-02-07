// OpenClaw Gateway WebSocket Client
// Handles connection, reconnection, and message handling

import WebSocket from 'ws';
import { EventEmitter } from 'events';
import type { OpenClawSpawnCommand, OpenClawStatusUpdate, OpenClawMessage } from '@/types';

interface OpenClawClientOptions {
  url: string;
  token?: string;
  reconnectInterval?: number;
  maxReconnectAttempts?: number;
  pingInterval?: number;
}

interface AgentSpawnOptions {
  agent: string;
  task: string;
  sessionId: string;
  config?: Record<string, unknown>;
}

export class OpenClawClient extends EventEmitter {
  private ws: WebSocket | null = null;
  private options: OpenClawClientOptions;
  private reconnectAttempts = 0;
  private reconnectTimer: NodeJS.Timeout | null = null;
  private pingTimer: NodeJS.Timeout | null = null;
  private isConnecting = false;
  private messageQueue: OpenClawMessage[] = [];

  constructor(options: OpenClawClientOptions) {
    super();
    this.options = {
      reconnectInterval: 5000,
      maxReconnectAttempts: 10,
      pingInterval: 30000,
      ...options,
    };
  }

  /**
   * Check if client is connected
   */
  get isConnected(): boolean {
    return this.ws?.readyState === WebSocket.OPEN;
  }

  /**
   * Connect to OpenClaw Gateway
   */
  connect(): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.isConnecting || this.isConnected) {
        resolve();
        return;
      }

      this.isConnecting = true;

      try {
        const headers: Record<string, string> = {};
        if (this.options.token) {
          headers['Authorization'] = `Bearer ${this.options.token}`;
        }

        this.ws = new WebSocket(this.options.url, { headers });

        this.ws.on('open', () => {
          console.log('[OpenClaw] Connected to gateway');
          this.isConnecting = false;
          this.reconnectAttempts = 0;
          this.emit('connected');
          this.startPingInterval();
          this.flushMessageQueue();
          resolve();
        });

        this.ws.on('message', (data: WebSocket.RawData) => {
          try {
            const message = JSON.parse(data.toString()) as OpenClawMessage;
            this.handleMessage(message);
          } catch (err) {
            console.error('[OpenClaw] Failed to parse message:', err);
            this.emit('error', new Error('Failed to parse message'));
          }
        });

        this.ws.on('close', (code: number, reason: Buffer) => {
          console.log(`[OpenClaw] Disconnected: ${code} ${reason.toString()}`);
          this.isConnecting = false;
          this.stopPingInterval();
          this.emit('disconnected', { code, reason: reason.toString() });
          this.attemptReconnect();
        });

        this.ws.on('error', (error: Error) => {
          console.error('[OpenClaw] Connection error:', error.message);
          this.isConnecting = false;
          this.emit('error', error);
          // Don't reject here - let the 'close' event handle reconnection
        });

      } catch (error) {
        this.isConnecting = false;
        reject(error);
      }
    });
  }

  /**
   * Disconnect from gateway
   */
  disconnect(): void {
    this.stopReconnect();
    this.stopPingInterval();
    
    if (this.ws) {
      this.ws.close(1000, 'Client disconnecting');
      this.ws = null;
    }
  }

  /**
   * Spawn a new agent session
   */
  async spawnAgent(options: AgentSpawnOptions): Promise<boolean> {
    const command: OpenClawSpawnCommand = {
      type: 'spawn',
      agent: options.agent,
      task: options.task,
      sessionId: options.sessionId,
      config: options.config || {},
    };

    return this.sendMessage(command);
  }

  /**
   * Send a ping to keep connection alive
   */
  ping(): boolean {
    return this.sendMessage({ type: 'ping' });
  }

  /**
   * Send a message to the gateway
   */
  private sendMessage(message: OpenClawMessage): boolean {
    if (!this.isConnected) {
      // Queue message for when connection is restored
      this.messageQueue.push(message);
      return false;
    }

    try {
      this.ws!.send(JSON.stringify(message));
      return true;
    } catch (err) {
      console.error('[OpenClaw] Failed to send message:', err);
      this.messageQueue.push(message);
      return false;
    }
  }

  /**
   * Handle incoming messages
   */
  private handleMessage(message: OpenClawMessage): void {
    switch (message.type) {
      case 'pong':
        // Connection is alive
        break;
      
      case 'status':
        const statusUpdate = message.payload as OpenClawStatusUpdate;
        this.emit('agentStatus', statusUpdate);
        break;
      
      case 'error':
        console.error('[OpenClaw] Gateway error:', message.payload);
        this.emit('gatewayError', message.payload);
        break;
      
      default:
        this.emit('message', message);
    }
  }

  /**
   * Attempt to reconnect with exponential backoff
   */
  private attemptReconnect(): void {
    if (this.reconnectAttempts >= (this.options.maxReconnectAttempts || 10)) {
      console.error('[OpenClaw] Max reconnection attempts reached');
      this.emit('maxReconnectAttemptsReached');
      return;
    }

    this.reconnectAttempts++;
    const delay = Math.min(
      (this.options.reconnectInterval || 5000) * Math.pow(1.5, this.reconnectAttempts - 1),
      60000 // Max 60 seconds
    );

    console.log(`[OpenClaw] Reconnecting in ${delay}ms (attempt ${this.reconnectAttempts})`);

    this.reconnectTimer = setTimeout(() => {
      this.connect().catch(() => {
        // Reconnection failed, will try again
      });
    }, delay);
  }

  /**
   * Stop reconnection attempts
   */
  private stopReconnect(): void {
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = null;
    }
    this.reconnectAttempts = 0;
  }

  /**
   * Start ping interval to keep connection alive
   */
  private startPingInterval(): void {
    this.pingTimer = setInterval(() => {
      if (this.isConnected) {
        this.ping();
      }
    }, this.options.pingInterval || 30000);
  }

  /**
   * Stop ping interval
   */
  private stopPingInterval(): void {
    if (this.pingTimer) {
      clearInterval(this.pingTimer);
      this.pingTimer = null;
    }
  }

  /**
   * Flush queued messages
   */
  private flushMessageQueue(): void {
    while (this.messageQueue.length > 0 && this.isConnected) {
      const message = this.messageQueue.shift();
      if (message) {
        this.sendMessage(message);
      }
    }
  }
}

// Singleton instance
let clientInstance: OpenClawClient | null = null;

/**
 * Get or create the OpenClaw client instance
 */
export function getOpenClawClient(): OpenClawClient {
  if (!clientInstance) {
    const url = process.env.OPENCLAW_GATEWAY_URL || 'ws://127.0.0.1:18789';
    const token = process.env.OPENCLAW_GATEWAY_TOKEN;
    
    clientInstance = new OpenClawClient({ url, token });
    
    // Auto-connect
    clientInstance.connect().catch(err => {
      console.error('[OpenClaw] Initial connection failed:', err.message);
    });
  }
  
  return clientInstance;
}

/**
 * Initialize OpenClaw client with custom options
 */
export function initOpenClawClient(options: OpenClawClientOptions): OpenClawClient {
  if (clientInstance) {
    clientInstance.disconnect();
  }
  
  clientInstance = new OpenClawClient(options);
  return clientInstance;
}

// Export types
export type { OpenClawClientOptions, AgentSpawnOptions };
