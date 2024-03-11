import fs from 'fs';
import path from 'path';
import dbClient from '../utils/db';
import { v4 as uuidv4 } from 'uuid';
import redisClient from '../utils/redis';
import mongoDBCore from 'mongodb/lib/core';

class FilesController {
    static async postUpload(req, res) {
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

        const { name, type, parentId = 0, isPublic = false, data } = req.body;

        if (!name) {
            return res.status(400).json({ error: 'Missing name' });
        }

        if (!type || !['folder', 'file', 'image'].includes(type)) {
            return res.status(400).json({ error: 'Missing type' });
        }

        if (type !== 'folder' && !data) {
            return res.status(400).json({ error: 'Missing data' });
        }

        if (parentId !== 0) {
            const parentFile = await (await dbClient.getCollection('files')).findOne({ _id: new mongoDBCore.BSON.ObjectId(parentId) });

            if (!parentFile) {
                res.status(400).json({ error: 'Parent not found' });
                return;
            }

            if (parentFile.type !== 'folder') {
                res.status(400).json({ error: 'Parent is not a folder' });
                return;
            }
        }


        const storingFolderPath = process.env.FOLDER_PATH || '/tmp/files_manager';
        const relativePath = uuidv4();
        const localPath = path.join(storingFolderPath, relativePath);

        if (!fs.existsSync(path.dirname(localPath))) {
            fs.mkdirSync(path.dirname(localPath), { recursive: true });
        }

        if (type !== 'folder') {
            const fileContent = Buffer.from(data, 'base64');
            fs.writeFileSync(localPath, fileContent);
        }

        const newFile = {
            userId,
            name,
            type,
            parentId,
            isPublic,
            localPath: type !== 'folder' ? localPath : null,
        };

        const result = await (await dbClient.getCollection('files')).insertOne(newFile);

        res.status(201).json({
            id: result.insertedId.toString(),
            ...newFile,
        });
    }
}

export default FilesController;