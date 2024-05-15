const crypto = require('crypto');	
const redisClient = require('../utils/redis');


exports.postNew = async (req, res) => {
  const { email, password } = req.body;

  if (!email) {
    return res.status(400).json({ error: 'Missing email' });
  }

  if (!password) {
    return res.status(400).json({ error: 'Missing password' });
  }

  const existingUser = await User.findOne({ email });
  if (existingUser) {
    return res.status(400).json({ error: 'Already exist' });
  }

  const sha1Password = crypto.createHash('sha1').update(password).digest('hex');
  const user = new User({ email, password: sha1Password });
  await user.save();

  return res.status(201).json({ id: user._id, email: user.email });
};

exports.getMe = async (req, res) => {
  const token = req.headers['x-token'];
  const userId = await redisClient.get(`auth_${token}`);

  if (!userId) {
    return res.status(401).json({ error: 'Unauthorized' });
  }

  const user = await User.findById(userId);
  return res.json({ id: user._id, email: user.email });
};
