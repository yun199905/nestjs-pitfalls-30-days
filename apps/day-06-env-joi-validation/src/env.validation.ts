import { plainToInstance } from 'class-transformer';
import { IsInt, Max, Min, validateSync } from 'class-validator';

class EnvironmentVariables {
  @IsInt()
  @Min(0)
  @Max(65535)
  PORT!: number;
}

export function validateEnvironment(
  config: Record<string, unknown>,
): Record<string, unknown> {
  const rawPort = config.PORT ?? 3000;

  if (typeof rawPort === 'string' && rawPort.trim() === '') {
    throw new Error('PORT must be a number');
  }

  const configWithDefaults = {
    ...config,
    PORT: rawPort,
  };
  const validatedConfig = plainToInstance(
    EnvironmentVariables,
    configWithDefaults,
    { enableImplicitConversion: true },
  );
  const errors = validateSync(validatedConfig, {
    skipMissingProperties: false,
  });

  if (errors.length > 0) {
    throw new Error(errors.toString());
  }

  return {
    ...config,
    PORT: validatedConfig.PORT,
  };
}
