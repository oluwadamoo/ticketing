import request from 'supertest';
import { MongoMemoryServer } from 'mongodb-memory-server'
import mongoose from 'mongoose'
import jwt from 'jsonwebtoken'

jest.mock('../nats-wrapper')

declare global {
    var signin: () => string[];
}



let mongo: any;
beforeAll(async () => {
    process.env.JWT_KEY = 'werss'
    process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';

    mongo = await MongoMemoryServer.create();
    const mongoUri = mongo.getUri();

    mongoose.set('strictQuery', false)

    await mongoose.connect(mongoUri);
})

beforeEach(async () => {
    jest.clearAllMocks();
    const collections = await mongoose.connection.db.collections();

    for (let collection of collections) {
        await collection.deleteMany({})
    }
});

afterAll(async () => {
    await mongo.stop()
    await mongoose.connection.close()
})

global.signin = () => {
    //    Build a JWT payload. {id, email}
    const payload = {
        id: new mongoose.Types.ObjectId().toHexString(),
        email: 'test@test.com'
    }

    // Create the JWT
    const token = jwt.sign(payload, process.env.JWT_KEY!)

    // Build session object. {jwt: MY_JWT}
    const session = { jwt: token }

    //  Turn that session into JSON
    const sessionJSON = JSON.stringify(session);

    // Take JSON and encode it as base64
    const base64 = Buffer.from(sessionJSON).toString('base64')

    // Return a string that is the cookie with the encoded data
    return [`session=${base64} path=/; httponly`]
}