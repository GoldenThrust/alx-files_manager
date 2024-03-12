import Queue from 'bull';
import thumbnail from 'image-thumbnail';
import fs from 'fs';
import path from 'path';
import dbClient from './utils/db';
import mongoDBCore from 'mongodb/lib/core';


export const fileQueue = new Queue('fileQueue');
export const userQueue = new Queue('userQueue');

fileQueue.process(async (job, done) => {
    const { userId, fileId } = job.data;

    if (!fileId || !userId) {
        throw new Error('Missing fileId or userId');
    }

    const file = await (await dbClient.getCollection('files')).findOne({ _id: new mongoDBCore.BSON.ObjectId(fileId), userId });

    if (!file) {
        throw new Error('File not found');
    }

    const sizes = [500, 250, 100];

    for (const size of sizes) {
        const thumbnailPath = `${file.localPath}_${size}`;

        try {
            const thumbnailBuffer = await thumbnail(file.localPath, { width: size });
            fs.writeFileSync(thumbnailPath, thumbnailBuffer);
        } catch (error) {
            console.error(`Error generating thumbnail (${size}): ${error.message}`);
        }
    }

    return { userId, fileId };
})



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