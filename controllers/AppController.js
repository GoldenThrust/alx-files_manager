import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AppController {
  static getStatus(req, res) {
    res.json({
      redis: redisClient.isAlive(),
      db: dbClient.isAlive(),
    });
  }

  static getStats(req, res) {
    Promise.all([dbClient.nbUsers(), dbClient.nbFiles()]).then(
      ([nbUsers, nbFiles]) => {
        res.json({
          users: nbUsers,
          files: nbFiles,
        });
      },
    );
  }
}

export default AppController;
