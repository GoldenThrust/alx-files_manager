import { v4 as uuidv4 } from 'uuid';
import sha1 from 'sha1';
import redisClient from '../utils/redis';
import dbClient from '../utils/db';

class AuthController {
  static async getConnect(req, res) {
    const authHeader = req.headers.authorization;
    if (!authHeader || !authHeader.startsWith('Basic ')) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const auth = Buffer.from(authHeader.slice('Basic '.length), 'base64')
      .toString('utf-8')
      .split(':');
    let email;
    let password;
    try {
      [email, password] = auth;
      password = sha1(password);
    } catch (e) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const user = await (
      await dbClient.getCollection('users')
    ).findOne({ email, password });

    if (!user) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const token = uuidv4();
    const key = `auth_${token}`;

    await redisClient.set(key, user._id.toString(), 86400);

    res.status(200).json({ token });
  }

  static async getDisconnect(req, res) {
    const token = req.header('X-Token');
    if (!token) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const key = `auth_${token}`;
    const userId = await redisClient.get(key);

    if (!userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    await redisClient.del(key);
    res.status(204).end();
  }
}

export default AuthController;
