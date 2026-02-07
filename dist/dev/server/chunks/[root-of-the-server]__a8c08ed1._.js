module.exports = [
"[externals]/next/dist/compiled/next-server/app-route-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-route-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-route-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/@opentelemetry/api [external] (next/dist/compiled/@opentelemetry/api, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/@opentelemetry/api", () => require("next/dist/compiled/@opentelemetry/api"));

module.exports = mod;
}),
"[externals]/next/dist/compiled/next-server/app-page-turbo.runtime.dev.js [external] (next/dist/compiled/next-server/app-page-turbo.runtime.dev.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js", () => require("next/dist/compiled/next-server/app-page-turbo.runtime.dev.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-unit-async-storage.external.js [external] (next/dist/server/app-render/work-unit-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-unit-async-storage.external.js", () => require("next/dist/server/app-render/work-unit-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/work-async-storage.external.js [external] (next/dist/server/app-render/work-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/work-async-storage.external.js", () => require("next/dist/server/app-render/work-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/shared/lib/no-fallback-error.external.js [external] (next/dist/shared/lib/no-fallback-error.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/shared/lib/no-fallback-error.external.js", () => require("next/dist/shared/lib/no-fallback-error.external.js"));

module.exports = mod;
}),
"[externals]/next/dist/server/app-render/after-task-async-storage.external.js [external] (next/dist/server/app-render/after-task-async-storage.external.js, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("next/dist/server/app-render/after-task-async-storage.external.js", () => require("next/dist/server/app-render/after-task-async-storage.external.js"));

module.exports = mod;
}),
"[externals]/node:crypto [external] (node:crypto, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:crypto", () => require("node:crypto"));

module.exports = mod;
}),
"[externals]/fs [external] (fs, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("fs", () => require("fs"));

module.exports = mod;
}),
"[externals]/path [external] (path, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("path", () => require("path"));

