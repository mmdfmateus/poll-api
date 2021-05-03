import { DbAddAccount } from "../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../infra/criptography/bcrypt-adapter";
import { AccountMongoRepository } from "../../infra/db/mongodb/account-repository/account";
import { SignUpController } from "../../presentation/controllers/signup/signup";
import { Controller } from "../../presentation/protocols";
import { EmailValidatorAdapter } from "../../validators/email-validator";
import { LogControllerDecorator } from "../decorators/log";


export const buildSignUpController = (): Controller => {
    const emailValidatorAdapter = new EmailValidatorAdapter();

    const salt = 12;
    const encrypter = new BcryptAdapter(salt);
    const accountRepository = new AccountMongoRepository();
    const addAccount = new DbAddAccount(encrypter, accountRepository);

    const signUpController = new SignUpController(emailValidatorAdapter, addAccount);
    return new LogControllerDecorator(signUpController);
}