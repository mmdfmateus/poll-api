import { DbAddAccount } from "./db-add-account";
import { Encrypter, AddAccountModel, AccountModel, AddAccountRepository } from "./db-add-account-protocols";

class EncrypterStub implements Encrypter{
  async encrypt(value: string): Promise<string> {
    return new Promise(resolve => resolve('hashed_value'));
  }
}

interface SutTypeValues {
  sut: DbAddAccount,
  encrypterStub: EncrypterStub,
  addAccountRepositoryStub: AddAccountRepository
}

const makeAddAccountRepository = (): AddAccountRepository => {
  class AddAccountRepositoryStub implements AddAccountRepository {
    async add(account: AddAccountModel): Promise<AccountModel> {
      const fakeAccount = {
        _id: 'valid_id',
        name: 'valid name',
        email: 'valid_email@mail.com',
        password: 'hashed_value'
      };
      return new Promise(resolve => resolve(fakeAccount));
    }
  }
  return new AddAccountRepositoryStub();
}

const makeSut = (): SutTypeValues => {
  const encrypterStub = new EncrypterStub();
  const addAccountRepositoryStub = makeAddAccountRepository();
  const sut = new DbAddAccount(encrypterStub, addAccountRepositoryStub);
  return {
    sut,
    encrypterStub,
    addAccountRepositoryStub
  };
}

describe('DbAddAccount UseCase', () => {
  test('Should call Encrypter with correct param', async () => {
    const { sut, encrypterStub } = makeSut();
    const encryptSpy = jest.spyOn(encrypterStub, 'encrypt');
    const accountData = {
      name: 'valid name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    };

    await sut.add(accountData);
    expect(encryptSpy).toHaveBeenCalledWith('valid_password');
  });

  test('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut();
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    );

    const accountData = {
      name: 'valid name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    };

    const promise = sut.add(accountData);
    await expect(promise).rejects.toThrow();
  });

  test('Should call AddAccountRepository with correct params', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');
    const accountData = {
      name: 'valid name',
      email: 'valid_email@mail.com',
      password: 'valid_password'
    };

    await sut.add(accountData);
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid name',
      email: 'valid_email@mail.com',
      password: 'hashed_value'
    });
  });
});