module.exports = mod;
}),
"[project]/src/lib/db.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "AgentQueries",
    ()=>AgentQueries,
    "PlanningSessionQueries",
    ()=>PlanningSessionQueries,
    "SessionQueries",
    ()=>SessionQueries,
    "TaskQueries",
    ()=>TaskQueries,
    "closeDatabase",
    ()=>closeDatabase,
    "initDatabase",
    ()=>initDatabase
]);
// Simple JSON-based database for quick start
// Will be replaced with SQLite once bindings work
var __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/fs [external] (fs, cjs)");
var __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__ = __turbopack_context__.i("[externals]/path [external] (path, cjs)");
;
;
// Use absolute path to ensure consistency across API routes and dev server
const DB_DIR = '/home/nvq2309/clawd/mission-control-v2/my-app/database';
const DB_FILE = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$path__$5b$external$5d$__$28$path$2c$__cjs$29$__["join"])(DB_DIR, 'data.json');
let db = null;
function initDb() {
    if (db) return db;
    if (!(0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(DB_DIR)) {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["mkdirSync"])(DB_DIR, {
            recursive: true
        });
    }
    if ((0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["existsSync"])(DB_FILE)) {
        try {
            const data = (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["readFileSync"])(DB_FILE, 'utf-8');
            db = JSON.parse(data);
            return db;
        } catch  {
        // Fall through to create new
        }
    }
    db = {
        tasks: [],
        agents: [],
        sessions: [],
        planningSessions: []
    };
    saveDb();
    return db;
}
function saveDb() {
    if (db) {
        (0, __TURBOPACK__imported__module__$5b$externals$5d2f$fs__$5b$external$5d$__$28$fs$2c$__cjs$29$__["writeFileSync"])(DB_FILE, JSON.stringify(db, null, 2));
    }
}
function getDb() {
    if (!db) return initDb();
    return db;
}
function initDatabase() {
    return initDb();
}
const TaskQueries = {
    getAll (filters) {
        const database = getDb();
        let tasks = database.tasks;
        if (filters?.status) {
            tasks = tasks.filter((t)=>t.status === filters.status);
        }
        if (filters?.agent_id) {
            tasks = tasks.filter((t)=>t.agent_id === filters.agent_id);
        }
        if (filters?.priority !== undefined) {
            tasks = tasks.filter((t)=>t.priority === filters.priority);
        }
        return tasks.sort((a, b)=>b.priority - a.priority);
    },
    getById (id) {
        const database = getDb();
        return database.tasks.find((t)=>t.id === id) || null;
    },
    create (input) {
        const database = getDb();
        const task = {
            id: input.id,
            title: input.title,
            description: input.description || null,
            status: 'pending',
            priority: input.priority || 5,
            agent_id: null,
            deliverables: [],
            planning_session_id: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            started_at: null,
            completed_at: null
        };
        database.tasks.push(task);
        saveDb();
        return task;
    },
    update (id, input) {
        const database = getDb();
        const idx = database.tasks.findIndex((t)=>t.id === id);
        if (idx === -1) return null;
        const task = database.tasks[idx];
        database.tasks[idx] = {
            ...task,
            title: input.title ?? task.title,
            description: input.description !== undefined ? input.description : task.description,
            status: input.status ?? task.status,
            priority: input.priority ?? task.priority,
            agent_id: input.agent_id !== undefined ? input.agent_id : task.agent_id,
            deliverables: input.deliverables ?? task.deliverables,
            updated_at: new Date().toISOString()
        };
        saveDb();
        return database.tasks[idx];
    },
    delete (id) {
        const database = getDb();
        const idx = database.tasks.findIndex((t)=>t.id === id);
        if (idx === -1) return false;
        database.tasks.splice(idx, 1);
        saveDb();
        return true;
    },
    linkPlanningSession (taskId, planningSessionId) {
        return !!this.update(taskId, {
            planning_session_id: planningSessionId,
            status: 'planning'
        });
    },
    updateStatus (id, status) {
        const updates = {
            status: status
        };
        if (status === 'in_progress') {
            updates.started_at = new Date().toISOString();
        } else if (status === 'completed' || status === 'failed') {
            updates.completed_at = new Date().toISOString();
        }
        return this.update(id, updates);
    }
};
const AgentQueries = {
    getAll () {
        return getDb().agents;
    },
    getById (id) {
        return getDb().agents.find((a)=>a.id === id) || null;
    },
    create (input) {
        const database = getDb();
        const agent = {
            id: input.id,
            name: input.name,
            role: input.role,
            status: 'idle',
            current_task_id: null,
            session_key: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
        };
        database.agents.push(agent);
        saveDb();
        return agent;
    },
    update (id, input) {
        const database = getDb();
        const idx = database.agents.findIndex((a)=>a.id === id);
        if (idx === -1) return null;
        const agent = database.agents[idx];
        database.agents[idx] = {
            ...agent,
            name: input.name ?? agent.name,
            role: input.role ?? agent.role,
            status: input.status ?? agent.status,
            current_task_id: input.current_task_id !== undefined ? input.current_task_id : agent.current_task_id,
            session_key: input.session_key !== undefined ? input.session_key : agent.session_key,
            updated_at: new Date().toISOString()
        };
        saveDb();
        return database.agents[idx];
    },
    getIdle () {
        return getDb().agents.filter((a)=>a.status === 'idle');
    },
    assignTask (agentId, taskId) {
        return !!this.update(agentId, {
            status: 'busy',
            current_task_id: taskId
        });
    },
    clearTask (agentId) {
        return !!this.update(agentId, {
            status: 'idle',
            current_task_id: null
        });
    }
};
const PlanningSessionQueries = {
    getAll () {
        return getDb().planningSessions;
    },
    getById (id) {
        return getDb().planningSessions.find((p)=>p.id === id) || null;
    },
    getByTaskId (taskId) {
        return getDb().planningSessions.find((p)=>p.task_id === taskId) || null;
    },
    create (input) {
        const database = getDb();
        const session = {
            id: input.id,
            task_id: input.taskId,
            questions: input.questions,
            answers: [],
            completed: false,
            created_at: new Date().toISOString(),
            completed_at: null
        };
        database.planningSessions.push(session);
        saveDb();
        return session;
    },
    submitAnswers (id, input) {
        const database = getDb();
        const idx = database.planningSessions.findIndex((p)=>p.id === id);
        if (idx === -1) return null;
        const session = database.planningSessions[idx];
        const updatedAnswers = [
            ...session.answers,
            ...input.answers
        ];
        const allAnswered = updatedAnswers.length >= session.questions.length;
        database.planningSessions[idx] = {
            ...session,
            answers: updatedAnswers,
            completed: allAnswered,
            completed_at: allAnswered ? new Date().toISOString() : null
        };
        saveDb();
        return database.planningSessions[idx];
    },
    delete (id) {
        const database = getDb();
        const idx = database.planningSessions.findIndex((p)=>p.id === id);
        if (idx === -1) return false;
        database.planningSessions.splice(idx, 1);
        saveDb();
        return true;
    }
};
const SessionQueries = {
    getAll () {
        return getDb().sessions;
    },
    getById (id) {
        return getDb().sessions.find((s)=>s.id === id) || null;
    },
    getByAgentId (agentId) {
        return getDb().sessions.filter((s)=>s.agent_id === agentId);
    },
    getByTaskId (taskId) {
        return getDb().sessions.filter((s)=>s.task_id === taskId);
    },
    create (input) {
        const database = getDb();
        const session = {
            id: input.id,
            agent_id: input.agent_id,
            task_id: input.task_id,
            status: 'active',
            output: null,
            error_message: null,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
            completed_at: null
        };
        database.sessions.push(session);
        saveDb();
        return session;
    },
    appendOutput (id, output) {
        const database = getDb();
        const idx = database.sessions.findIndex((s)=>s.id === id);
        if (idx === -1) return false;
        database.sessions[idx].output = (database.sessions[idx].output || '') + output;
        database.sessions[idx].updated_at = new Date().toISOString();
        saveDb();
        return true;
    },
    updateStatus (id, status) {
        const database = getDb();
        const idx = database.sessions.findIndex((s)=>s.id === id);
        if (idx === -1) return false;
        database.sessions[idx].status = status;
        database.sessions[idx].updated_at = new Date().toISOString();
        saveDb();
        return true;
    },
    complete (id, errorMessage) {
        const database = getDb();
        const idx = database.sessions.findIndex((s)=>s.id === id);
        if (idx === -1) return null;
        database.sessions[idx].status = errorMessage ? 'failed' : 'completed';
        database.sessions[idx].error_message = errorMessage || null;
        database.sessions[idx].completed_at = new Date().toISOString();
        database.sessions[idx].updated_at = new Date().toISOString();
        saveDb();
        return database.sessions[idx];
    },
    cancel (id) {
        return this.complete(id, 'cancelled');
    }
};
function closeDatabase() {
    db = null;
}
}),
"[project]/src/app/api/tasks/route.ts [app-route] (ecmascript)", ((__turbopack_context__) => {
"use strict";

__turbopack_context__.s([
    "GET",
    ()=>GET,
    "POST",
    ()=>POST
]);
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/node_modules/next/server.js [app-route] (ecmascript)");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__ = __turbopack_context__.i("[project]/node_modules/uuid/dist-node/v4.js [app-route] (ecmascript) <export default as v4>");
var __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__ = __turbopack_context__.i("[project]/node_modules/zod/v4/classic/external.js [app-route] (ecmascript) <export * as z>");
var __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__ = __turbopack_context__.i("[project]/src/lib/db.ts [app-route] (ecmascript)");
;
;
;
;
// Initialize database on first load
(0, __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["initDatabase"])();
// Validation schemas
const createTaskSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    priority: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(10).optional()
});
const updateTaskSchema = __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
    title: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().min(1).max(255).optional(),
    description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional(),
    status: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].enum([
        'pending',
        'planning',
        'ready',
        'dispatched',
        'in_progress',
        'completed',
        'failed',
        'cancelled'
    ]).optional(),
    priority: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].number().int().min(1).max(10).optional(),
    agent_id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().nullable().optional(),
    deliverables: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].array(__TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].object({
        id: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        description: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string(),
        completed: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].boolean(),
        completedAt: __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$zod$2f$v4$2f$classic$2f$external$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__$2a$__as__z$3e$__["z"].string().optional()
    })).optional()
});
async function GET(request) {
    try {
        const { searchParams } = new URL(request.url);
        const status = searchParams.get('status') || undefined;
        const agent_id = searchParams.get('agent_id') || undefined;
        const priority = searchParams.get('priority') ? parseInt(searchParams.get('priority')) : undefined;
        const tasks = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TaskQueries"].getAll({
            status,
            agent_id,
            priority
        });
        const response = {
            success: true,
            data: {
                tasks,
                total: tasks.length
            }
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        const response = {
            success: false,
            error: 'Failed to fetch tasks'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: 500
        });
    }
}
async function POST(request) {
    try {
        const body = await request.json();
        // Validate input
        const validation = createTaskSchema.safeParse(body);
        if (!validation.success) {
            const response = {
                success: false,
                error: 'Invalid input: ' + validation.error.issues.map((e)=>e.message).join(', ')
            };
            return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
                status: 400
            });
        }
        const input = validation.data;
        const task = __TURBOPACK__imported__module__$5b$project$5d2f$src$2f$lib$2f$db$2e$ts__$5b$app$2d$route$5d$__$28$ecmascript$29$__["TaskQueries"].create({
            ...input,
            id: (0, __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$uuid$2f$dist$2d$node$2f$v4$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__$3c$export__default__as__v4$3e$__["v4"])()
        });
        const response = {
            success: true,
            data: task,
            message: 'Task created successfully'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: 201
        });
    } catch (error) {
        console.error('Error creating task:', error);
        const response = {
            success: false,
            error: 'Failed to create task'
        };
        return __TURBOPACK__imported__module__$5b$project$5d2f$node_modules$2f$next$2f$server$2e$js__$5b$app$2d$route$5d$__$28$ecmascript$29$__["NextResponse"].json(response, {
            status: 500
        });
    }
}
}),
];

//# sourceMappingURL=%5Broot-of-the-server%5D__a8c08ed1._.js.map