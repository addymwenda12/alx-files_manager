const redisClient = require('../utils/redis');
const User = require('../models/User');

exports.getMe = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await User.findById(userId);
  return res.json({ id: user._id, email: user.email });
};
