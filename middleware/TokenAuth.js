import redisClient from '../utils/redis';

class TokenAuth {
    static async getTokenUser(req, res, next) {
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

        req.userId = userId;
        next()
    }
}


export default TokenAuth;