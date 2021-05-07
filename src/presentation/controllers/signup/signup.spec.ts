import { SignUpController } from './signup';
import { MissingParamError, InvalidParamError, InternalServerError } from '../../errors';
import { EmailValidator, AccountModel, AddAccount, AddAccountModel } from './signup-protocols';
import { HttpRequest } from '../../protocols';
import { badRequest, internalServerError, ok } from '../../helpers/http-helpers';

interface SutTypes {
  sut: SignUpController,
  emailValidatorStub: EmailValidator,
  addAccountStub: AddAccount
}

const makeSut = (): SutTypes => {
  const emailValidatorStub = makeEmailValidatorStub();
  const addAccountStub = makeAddAccountStub();
  const sut = new SignUpController(emailValidatorStub, addAccountStub);
  return {
    sut,
    emailValidatorStub,
    addAccountStub
  };
}

const makeRequest = (): HttpRequest => ({
  body: {
    name: 'any name',
    email: 'any_mail@email.com',
    password: 'any_password',
    passwordConfirmation: 'any_password'
  }
});

const makeEmailValidatorStub = (): EmailValidator => {
  class EmailValidatorStub implements EmailValidator {
    isValid(email: String): boolean {
      return true;
    }
  }

  return new EmailValidatorStub();
}

const makeAddAccountStub = (): AddAccount => {
  class AddAccountStub implements AddAccount {
    async add(account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = makeAccount();
      return new Promise(resolve => resolve(fakeAccount));
    }
  }

  return new AddAccountStub();
}

const makeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_mail@email.com',
  password: 'valid_password'
});

describe('SignUp Controller', () => {
  test('Should return 400 if no name is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        email: 'any_mail@email.com',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    };

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('name')));
  });

  test('Should return 400 if no email is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any name',
        password: 'any_password',
        passwordConfirmation: 'any_password'
      }
    };

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('email')));
  });

  test('Should return 400 if no password is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_mail@email.com',
        passwordConfirmation: 'any_password'
      }
    };

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('password')));
  });

  test('Should return 400 if no passwordConfirmation is provided', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_mail@email.com',
        password: 'any_password',
      }
    };

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new MissingParamError('passwordConfirmation')));
  });

  test('Should return 400 if passwordConfirmation is invalid', async () => {
    const { sut } = makeSut();
    const httpRequest = {
      body: {
        name: 'any name',
        email: 'any_mail@email.com',
        password: 'any_password',
        passwordConfirmation: 'invalid_password'
      }
    };

    const httpResponse = await sut.handle(httpRequest);
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('passwordConfirmation')));
  });

  test('Should return 400 if an invalid email is provided', async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, 'isValid').mockReturnValueOnce(false);

    const httpResponse = await sut.handle(makeRequest());
    expect(httpResponse).toEqual(badRequest(new InvalidParamError('email')));
  });

  test('Should call EmailValidator with correct param', async () => {
    const { sut, emailValidatorStub } = makeSut();
    const isValidSpy = jest.spyOn(emailValidatorStub, 'isValid');

    await sut.handle(makeRequest());
    expect(isValidSpy).toHaveBeenCalledWith(makeRequest().body.email);
  });

  test('Should return 500 if EmailValidator throws', async () => {
    const { sut, emailValidatorStub } = makeSut();
    jest.spyOn(emailValidatorStub, 'isValid').mockImplementationOnce(() => {
      throw new Error();
    });

    const httpResponse = await sut.handle(makeRequest());
    expect(httpResponse).toEqual(internalServerError(new InternalServerError(null)));
  });

  test('Should call AddAcount with corrects params', async () => {
    const { sut, addAccountStub } = makeSut();
    const addSpy = jest.spyOn(addAccountStub, 'add');

    await sut.handle(makeRequest());
    expect(addSpy).toHaveBeenCalledWith({
      name: 'any name',
      email: 'any_mail@email.com',
      password: 'any_password'
    });
  });

  test('Should return 500 if AddAcount throws', async () => {
    const { sut, addAccountStub } = makeSut();
    jest.spyOn(addAccountStub, 'add').mockImplementationOnce(async () => {
      return new Promise((resolve, reject) => reject(new Error()));
    });

    const httpResponse = await sut.handle(makeRequest());
    expect(httpResponse).toEqual(internalServerError(new InternalServerError(null)));
  });

  test('Should return 200 if valid data is provided', async () => {
    const { sut } = makeSut();

    const httpResponse = await sut.handle(makeRequest());
    expect(httpResponse).toEqual(ok(makeAccount()));
  });
});