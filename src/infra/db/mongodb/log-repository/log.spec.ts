import { Collection } from "mongodb";
import { MongoHelper } from "../helpers/mongo-helper";
import { LogMongoRepository } from "./log";

const makeSut = () => {
    const sut = new LogMongoRepository();

    return sut;
}

describe('Log Mongo Repository', async () => {
    let errorCollection: Collection;

    beforeAll(async () => {
        await MongoHelper.connect(process.env.MONGO_URL);
    });

    afterAll(async () => {
        await MongoHelper.disconnect();
    });

    beforeEach(async () => {
        errorCollection = await MongoHelper.getCollection('errors');
        await errorCollection.deleteMany({});
    });

    test('Should add log on collection on success', async () => {
        const sut = makeSut();

        await sut.logError('error stack');

        const count = await errorCollection.countDocuments();
        expect(count).toBe(1);
    });
});