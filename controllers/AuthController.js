const crypto = require('crypto');
const uuid = require('uuid');
const redisClient = require('../utils/redis');

const User = require('../models/User');

exports.getConnect = async (req, res) => {
  const auth = req.headers.authorization;
  if (!auth) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const [email, password] = Buffer.from(auth.split(' ')[1], 'base64').toString().split(':');
  const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
  const user = await User.findOne({ email, password: sha1Password });

  if (!user) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const token = uuid.v4();
  await redisClient.set(`auth_${token}`, user._id, 'EX', 24 * 60 * 60);

  return res.status(200).json({ token });
};

exports.getDisconnect = async (req, res) => {
  const token = req.headers['x-token'];
  if (!token || !(await redisClient.get(`auth_${token}`))) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  await redisClient.del(`auth_${token}`);
  return res.status(204).end();
};
