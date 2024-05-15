const dbClient = require('../utils/db');
const redisClient = require('../utils/redis');

class AppController {
	static async getStatus(req, res) {
		const redisAlive = redisClient.isAlive();
		const dbAlive = dbClient.isAlive();
		await res.status(200).json({ redis: redisAlive, db: dbAlive });
	}

	static async getStats(req, res) {
		const users = await dbClient.nbUsers();
		const files = await dbClient.nbFiles();
		res.status(200).json({ users, files });
	}
}

export default AppController;
