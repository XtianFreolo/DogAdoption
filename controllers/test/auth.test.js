process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Auth API", () => {
    before(async () => {
        await User.deleteMany({});
    });

    after(async () => {
        await mongoose.connection.close();
    });

    it("should register a user", (done) => {
        chai
            .request(app)
            .post("/api/auth/register")
            .send({ username: "testuser", password: "password123" })
            .end((err, res) => {
                expect(res).to.have.status(201);
                done();
            });
    });

    it("should login a user and return a token", (done) => {
        chai
            .request(app)
            .post("/api/auth/login")
            .send({ username: "testuser", password: "password123" })
            .end((err, res) => {
                expect(res).to.have.status(200);
                expect(res.body).to.have.property("token");
                done();
            });
    });
});
