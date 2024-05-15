const redis = require('redis');
const { v4: uuidv4 } = require('uuid');
const sha1 = require('sha1');
const dbClient = require('../utils/dbClient'); 
const redisClient = require('../utils/redisClient'); 
class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const base64Credentials = authHeader.split(' ')[1];
    const credentials = Buffer.from(base64Credentials, 'base64').toString('ascii');
    const [email, password] = credentials.split(':');

    if (!email || !password) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const user = await dbClient.findUserByEmail(email);
    if (!user || sha1(password) !== user.password) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const token = uuidv4();
    const tokenKey = `auth_${token}`;
    await redisClient.set(tokenKey, user._id.toString(), 'EX', 24 * 60 * 60);

    return res.status(200).send({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.headers['x-token'];
    if (!token) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    const tokenKey = `auth_${token}`;
    const userId = await redisClient.get(tokenKey);
    if (!userId) {
      return res.status(401).send({ error: 'Unauthorized' });
    }

    await redisClient.del(tokenKey);
    return res.status(204).send();
  }
}

module.exports = AuthController;
