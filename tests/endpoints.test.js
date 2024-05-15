import request from 'supertest';
import app from '../app';

describe('Endpoints', () => {
  let token;

  beforeAll(async () => {
    // Create a user and get a token for authenticated requests
    await request(app)
      .post('/users')
      .send({ email: 'test@example.com', password: 'password' });
    
    const res = await request(app)
      .get('/connect')
      .send({ email: 'test@example.com', password: 'password' });
    
    token = res.body.token;
  });

  afterAll(async () => {
    await request(app)
      .get('/disconnect')
      .set('X-Token', token);
  });

  test('GET /status', async () => {
    const res = await request(app).get('/status');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ redis: true, db: true });
  });

  test('GET /stats', async () => {
    const res = await request(app).get('/stats');
    expect(res.status).toBe(200);
    expect(res.body).toEqual({ users: expect.any(Number), files: expect.any(Number) });
  });

  test('POST /users', async () => {
    const res = await request(app)
      .post('/users')
      .send({ email: 'new@example.com', password: 'password' });
    
    expect(res.status).toBe(201);
    expect(res.body.email).toBe('new@example.com');
  });

  test('GET /connect', async () => {
    const res = await request(app)
      .get('/connect')
      .send({ email: 'new@example.com', password: 'password' });
    
    expect(res.status).toBe(200);
    expect(res.body).toHaveProperty('token');
  });

  test('GET /disconnect', async () => {
    const res = await request(app)
      .get('/disconnect')
      .set('X-Token', token);
    
    expect(res.status).toBe(204);
  });

  test('GET /users/me', async () => {
    const res = await request(app)
      .get('/users/me')
      .set('X-Token', token);
    
    expect(res.status).toBe(200);
    expect(res.body.email).toBe('test@example.com');
  });

  test('POST /files', async () => {
    const res = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'test.txt', type: 'file', data: Buffer.from('hello').toString('base64') });
    
    expect(res.status).toBe(201);
    expect(res.body.name).toBe('test.txt');
  });

  test('GET /files/:id', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'test2.txt', type: 'file', data: Buffer.from('hello').toString('base64') });
    
    const fileId = fileRes.body.id;
    const res = await request(app)
      .get(`/files/${fileId}`)
      .set('X-Token', token);
    
    expect(res.status).toBe(200);
    expect(res.body.id).toBe(fileId);
  });

  test('GET /files with pagination', async () => {
    const res = await request(app)
      .get('/files')
      .set('X-Token', token)
      .query({ page: 0 });
    
    expect(res.status).toBe(200);
    expect(res.body).toEqual(expect.any(Array));
  });

  test('PUT /files/:id/publish', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'test3.txt', type: 'file', data: Buffer.from('hello').toString('base64') });
    
    const fileId = fileRes.body.id;
    const res = await request(app)
      .put(`/files/${fileId}/publish`)
      .set('X-Token', token);
    
    expect(res.status).toBe(200);
    expect(res.body.isPublic).toBe(true);
  });

  test('PUT /files/:id/unpublish', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'test4.txt', type: 'file', data: Buffer.from('hello').toString('base64') });
    
    const fileId = fileRes.body.id;
    const res = await request(app)
      .put(`/files/${fileId}/unpublish`)
      .set('X-Token', token);
    
    expect(res.status).toBe(200);
    expect(res.body.isPublic).toBe(false);
  });

  test('GET /files/:id/data', async () => {
    const fileRes = await request(app)
      .post('/files')
      .set('X-Token', token)
      .send({ name: 'test5.txt', type: 'file', data: Buffer.from('hello').toString('base64') });
    
    const fileId = fileRes.body.id;
    const res = await request(app)
      .get(`/files/${fileId}/data`)
      .set('X-Token', token);
    
    expect(res.status).toBe(200);
    expect(res.text).toBe('hello');
  });
});
