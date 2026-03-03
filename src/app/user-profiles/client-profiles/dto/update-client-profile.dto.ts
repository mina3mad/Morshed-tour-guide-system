import { IsOptional, IsString, MaxLength } from 'class-validator';
import { i18nValidationMessage } from 'nestjs-i18n';

export class UpdateClientProfileDto {
  @IsOptional()
  @IsString({ message: i18nValidationMessage('validations.mustBeString') })
  @MaxLength(100, { message: i18nValidationMessage('validations.nameMaxLength') })
  name?: string;

//   @IsOptional()
//   @IsString({ message: i18nValidationMessage('validations.mustBeString') })
//   image?:string;
}