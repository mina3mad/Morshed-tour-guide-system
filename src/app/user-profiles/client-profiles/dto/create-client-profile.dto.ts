import { IsNotEmpty, IsOptional, IsString } from "class-validator";
import { i18nValidationMessage } from "nestjs-i18n";

export class CreateClientProfileDto {
  @IsNotEmpty({ message: i18nValidationMessage('validations.nameNotEmpty') })
  @IsString()
  name: string;

  @IsOptional()
  @IsString()
  country?: string;
}