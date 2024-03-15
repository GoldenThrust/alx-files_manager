import request from 'request';
import { expect } from 'chai';

/* eslint-disable */
describe("Files Controller", () => {
    it("postUpload", () => {
        request.post("http://localhost:5000/files/42343fefe", (req, res) => {

        })
    })
    it("getShow", () => {
        request.get("http://localhost:5000/users/files", (req, res) => {

        })
    })
})