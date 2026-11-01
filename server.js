const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');
const { randomUUID } = require('node:crypto');

const PORT = Number(process.env.PORT) || 3000;
const ROOT = __dirname;
const DATA_DIR = path.join(ROOT, 'data');
const DATA_FILE = path.join(DATA_DIR, 'tasks.json');
const MIME = { '.html': 'text/html; charset=utf-8', '.css': 'text/css; charset=utf-8', '.js': 'text/javascript; charset=utf-8', '.json': 'application/json; charset=utf-8', '.svg': 'image/svg+xml' };

fs.mkdirSync(DATA_DIR, { recursive: true });
if (!fs.existsSync(DATA_FILE)) fs.writeFileSync(DATA_FILE, '[]');
const readTasks = () => JSON.parse(fs.readFileSync(DATA_FILE, 'utf8'));
const saveTasks = (tasks) => fs.writeFileSync(DATA_FILE, JSON.stringify(tasks, null, 2));
const send = (res, status, body, headers = {}) => { res.writeHead(status, { 'Content-Type': 'application/json; charset=utf-8', ...headers }); res.end(JSON.stringify(body)); };
const readBody = (req) => new Promise((resolve, reject) => {
  let raw = ''; req.on('data', chunk => { raw += chunk; if (raw.length > 1_000_000) req.destroy(); });
  req.on('end', () => { try { resolve(raw ? JSON.parse(raw) : {}); } catch { reject(new Error('Request body must be valid JSON.')); } });
  req.on('error', reject);
});

async function handleApi(req, res, url) {
  const parts = url.pathname.split('/').filter(Boolean);
  if (parts[1] !== 'tasks') return send(res, 404, { error: 'API route not found.' });
  const id = parts[2];
  let tasks = readTasks();
  if (req.method === 'GET' && !id) return send(res, 200, { tasks });
  if (req.method === 'POST' && !id) {
    let body; try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const title = typeof body.title === 'string' ? body.title.trim() : '';
    if (!title || title.length > 100) return send(res, 400, { error: 'Task title must be 1–100 characters.' });
    const task = { id: randomUUID(), title, notes: typeof body.notes === 'string' ? body.notes.trim().slice(0, 500) : '', category: ['Personal', 'Study', 'Work'].includes(body.category) ? body.category : 'Personal', priority: ['Low', 'Medium', 'High'].includes(body.priority) ? body.priority : 'Medium', dueDate: /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate || '') ? body.dueDate : '', completed: false, createdAt: new Date().toISOString() };
    tasks.unshift(task); saveTasks(tasks); return send(res, 201, { task });
  }
  const index = tasks.findIndex(task => task.id === id);
  if (index < 0) return send(res, 404, { error: 'Task not found.' });
  if (req.method === 'PATCH') {
    let body; try { body = await readBody(req); } catch (e) { return send(res, 400, { error: e.message }); }
    const old = tasks[index];
    tasks[index] = { ...old,
      ...(typeof body.title === 'string' && body.title.trim() && body.title.trim().length <= 100 ? { title: body.title.trim() } : {}),
      ...(typeof body.notes === 'string' ? { notes: body.notes.trim().slice(0, 500) } : {}),
      ...(typeof body.completed === 'boolean' ? { completed: body.completed } : {}),
      ...(['Personal', 'Study', 'Work'].includes(body.category) ? { category: body.category } : {}),
      ...(['Low', 'Medium', 'High'].includes(body.priority) ? { priority: body.priority } : {}),
      ...(typeof body.dueDate === 'string' && (!body.dueDate || /^\d{4}-\d{2}-\d{2}$/.test(body.dueDate)) ? { dueDate: body.dueDate } : {})
    };
    saveTasks(tasks); return send(res, 200, { task: tasks[index] });
  }
  if (req.method === 'DELETE') { const [deleted] = tasks.splice(index, 1); saveTasks(tasks); return send(res, 200, { task: deleted }); }
  return send(res, 405, { error: 'Method not allowed.' }, { Allow: 'GET, PATCH, DELETE' });
}

const server = http.createServer(async (req, res) => {
  const url = new URL(req.url, `http://${req.headers.host || 'localhost'}`);
  if (url.pathname.startsWith('/api/')) {
    if (req.method === 'OPTIONS') { res.writeHead(204, { 'Access-Control-Allow-Methods': 'GET, POST, PATCH, DELETE, OPTIONS', 'Access-Control-Allow-Headers': 'Content-Type' }); return res.end(); }
    try { return await handleApi(req, res, url); } catch (error) { console.error(error); return send(res, 500, { error: 'Something went wrong while saving your tasks.' }); }
  }
  let pathname = decodeURIComponent(url.pathname === '/' ? '/index.html' : url.pathname);
  const file = path.resolve(ROOT, `.${pathname}`);
  if (!file.startsWith(ROOT + path.sep) && file !== path.join(ROOT, 'index.html')) { res.writeHead(403); return res.end('Forbidden'); }
  fs.readFile(file, (error, content) => {
    if (error) { res.writeHead(404, { 'Content-Type': 'text/plain; charset=utf-8' }); return res.end('Page not found'); }
    res.writeHead(200, { 'Content-Type': MIME[path.extname(file)] || 'application/octet-stream', 'X-Content-Type-Options': 'nosniff' }); res.end(content);
  });
});

server.listen(PORT, () => console.log(`FocusFlow is running at http://localhost:${PORT}`));
