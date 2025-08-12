import { plainToInstance, Transform, Type } from 'class-transformer';
import {
  IsString,
  IsNumber,
  IsOptional,
  validateSync,
  IsEnum,
} from 'class-validator';

enum Environment {
  Development = 'development',
  Production = 'production',
  Test = 'test',
}

class EnvironmentVariables {
  @IsEnum(Environment)
  @IsOptional()
  NODE_ENV: Environment = Environment.Development;

  @IsString()
  DB_HOST: string;

  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  DB_PORT: number = 5432;

  @IsString()
  DB_USERNAME: string;

  @IsString()
  @IsOptional()
  DB_PASSWORD: string;

  @IsString()
  DB_DATABASE: string;

  @IsString()
  JWT_SECRET: string;

  @IsString()
  @IsOptional()
  JWT_EXPIRES_IN: string = '1h';

  @IsNumber()
  @Transform(({ value }: { value: string }) => parseInt(value, 10))
  @IsOptional()
  PORT: number = 3000;
}

export function validateConfig(config: Record<string, unknown>) {
  const validatedConfig = plainToInstance(EnvironmentVariables, config, {
    enableImplicitConversion: true,
  });

  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(`Configuration validation failed: ${errors.toString()}`);
  }

  return validatedConfig;
}
