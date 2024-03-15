import request from 'request';
import { expect } from 'chai';

/* eslint-disable */
describe("Auth Controller", () => {
    it("getConnect", () => {
        request.get("http://localhost:5000/connect", (err, res, body) => {
        });
    })
    it("getDisconnect", () => {
        request.get("http://localhost:5000/disconnect", (err, res, body) => {
        });
    })
})