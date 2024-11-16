import request from 'supertest';
import { app } from '../../app.js';

describe('Root', () => {
  let server;

  beforeAll(() => {
    server = app.listen();
  });

  afterAll(async () => {
    await server.close();
  });

  test('should return not found', async () => {
    const response = await request(app).get('/');
    expect(response.statusCode).toBe(404);
  });

  test('should return OK', async () => {
    const response = await request(app).get('/api/v1');
    expect(response.statusCode).toBe(200);
  });
});
