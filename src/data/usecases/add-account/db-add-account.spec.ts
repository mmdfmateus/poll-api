import { DbAddAccount } from "./db-add-account";
import { Encrypter } from "../../protocols/encrypter";

class EncrypterStub implements Encrypter{
  async encrypt(value: string): Promise<string> {
    return new Promise(resolve => resolve('hashed_value'));
  }
}

interface SutTypeValues {
  sut: DbAddAccount,
  encrypterStub: EncrypterStub
}

const makeSut = (): SutTypeValues => {
  const encrypterStub = new EncrypterStub();
  const sut = new DbAddAccount(encrypterStub);
  return {
    sut,
    encrypterStub
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

    sut.add(accountData);
    expect(encryptSpy).toHaveBeenCalledWith('valid_password');
  });
});