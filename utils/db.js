import { MongoClient } from 'mongodb';

class DBClient {
  constructor() {
    this.host = process.env.DB_HOST || 'localhost';
		this.port = process.env.DB_PORT || 27017;
    this.database = process.env.DB_DATABASE || 'files_manager';

    this.uri = `mongodb://${this.host}:${this.port}/${this.database}`;
    this.client = new MongoClient(this.uri, { useUnifiedTopology: true });
    this.client.connect();
  }

	async connect() {
		try {
			await this.client.connect();
		} catch (err) {
			console.error(err);
			process.exit(1);
		}
	}

  isAlive() {
    return this.client.topology.isConnected();
  }

  async nbUsers() {
    try {
      const users = await this.client.db(this.database).collection('users').countDocuments();
      return users;
    } catch (err) {
      throw new Error(`Unable to get number of users ${err.message}`);
    }
  }

  async nbFiles() {
    try {
      const files = await this.client.db(this.database).collection('files').countDocuments();
      return files;
    } catch (err) {
      throw new Error(`Unable to get number of files ${err.message}`);
    }
  }
}

const dbClient = new DBClient();
export default dbClient;
