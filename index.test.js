'use strict';

const request = require('supertest');
const { createApp, createTaskRepository } = require('./index');

describe('DevOps TP API', () => {
  let app;

  beforeEach(() => {
    const repo = createTaskRepository();
    app = createApp({ repo });
  });

  test('GET /health -> 200 {status: ok}', async () => {
    const res = await request(app).get('/health');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ status: 'ok' });
  });

  test('POST /api/tasks -> 400 si title invalide', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'a' });
    expect(res.status).toBe(400);
    expect(res.body.error).toMatch(/title/i);
  });

  test('POST /api/tasks -> 201 et retourne la task', async () => {
    const res = await request(app).post('/api/tasks').send({ title: 'My task' });
    expect(res.status).toBe(201);
    expect(res.body.data).toMatchObject({ id: 1, title: 'My task', done: false });
    expect(res.body.data.createdAt).toBeTruthy();
  });

  test('GET /api/tasks -> liste des tasks', async () => {
    await request(app).post('/api/tasks').send({ title: 'T1' });
    await request(app).post('/api/tasks').send({ title: 'T2' });

    const res = await request(app).get('/api/tasks');
    expect(res.status).toBe(200);
    expect(res.body.data).toHaveLength(2);
    expect(res.body.data.map((t) => t.title)).toEqual(['T1', 'T2']);
  });

  test('GET /api/tasks/:id -> 404 si inexistante', async () => {
    const res = await request(app).get('/api/tasks/999');
    expect(res.status).toBe(404);
  });

  test('PATCH /api/tasks/:id -> update done + title', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'Old' });
    const id = created.body.data.id;

    const res = await request(app).patch(`/api/tasks/${id}`).send({ title: 'New', done: true });
    expect(res.status).toBe(200);
    expect(res.body.data).toMatchObject({ id, title: 'New', done: true });
  });

  test('DELETE /api/tasks/:id -> 204 puis 404', async () => {
    const created = await request(app).post('/api/tasks').send({ title: 'To delete' });
    const id = created.body.data.id;

    const del = await request(app).delete(`/api/tasks/${id}`);
    expect(del.status).toBe(204);

    const get = await request(app).get(`/api/tasks/${id}`);
    expect(get.status).toBe(404);
  });
});