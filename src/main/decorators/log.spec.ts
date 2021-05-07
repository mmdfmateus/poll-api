import { resolve } from "path";
import { LogErrorRepository } from "../../data/protocols/log-error-repository";
import { AccountModel } from "../../domain/models/account";
import { internalServerError, ok } from "../../presentation/helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

class ControllerStub implements Controller {
    handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        return new Promise(resolve => resolve(ok(makeAccount())))
    }
}

class LogErrorRepositoryStub implements LogErrorRepository {
    async log(stack: string): Promise<void> {
        return new Promise(resolve => resolve());
    }
}

interface SutTypes {
    sut: LogControllerDecorator,
    controllerStub: ControllerStub,
    logErrorRepositoryStub: LogErrorRepositoryStub
}

const makeSut = (): SutTypes => {
    const controllerStub = new ControllerStub();
    const logErrorRepositoryStub = new LogErrorRepositoryStub();
    const sut = new LogControllerDecorator(controllerStub, logErrorRepositoryStub);

    return {
        sut,
        controllerStub,
        logErrorRepositoryStub
    }
}

const makeRequest = (): HttpRequest => ({
    body: {
        name: 'any name',
        email: 'any_mail@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
    }
});

const makeAccount = (): AccountModel => ({
    id: 'valid_id',
    name: 'valid_name',
    email: 'valid_mail@email.com',
    password: 'valid_password'
});

function makeInternalServerError(): HttpResponse {
    const errorMock = new Error();
    errorMock.stack = 'error stack';
    const error = internalServerError(errorMock);
    return error;
}

describe('Log Controller Decorator', async () => {
    test('Should call controller handle', async () => {
        const { sut, controllerStub } = makeSut();
        const handleSpy = jest.spyOn(controllerStub, 'handle');

        await sut.handle(makeRequest());

        expect(handleSpy).toHaveBeenCalledWith(makeRequest());
    });

    test('Should return same result as the controller', async () => {
        const { sut } = makeSut();

        const response = await sut.handle(makeRequest());

        expect(response).toEqual(ok(makeAccount()));
    });

    test('Should call LogErrorRepository with correct param if returns a server error', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
        const error = makeInternalServerError();
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(error)))
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')

        await sut.handle(makeRequest());

        expect(logSpy).toHaveBeenCalledWith('error stack');
    });
});
