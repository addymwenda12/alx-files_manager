import dbClient from '../utils/db';

describe('dbClient', () => {
  beforeAll(async () => {
    await dbClient.users.insertOne({ email: 'test@example.com', password: 'password' });
  });

  it('should retrieve a user from the database', async () => {
    const user = await dbClient.users.findOne({ email: 'test@example.com' });
    expect(user).toBeTruthy();
    expect(user.email).toBe('test@example.com');
  });

  it('should delete a user from the database', async () => {
    await dbClient.users.deleteOne({ email: 'test@example.com' });
    const user = await dbClient.users.findOne({ email: 'test@example.com' });
    expect(user).toBe(null);
  });
});
