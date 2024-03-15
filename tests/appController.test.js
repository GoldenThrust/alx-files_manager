import request from 'request';
import { expect } from 'chai';

/* eslint-disable */
describe("App Controller", () => {

    it("status", () => {
        request.get("http://localhost:5000/status", (err, res, body) => {
            expect(res.statusCode).to.equal(200);
            expect(body).to.be.a("string");
            expect(body).to.be.equal('{"redis":true,"db":true}');
        });
    })

    it("stats", () => {
        request.get("http://localhost:5000/stats", (err, res, body) => {
            expect(res.statusCode).to.equal(200);
            expect(body).to.be.a("string");
        });
    })
})