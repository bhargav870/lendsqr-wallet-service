import request from 'supertest';
import { createApp } from '../src/app';

describe('API security', () => {
  it('rejects protected routes without token', async () => {
    const response = await request(createApp()).post('/api/v1/users').send({});
    expect(response.status).toBe(401);
  });
});
