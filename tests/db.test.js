import { expect } from 'chai';
import dbClient from '../utils/db';

/* eslint-disable */
describe('dBClient', () => {
  before(function (done) {
    setTimeout(()=> {
      Promise.all([dbClient.getCollection('users'), dbClient.getCollection('files')])
      .then(([usersCollection, filesCollection]) => {
        Promise.all([usersCollection.deleteMany({}), filesCollection.deleteMany({})])
        .then(() => done())
        .catch((deleteErr) => done(deleteErr));
      }).catch((connectErr) => done(connectErr));
    }, 1000)
  });

  it('isAlive', async () => {
    expect(await dbClient.isAlive()).to.be.true;
  });

  it('nbUsers', async () => {
    expect(await dbClient.nbUsers()).to.equal(0);
  });

  it('nbFiles', async () => {
    expect(await dbClient.nbFiles()).to.equal(0);
  });
});
