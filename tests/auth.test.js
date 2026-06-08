const request = require('supertest');
const { app, server } = require('../app');
const db = require('../config/db');
const bcrypt = require('bcryptjs');

describe('Authentication Flow', () => {
  beforeAll(async () => {
    // Clean up or ensure test user doesn't exist if using a real DB, 
    // but here we are likely using a real DB if not mocked.
    // Given the environment, I'll try to use the real DB if possible, 
    // but I should probably mock it if I don't want to mess up the user's DB.
    // However, the previous tests mocked db.query.
  });

  afterAll((done) => {
    server.close(done);
  });

  it('should register and then login successfully', async () => {
    const userData = {
      fullname: 'Test User',
      username: 'testuser_' + Date.now(),
      email: 'test' + Date.now() + '@example.com',
      password: 'password123'
    };

    // 1. Register
    const regRes = await request(app)
      .post('/api/auth/register')
      .send(userData);

    if (regRes.status !== 201) {
        console.error('Register failed:', regRes.body);
    }
    expect(regRes.status).toBe(201);
    expect(regRes.body.user).toBeDefined();
    expect(regRes.body.user.email).toBe(userData.email);

    // 2. Login
    const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: userData.email,
        password: userData.password
      });

    if (loginRes.status !== 200) {
        console.error('Login failed:', loginRes.body);
    }
    expect(loginRes.status).toBe(200);
    expect(loginRes.body.user).toBeDefined();
    expect(loginRes.body.user.email).toBe(userData.email);
  });

  it('should fail login with wrong password', async () => {
     // This test should pass (returning 401) if the logic is correct.
     const loginRes = await request(app)
      .post('/api/auth/login')
      .send({
        email: 'admin@kontact.com',
        password: 'wrongpassword'
      });
    expect(loginRes.status).toBe(401);
  });
});
