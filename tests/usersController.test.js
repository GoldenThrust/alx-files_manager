import request from 'request';
import { expect } from 'chai';

/* eslint-disable */
describe("Users Controller", () => {
    it("PostNew", () => {
        request.post("http://localhost:5000/PostNew", (req, res) => {

        })
    })
    it("getMe", () => {
        request.get("http://localhost:5000/users/me", (req, res) => {

        })
    })
})