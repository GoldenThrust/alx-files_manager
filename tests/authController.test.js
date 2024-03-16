import request from 'request';
import { expect } from 'chai';

/* eslint-disable */
describe("Auth Controller", () => {
    let email = "bob@gmail.com";
    let password = "Jordan";
    let auth = "Basic Ym9iQGdtYWlsLmNvbTpKb3JkYW4=";
    let token;

    before((done)=> {
        request.post("http://localhost:5000/users", {json: {email, password}}, (err, res) => {
            done()
        })
    })

    it("getConnect", () => {
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

    it("getDisconnect", () => {
        setTimeout(()=>{
            const options = {
                uri: "http://localhost:5000/disconnect",
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': auth,
                    'X-Token': token,
                },
            }
            request(options, (err, res, body) => {
                expect(res.statusCode).to.equal(204);
            });
        }, 1000)
    })
})