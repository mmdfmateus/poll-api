import { DbAddAccount } from "../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../infra/criptography/bcrypt-adapter";
import { AccountMongoRepository } from "../../infra/db/mongodb/account-repository/account";
import { LogMongoRepository } from "../../infra/db/mongodb/log-repository/log";
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
    const logRepository = new LogMongoRepository();
    return new LogControllerDecorator(signUpController, logRepository);
}