import request from 'request';
import { expect } from 'chai';
import randomUserName from './utils/utils';

/* eslint-disable */
describe("Users Controller", () => {
    const email = randomUserName(5) + "@gmail.com";
    const password = "Jordan";
    const credentials = `${email}:${password}`;
    let token;

    const auth = "Basic " + Buffer.from(credentials, 'utf-8').toString('base64');
    it("PostNew", () => {
        request.post("http://localhost:5000/users", {json: {email, password}}, (err, res, body) => {
            expect(res.statusCode).to.equal(201);
            expect(body).to.be.a("string");
        })

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
        });
    })
    it("getMe", () => {
        setTimeout(()=> {
            const options = {
                uri: "http://localhost:5000/users/me",
                headers: {
                    'Content-Type': 'application/json',
                    'X-Token': token,
                },
            }
        
            request(options, (err, res, body) => {
                let resEmail = JSON.parse(body).email;
                expect(res.statusCode).to.equal(200);
                expect(resEmail).to.be.equal(email);
            });
        }, 1000)
    })
})