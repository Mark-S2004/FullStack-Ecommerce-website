export enum EUserRole {
  ADMIN = "admin",
  CUSTOMER = "customer",
}

export interface IUser {
  name: string
  email: string
  password: string
  role: EUserRole
}
