import { resolve } from "path";
import { LogErrorRepository } from "../../data/protocols/log-error-repository";
import { internalServerError } from "../../presentation/helpers/http-helpers";
import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

class ControllerStub implements Controller {
    handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        return new Promise(resolve => resolve({ statusCode: 200, body: {} }))
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

describe('Log Controller Decorator', async () => {
    test('Should call controller handle', async () => {
        const { sut, controllerStub } = makeSut();
        const handleSpy = jest.spyOn(controllerStub, 'handle');

        const httpRequest = {
            body: {
                email: 'any_mail@mail.com',
                name: 'any name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        };

        await sut.handle(httpRequest);

        expect(handleSpy).toHaveBeenCalledWith(httpRequest);
    });

    test('Should return same result as the controller', async () => {
        const { sut } = makeSut();

        const httpRequest = {
            body: {
                email: 'any_mail@mail.com',
                name: 'any name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        };

        const response = await sut.handle(httpRequest);

        expect(response).toEqual({ statusCode: 200, body: {} });
    });

    test('Should call LogErrorRepository with correct param if returns a server error', async () => {
        const { sut, controllerStub, logErrorRepositoryStub } = makeSut();
        const errorMock = new Error();
        errorMock.stack = 'error stack';
        const error = internalServerError(errorMock);
        jest.spyOn(controllerStub, 'handle').mockReturnValueOnce(new Promise(resolve => resolve(error)))
        const logSpy = jest.spyOn(logErrorRepositoryStub, 'log')

        const httpRequest = {
            body: {
                email: 'any_mail@mail.com',
                name: 'any name',
                password: 'any_password',
                passwordConfirmation: 'any_password'
            }
        };

        await sut.handle(httpRequest);

        expect(logSpy).toHaveBeenCalledWith('error stack');
    });
});