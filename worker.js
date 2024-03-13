import Queue from 'bull';
import thumbnail from 'image-thumbnail';
import fs from 'fs';
import mongoDBCore from 'mongodb/lib/core';
import dbClient from './utils/db';

export const fileQueue = new Queue('fileQueue');
export const userQueue = new Queue('userQueue');

fileQueue.process(async (job) => {
  const { userId, fileId } = job.data;

  if (!fileId || !userId) {
    throw new Error('Missing fileId or userId');
  }

  const file = await (await dbClient.getCollection('files')).findOne({ _id: new mongoDBCore.BSON.ObjectId(fileId), userId });

  if (!file) {
    throw new Error('File not found');
  }

  const sizes = [500, 250, 100];

  const thumbnailPromises = sizes.map((size) => {
    const thumbnailPath = `${file.localPath}_${size}`;
    return thumbnail(file.localPath, { width: size }).then((res) => {
      fs.writeFileSync(thumbnailPath, res);
      return thumbnailPath;
    }).catch((error) => {
      console.error(`Error generating thumbnail (${size}): ${error.message}`);
      throw error;
    });
  });

  await Promise.all(thumbnailPromises);

  return { userId, fileId };
});

userQueue.process(async (job) => {
  const { userId } = job.data;

  if (!userId) {
    throw new Error('Missing userId');
  }

  const user = await (await dbClient.getCollection('users')).findOne({ _id: new mongoDBCore.BSON.ObjectId(userId) });

  if (!user) {
    throw new Error('User not found');
  }

  // sendWelcomeEmail(user.email);

  console.log(`Welcome ${user.email}!`);

  return { userId };
});

export default { fileQueue, userQueue };
