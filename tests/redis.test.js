import { expect } from 'chai';
import RedisClient from '../utils/redis';

/* eslint-disable */
describe('redisClient', () => {
  it('isAlive', () => {
    expect(RedisClient.isAlive()).to.be.true;
  });

  it('set, get and del', async () => {
    await RedisClient.set('foo', 'bar', 100);
    expect(await RedisClient.get('foo')).to.equal('bar');
    await RedisClient.del('foo');
    expect(await RedisClient.get('foo')).to.be.null;
  });
});
