process.env.NODE_ENV = "test";

const chai = require("chai");
const chaiHttp = require("chai-http");
const app = require("../app");
const mongoose = require("mongoose");
const User = require("../models/User");
const Dog = require("../models/Dog");

const expect = chai.expect;
chai.use(chaiHttp);

describe("Dog API", () => {
    let ownerToken;
    let adopterToken;
    let dogId;

    before(async () => {
        await User.deleteMany({});
        await Dog.deleteMany({});

        // register ownerUser
        await chai
            .request(app)
            .post("/api/auth/register")
            .send({ username: "ownerUser", password: "password123" });

        // register adopterUser
        await chai
            .request(app)
            .post("/api/auth/register")
            .send({ username: "adopterUser", password: "password123" });

        // login ownerUser
        const ownerRes = await chai
            .request(app)
            .post("/api/auth/login")
            .send({ username: "ownerUser", password: "password123" });

        ownerToken = ownerRes.body.token;

        // login adopterUser
        const adopterRes = await chai
            .request(app)
            .post("/api/auth/login")
            .send({ username: "adopterUser", password: "password123" });

        adopterToken = adopterRes.body.token;
    });

    after(async () => {
        await mongoose.connection.close();
    });

    it("should allow owner to register a dog", async () => {
        const res = await chai
            .request(app)
            .post("/api/dogs")
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({
                name: "Rex",
                description: "Very good boy",
                breed: "Lab",
                age: 2,
            });

        expect(res).to.have.status(201);
        expect(res.body).to.have.property("_id");
        expect(res.body).to.have.property("status", "available");
        dogId = res.body._id;
    });

    it("should prevent owner from adopting their own dog", async () => {
        const res = await chai
            .request(app)
            .post(`/api/dogs/${dogId}/adopt`)
            .set("Authorization", `Bearer ${ownerToken}`)
            .send({ message: "I should not be able to do this" });

        expect(res).to.have.status(403);
        expect(res.body).to.have.property(
            "message",
            "You cannot adopt a dog you registered"
        );
    });

    it("should allow another user to adopt the dog", async () => {
        const res = await chai
            .request(app)
            .post(`/api/dogs/${dogId}/adopt`)
            .set("Authorization", `Bearer ${adopterToken}`)
            .send({ message: "Thank you for sharing Rex!" });

        expect(res).to.have.status(200);
        expect(res.body).to.have.property("status", "adopted");
        expect(res.body).to.have.property(
            "adoptionMessage",
            "Thank you for sharing Rex!"
        );
    });

    it("should prevent adopting an already adopted dog", async () => {
        const res = await chai
            .request(app)
            .post(`/api/dogs/${dogId}/adopt`)
            .set("Authorization", `Bearer ${adopterToken}`)
            .send({ message: "Trying again" });

        expect(res).to.have.status(400);
        expect(res.body).to.have.property(
            "message",
            "Dog has already been adopted"
        );
    });
});
