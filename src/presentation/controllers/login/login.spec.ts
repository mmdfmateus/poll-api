import { MissingParamError } from "../../errors";
import { badRequest } from "../../helpers/http-helpers";
import { LoginController } from "./login";

const makeSut = () => {
    return new LoginController();
}

describe('Login Controller', async () => {
    test('Should return 400 if no email is provided', async () => {
        const sut = makeSut();
        const httpRequest = {
            body: {
                password: 'any_password'
            }
        }

        const response = await sut.handle(httpRequest);

        expect(response).toEqual(badRequest(new MissingParamError('email')));
    });

    test('Should return 400 if no password is provided', async () => {
        const sut = makeSut();
        const httpRequest = {
            body: {
                email: 'any_mail'
            }
        }

        const response = await sut.handle(httpRequest);

        expect(response).toEqual(badRequest(new MissingParamError('password')));
    });
});