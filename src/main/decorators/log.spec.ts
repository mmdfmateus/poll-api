import { Controller, HttpRequest, HttpResponse } from "../../presentation/protocols";
import { LogControllerDecorator } from "./log";

class ControllerStub implements Controller {
    handle(httpRequest: HttpRequest): Promise<HttpResponse> {
        return new Promise(resolve => resolve({ statusCode: 200, body: {} }))
    }
}

interface SutTypes {
    sut: LogControllerDecorator,
    controllerStub: ControllerStub
}

const makeSut = (): SutTypes => {
    const controllerStub = new ControllerStub();
    const sut = new LogControllerDecorator(controllerStub);

    return {
        sut,
        controllerStub
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
});