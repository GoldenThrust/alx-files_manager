import sha1 from 'sha1';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';
import mongoDBCore from 'mongodb/lib/core';

class UserController {
    static postNew(req, res) {
        console.log(req.body);
        const email = req.body ? req.body.email : null;
        const password = req.body ? req.body.password : null;

        if (!email) {
            res.status(400).json({ error: "Missing email" });
        } else if (!password) {
            res.status(400).json({ error: "Missing password" });
        } else {
            dbClient.getCollection('users').then((response) => {
                response.findOne({ email }).then((user) => {
                    if (user) {
                        res.status(400).json({ error: "Already exist" });
                    } else {
                        const newUser = {
                            email,
                            password: sha1(password)
                        }

                        response.insertOne(newUser).then((result) => {
                            res.status(201).json({ id: result.insertedId.toString(), email });
                        })
                    }
                })
            })
        }
    }

    static async getMe(req, res) {
        const { userId } = req;

        const user = await (await dbClient.getCollection('users')).findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

        if (!user) {
            res.status(401).json({ error: 'Unauthorized' });
            return;
        }

        res.json({ email: user.email, id: user._id });
    }
}

export default UserController;