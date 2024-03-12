import mongodb from 'mongodb';

class DBClient {
  constructor() {
    const host = process.env.DB_HOST || 'localhost';
    const port = process.env.DB_PORT || 27017;
    const database = process.env.DB_DATABASE || 'files_manager';
    const dbURL = `mongodb://${host}:${port}/${database}`;
    this.client = new mongodb.MongoClient(dbURL);
    this.client.connect();
  }

  isAlive() {
    return this.client.isConnected();
  }

  nbUsers() {
    return this.client.db().collection('users').countDocuments();
  }

  nbFiles() {
    return this.client.db().collection('files').countDocuments();
  }

  async getCollection(collection) {
    return this.client.db().collection(collection);
  }
}

const dbClient = new DBClient();
export default dbClient;
