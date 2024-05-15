import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import { ObjectId } from 'mongodb';
import Queue from 'bull';

class UsersController {
  static async postNew(req, res) {
    const queue = new Queue('userQueue');
    const { email, password } = req.body;
    if (!email) return res.status(400).json({ error: 'Missing email' });
    if (!password) return res.status(400).json({ error: 'Missing password' });

    const users = await dbClient.db.collection('users');
    users.findOne({ email }, async (err, result) => {
      if (result) {
        return res.status(400).json({ error: 'Already exist' });
      }
      const hashedPassword = sha1(password);
      const { insertedId } = await users.insertOne({ email, password: hashedPassword });
      const user = { id: insertedId, email };
      queue.add({ userId: insertedId });
      return res.status(201).json(user);
    });
  }

  static async getMe (request, response) {
    try {
      const userToken = request.header('X-Token');
      const authKey = `auth_${userToken}`;
      // console.log('USER TOKEN GET ME', userToken);
      const userID = await redisClient.get(authKey);
      console.log('USER KEY GET ME', userID);
      if (!userID) {
        response.status(401).json({ error: 'Unauthorized' });
      }
      const user = await dbClient.getUser({ _id: ObjectId(userID) });
      // console.log('USER GET ME', user);
      response.json({ id: user._id, email: user.email });
    } catch (error) {
      console.log(error);
      response.status(500).json({ error: 'Server error' });
    }
  }
}

export default UsersController;