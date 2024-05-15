import redisClient from '../utils/redisClient';

describe('redisClient', () => {
  beforeAll(() => {
    redisClient.set('test_key', 'test_value');
  });

  it('should set and get a value correctly', async () => {
    const value = await redisClient.get('test_key');
    expect(value).toBe('test_value');
  });

  it('should delete a key correctly', async () => {
    await redisClient.del('test_key');
    const value = await redisClient.get('test_key');
    expect(value).toBe(null);
  });
});
