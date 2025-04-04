import { ApiProperty } from "@nestjs/swagger";
import {
  IsNotEmpty,
  IsOptional,
  IsString,
  Matches,
  MinLength,
  MaxLength,
  IsNumber,
  IsNumberString,
} from "class-validator";

export class AddOrganizationMemberDto {
  @MaxLength(50, { message: "First Name max size can be 50" })
  @MinLength(2, { message: "First Name size should be greater than 1" })
  @IsString({ message: "First Name should be a string " })
  @IsNotEmpty({ message: "First Name cannot be empty" })
  @ApiProperty()
  firstName: string;

  @MaxLength(50, { message: "Last Name max size can be 50" })
  @MinLength(2, { message: "Last Name size should be greater than 1" })
  @IsString({ message: "Last Name should be a string" })
  @IsOptional()
  @ApiProperty()
  lastName: string;

  @Matches(
    /^[^<>()[\]?"'|+=/{}\\,;:\%#^\s@\"$&!@]+@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z0-9]+\.)+[a-zA-Z]{2,}))$/,
    { message: "Email format is not correct" },
  )
  @IsNotEmpty({ message: "Email cannot be empty" })
  @ApiProperty()
  email: string;

  @MaxLength(200, { message: "Title max size can be 200" })
  @IsString({ message: "Title should be a string" })
  @IsNotEmpty({ message: "Title cannot be empty" })
  @IsOptional()
  @ApiProperty()
  title: string;

  @IsNotEmpty({ message: "RoleId cannot be empty" })
  @ApiProperty()
  @IsNumber()
  roleId: number;

  @IsNumberString()
  @MinLength(7)
  @MaxLength(13)
  @IsOptional()
  @ApiProperty()
  phone: string;
}
