import { IsEmail, IsString } from 'class-validator';

export class CreateUserDto {
  @IsString()
  public name: string;

  @IsEmail()
  public email: string;

  @IsString()
  public password: string;

  @IsString()
  public role: string;
}

export class loginUserDto {
  @IsEmail()
  public email: string;

  @IsString()
  public password: string;
}
