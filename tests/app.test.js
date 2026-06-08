const request = require('supertest');
const { app, server } = require('../app');

describe('App Health Check', () => {
  afterAll((done) => {
    server.close(done);
  });

  it('should return 200 for index.html', async () => {
    const res = await request(app).get('/');
    expect(res.status).toBe(200);
    expect(res.text).toContain('<!DOCTYPE html>');
  });

  it('should return 404 for unknown API endpoint', async () => {
    const res = await request(app).get('/api/unknown');
    expect(res.status).toBe(404);
    expect(res.body.message).toBe('Endpoint API introuvable.');
  });
});
