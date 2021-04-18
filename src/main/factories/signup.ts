import { DbAddAccount } from "../../data/usecases/add-account/db-add-account";
import { BcryptAdapter } from "../../infra/criptography/bcrypt-adapter";
import { AccountMongoRepository } from "../../infra/db/mongodb/account-repository/account";
import { SignUpController } from "../../presentation/controllers/signup/signup";
import { EmailValidatorAdapter } from "../../validators/email-validator";


export const buildSignUpController = (): SignUpController => {
    const emailValidatorAdapter = new EmailValidatorAdapter();
    
    const salt = 12;
    const encrypter = new BcryptAdapter(salt);
    const accountRepository = new AccountMongoRepository();
    const addAccount = new DbAddAccount(encrypter, accountRepository);

    return new SignUpController(emailValidatorAdapter, addAccount);
}