import { DbAddAccount } from "./db-add-account";
import { Encrypter, AddAccountModel, AccountModel, AddAccountRepository } from "./db-add-account-protocols";

class EncrypterStub implements Encrypter {
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
      return new Promise(resolve => resolve(makeAccount()));
    }
  }
  return new AddAccountRepositoryStub();
}

const makeAccount = (): AccountModel => ({
  id: 'valid_id',
  name: 'valid_name',
  email: 'valid_mail@email.com',
  password: 'valid_password'
});

const makeAccountData = (): AddAccountModel => ({
  name: 'valid name',
  email: 'valid_email@mail.com',
  password: 'valid_password'
});

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

    await sut.add(makeAccountData());
    expect(encryptSpy).toHaveBeenCalledWith('valid_password');
  });

  test('Should throw if Encrypter throws', async () => {
    const { sut, encrypterStub } = makeSut();
    jest.spyOn(encrypterStub, 'encrypt').mockReturnValueOnce(
      new Promise((resolve, reject) => reject(new Error()))
    );

    const promise = sut.add(makeAccountData());
    await expect(promise).rejects.toThrow();
  });

  test('Should call AddAccountRepository with correct params', async () => {
    const { sut, addAccountRepositoryStub } = makeSut();
    const addSpy = jest.spyOn(addAccountRepositoryStub, 'add');

    await sut.add(makeAccountData());
    expect(addSpy).toHaveBeenCalledWith({
      name: 'valid name',
      email: 'valid_email@mail.com',
      password: 'hashed_value'
    });
  });
});