'use strict';

const express = require('express');

/**
 * Petit repository in-memory (simple et suffisant pour le TP).
 * Permet des tests déterministes.
 */
function createTaskRepository() {
  let tasks = [];
  let nextId = 1;

  const nowIso = () => new Date().toISOString();

  return {
    list() {
      return tasks;
    },

    create(title) {
      const t = title.trim();
      const ts = nowIso();
      const task = { id: nextId++, title: t, done: false, createdAt: ts, updatedAt: ts };
      tasks = [...tasks, task];
      return task;
    },

    getById(id) {
      return tasks.find((x) => x.id === id) ?? null;
    },

    update(id, patch) {
      const existing = this.getById(id);
      if (!existing) return null;

      const updated = { ...existing, ...patch, updatedAt: nowIso() };
      tasks = tasks.map((x) => (x.id === id ? updated : x));
      return updated;
    },

    remove(id) {
      const before = tasks.length;
      tasks = tasks.filter((x) => x.id !== id);
      return tasks.length !== before;
    },

    // utile en tests si besoin
    reset() {
      tasks = [];
      nextId = 1;
    },
  };
}

function validateCreate(body) {
  if (!body || typeof body !== 'object') return 'Body JSON requis';
  if (typeof body.title !== 'string' || body.title.trim().length < 2) {
    return 'title doit être une string (min 2 caractères)';
  }
  return null;
}

function validatePatch(body) {
  if (!body || typeof body !== 'object') return 'Body JSON requis';
  if (!('title' in body) && !('done' in body)) return 'Au moins title ou done est requis';

  if ('title' in body && (typeof body.title !== 'string' || body.title.trim().length < 2)) {
    return 'title doit être une string (min 2 caractères)';
  }
  if ('done' in body && typeof body.done !== 'boolean') return 'done doit être un boolean';

  return null;
}

/**
 * Factory d’application (injectable => tests faciles)
 * @param {{ repo?: ReturnType<typeof createTaskRepository> }} [deps]
 */
function createApp(deps = {}) {
  const repo = deps.repo ?? createTaskRepository();

  const app = express();
  app.disable('x-powered-by');
  app.use(express.json({ limit: '64kb' }));

  // Healthcheck (utile pour smoke test CI/CD)
  app.get('/health', (_req, res) => res.status(200).json({ status: 'ok' }));

  // LIST
  app.get('/api/tasks', (_req, res) => res.status(200).json({ data: repo.list() }));

  // CREATE
  app.post('/api/tasks', (req, res) => {
    const err = validateCreate(req.body);
    if (err) return res.status(400).json({ error: err });

    const created = repo.create(req.body.title);
    return res.status(201).json({ data: created });
  });

  // GET BY ID
  app.get('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id invalide' });

    const task = repo.getById(id);
    if (!task) return res.status(404).json({ error: 'Task not found' });

    return res.status(200).json({ data: task });
  });

  // PATCH
  app.patch('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id invalide' });

    const err = validatePatch(req.body);
    if (err) return res.status(400).json({ error: err });

    const patch = {};
    if ('title' in req.body) patch.title = req.body.title.trim();
    if ('done' in req.body) patch.done = req.body.done;

    const updated = repo.update(id, patch);
    if (!updated) return res.status(404).json({ error: 'Task not found' });

    return res.status(200).json({ data: updated });
  });

  // DELETE
  app.delete('/api/tasks/:id', (req, res) => {
    const id = Number(req.params.id);
    if (!Number.isInteger(id) || id <= 0) return res.status(400).json({ error: 'id invalide' });

    const ok = repo.remove(id);
    if (!ok) return res.status(404).json({ error: 'Task not found' });

    return res.status(204).send();
  });

  // fallback 404
  app.use((_req, res) => res.status(404).json({ error: 'Not found' }));

  return app;
}

module.exports = { createApp, createTaskRepository };

// Démarrage serveur (uniquement si lancé directement)
if (require.main === module) {
  const port = Number.parseInt(process.env.PORT || '3000', 10);
  createApp().listen(port, () => console.log(`Server listening on ${port}`));
}