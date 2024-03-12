import { v4 as uuidv4 } from 'uuid';
import fs from 'fs';
import path from 'path';
import mime from 'mime-types';
import mongoDBCore from 'mongodb/lib/core';
import { fileQueue } from '../worker';
import dbClient from '../utils/db';
import redisClient from '../utils/redis';

class FilesController {
  static async postUpload(req, res) {
    const { userId } = req;

    const {
      name, type, parentId = 0, isPublic = false, data,
    } = req.body;

    if (!name) {
      res.status(400).json({ error: 'Missing name' });
      return;
    }

    if (!type || !['folder', 'file', 'image'].includes(type)) {
      res.status(400).json({ error: 'Missing type' });
      return;
    }

    if (type !== 'folder' && !data) {
      res.status(400).json({ error: 'Missing data' });
      return;
    }

    if (parentId !== 0) {
      const parentFile = await (
        await dbClient.getCollection('files')
      ).findOne({ _id: new mongoDBCore.BSON.ObjectId(parentId) });

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

    const result = await (
      await dbClient.getCollection('files')
    ).insertOne(newFile);
    const fileId = result.insertedId.toString();

    fileQueue.add({ userId, fileId });

    res.status(201).json({
      id: fileId,
      ...newFile,
    });
  }

  static async getShow(req, res) {
    const { id } = req.params;
    const { userId } = req;

    const file = await (
      await dbClient.getCollection('files')
    ).findOne({ _id: new mongoDBCore.BSON.ObjectId(id), userId });

    if (!file) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    res.status(200).json({
      id,
      userId,
      name: file.name,
      type: file.type,
      isPublic: file.isPublic,
      parentId: file.parentId || 0,
    });
  }

  static async getIndex(req, res) {
    const { userId } = req;
    const parentId = req.query.parentId || 0;
    const page = parseInt(req.query.page, 10) || 0;
    const pageSize = 20;

    const pipeline = [
      { $match: { userId, parentId } },
      { $skip: page * pageSize },
      { $limit: pageSize },
      {
        $project: {
          _id: 0,
          id: '$_id',
          userId: '$userId',
          name: '$name',
          type: '$type',
          isPublic: '$isPublic',
          parentId: {
            $cond: { if: { $eq: ['$parentId', '0'] }, then: 0, else: '$parentId' },
          },
        },
      },
    ];

    const files = await (await dbClient.getCollection('files'))
      .aggregate(pipeline)
      .toArray();

    res.json(files);
  }

  static async putPublish(req, res) {
    const { id } = req.params;
    const { userId } = req;
    const filter = { _id: new mongoDBCore.BSON.ObjectId(id), userId };

    const file = await (await dbClient.getCollection('files')).findOne(filter);

    if (!file) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    await (
      await dbClient.getCollection('files')
    ).updateOne(filter, { $set: { isPublic: true } });

    res.status(200).json({
      id,
      userId,
      name: file.name,
      type: file.type,
      isPublic: true,
      parentId: file.parentId || 0,
    });
  }

  static async putUnpublish(req, res) {
    const { id } = req.params;
    const { userId } = req;

    const filter = { _id: new mongoDBCore.BSON.ObjectId(id), userId };

    const file = await (await dbClient.getCollection('files')).findOne(filter);

    if (!file) {
      res.status(404).json({ error: 'Not Found' });
      return;
    }

    await (
      await dbClient.getCollection('files')
    ).updateOne(filter, { $set: { isPublic: false } });

    res.status(200).json({
      id,
      userId,
      name: file.name,
      type: file.type,
      isPublic: false,
      parentId: file.parentId || 0,
    });
  }

  static async getFile(req, res) {
    const { size } = req.query;
    const fileId = req.params.id;

    const file = await (
      await dbClient.getCollection('files')
    ).findOne({ _id: new mongoDBCore.BSON.ObjectId(fileId) });

    if (!file) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    let fileLocation = file.localPath;

    if (size && ['500', '250', '100'].includes(size)) {
      fileLocation = `${file.localPath}_${size}`;
    }

    console.log(fileLocation);
    const token = req.header('X-Token');
    const userId = token ? await redisClient.get(`auth_${token}`) : null;

    if (!file.isPublic && (!userId || userId !== file.userId)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    if (file.type === 'folder') {
      res.status(400).json({ error: "A folder doesn't have content" });
      return;
    }

    if (!fs.existsSync(fileLocation)) {
      res.status(404).json({ error: 'Not found' });
      return;
    }

    const mimeType = mime.lookup(file.name) || 'application/octet-stream';
    const fileContent = fs.readFileSync(fileLocation);

    res.writeHead(200, {
      'Content-Type': mimeType,
      'Content-Disposition': `inline; filename=${file.name}`,
      'Content-Length': fileContent.length,
    });

    res.end(fileContent);
  }
}

export default FilesController;
