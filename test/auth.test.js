process.env.NODE_ENV = "test";

const chai = require("chai");
const expect = chai.expect;
const request = require("supertest");
const app = require("../app");
const User = require("../models/User");

describe("Auth API", () => {
    // Clean users before tests
    before(async () => {
        await User.deleteMany({});
    });

    it("should register a user", async () => {
        const res = await request(app)
            .post("/api/auth/register")
            .send({ username: "testuser", password: "password123" });

        expect(res.status).to.equal(201);
        expect(res.body).to.have.property("message", "User registered successfully");
    });

    it("should login a user and return a token", async () => {
        const res = await request(app)
            .post("/api/auth/login")
            .send({ username: "testuser", password: "password123" });

        expect(res.status).to.equal(200);
        expect(res.body).to.have.property("token");
    });
});
