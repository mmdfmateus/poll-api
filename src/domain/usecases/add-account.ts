import { AccountModel } from "../models/account";

export interface AddAccountModel {
  name: String,
  email: String,
  password: String
}

export interface AddAccount {
  async add(account: AddAccountModel): Promise<AccountModel>;
}