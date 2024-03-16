import request from 'request';
import { expect } from 'chai';
import randomUserName from './utils/utils';

/* eslint-disable */
describe("Files Controller", () => {
    let email = "bob@gmail.com";
    let password = "Jordan";
    let auth = "Basic Ym9iQGdtYWlsLmNvbTpKb3JkYW4=";
    let token;

    before((done)=> {
        request.post("http://localhost:5000/users", {json: {email, password}}, (err, res, body) => {
            const options = {
                uri: "http://localhost:5000/connect",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth,
                },
            }
        
            request(options, (err, res, body) => {
                token = JSON.parse(body).token
                expect(res.statusCode).to.equal(200);
                expect(body).to.be.a("string");
                done();
            });
        })
    })

    it("postUpload", () => {
        const options = {
            uri: "http://localhost:5000/files",
            method: "POST",
            headers: {
                'Content-Type': 'application/json',
                'X-Token': token,
            },
            json: {
                name: `${randomUserName(5)}.txt`,
                type: "file",
                isPublic: true,
                data: randomUserName(10)
            }
        }

        request(options, (err, res, body) => {
            expect(res.statusCode).to.equal(201);
            expect(body).to.be.a("string");
        })
    })

    it("getIndex", () => {
        const options = {
            uri: "http://localhost:5000/files",
            headers: {
                'Content-Type': 'application/json',
                'X-Token': token,
            },
        }

        request(options, (req, res, body) => {
            expect(res.statusCode).to.equal(200);
        })
    })
})