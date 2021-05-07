import { InvalidParamError, MissingParamError } from "../../errors";
import { badRequest } from "../../helpers/http-helpers";
import { EmailValidator } from "../signup/signup-protocols";
import { LoginController } from "./login";

interface SutTypes {
    sut: LoginController,
    emailValidatorStub: EmailValidator
}

const makeEmailValidator = (): EmailValidator => {
    class EmailValidatorStub implements EmailValidator {
        isValid(email: String): boolean {
            return true
        }
    }
    return new EmailValidatorStub();
}

const makeSut = (): SutTypes => {
    const emailValidatorStub = makeEmailValidator();
    const sut = new LoginController(emailValidatorStub);
    return { sut, emailValidatorStub };
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
        const httpRequest = {
            body: {
                email: 'any_mail@mail.com',
                password: 'any_password'
            }
        }

        await sut.handle(httpRequest);

        expect(isValidSpy).toBeCalledWith(httpRequest.body.email);
    });

    test('Should return 400 if invalid email is provided', async () => {
        const { sut, emailValidatorStub } = makeSut();
        jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);
        const httpRequest = {
            body: {
                email: 'invalid_mail@mail.com',
                password: 'any_password'
            }
        }

        const response = await sut.handle(httpRequest);

        expect(response).toEqual(badRequest(new InvalidParamError('email')));
    });
});