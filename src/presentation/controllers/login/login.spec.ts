import { resolve } from "path";
import { Authentication } from "../../../domain/usecases/authentication";
import { InvalidParamError, MissingParamError } from "../../errors";
import { badRequest, internalServerError } from "../../helpers/http-helpers";
import { EmailValidator, HttpRequest } from "../signup/signup-protocols";
import { LoginController } from "./login";

interface SutTypes {
    sut: LoginController,
    emailValidatorStub: EmailValidator,
    authenticationStub: Authentication
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: string): boolean {
            return true
        }
    }
    return new EmailValidatorStub();
}

const makeAuthentication = (): Authentication => {
    class AuthenticationStub implements Authentication {
        async auth(email: string, password: string): Promise<string> {
            return new Promise(resolve => resolve('any_token'))
        }
    }
    return new AuthenticationStub();
}

const makeRequest = (): HttpRequest => ({
    body: {
        email: 'any_mail@mail.com',
        password: 'any_password'
    }
});

const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const authenticationStub = makeAuthentication();
    const sut = new LoginController(emailValidatorStub, authenticationStub);
    return { sut, emailValidatorStub, authenticationStub };
}

describe('Login Controller', async () => {
    test('Should return 400 if no email is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                password: 'any_password'
            }
        }

        const response = await sut.handle(httpRequest);

        expect(response).toEqual(badRequest(new MissingParamError('email')));
    });

    test('Should return 400 if no password is provided', async () => {
        const { sut } = makeSut();
        const httpRequest = {
            body: {
                email: 'any_mail@mail.com'
            }
        }

        const response = await sut.handle(httpRequest);

        expect(response).toEqual(badRequest(new MissingParamError('password')));
    });

    test('Should call email validator with correct param', async () => {
        const { sut, emailValidatorStub } = makeSut();
        const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

        await sut.handle(makeRequest());

        expect(isValidSpy).toBeCalledWith(makeRequest().body.email);
    });

    test('Should return 400 if invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

        const response = await sut.handle(makeRequest());

        expect(response).toEqual(badRequest(new InvalidParamError('email')));
    });

    test('Should return 500 if EmailValidator throws', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => { throw new Error() });

        const response = await sut.handle(makeRequest());

        expect(response).toEqual(internalServerError(new Error()));
    });

    test('Should call Authentication with correct params', async () => {
        const { sut, authenticationStub } = makeSut();
        const authSpy = jest.spyOn(authenticationStub, 'auth');

        await sut.handle(makeRequest());

        expect(authSpy).toBeCalledWith(makeRequest().body.email, makeRequest().body.password);
    });
});