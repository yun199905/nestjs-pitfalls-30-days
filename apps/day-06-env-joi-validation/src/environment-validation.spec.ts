import {
  ConfigModule,
  type ConfigModuleOptions,
  ConfigService,
} from '@nestjs/config';
import { Test, TestingModule } from '@nestjs/testing';
import * as Joi from 'joi';
import { validateEnvironment } from './env.validation';

interface EnvironmentVariables {
  PORT: number;
}

describe('ConfigService 與環境變數驗證', () => {
  const originalPort = process.env.PORT;
  const joiSchema = Joi.object<EnvironmentVariables>({
    PORT: Joi.number().port().default(3000),
  });
  const modules: TestingModule[] = [];

  beforeEach(() => {
    process.env.PORT = '3000';
  });

  afterEach(async () => {
    await Promise.all(modules.splice(0).map((module) => module.close()));
  });

  afterAll(() => {
    if (originalPort === undefined) {
      delete process.env.PORT;
      return;
    }

    process.env.PORT = originalPort;
  });

  async function createConfigService(
    validationOptions: Pick<
      ConfigModuleOptions,
      'validationSchema' | 'validate'
    > = {},
  ): Promise<ConfigService> {
    const configModule = await ConfigModule.forRoot({
      ignoreEnvFile: true,
      ...validationOptions,
    });
    const testingModule = await Test.createTestingModule({
      imports: [configModule],
    }).compile();

    modules.push(testingModule);
    return testingModule.get(ConfigService);
  }

  it('沒有驗證時，get<number>() 在執行期仍回傳 string', async () => {
    const configService = await createConfigService();
    const port = configService.get<number>('PORT');

    expect(port).toBe('3000');
    expect(typeof port).toBe('string');
    expect(port + 1).toBe('30001');
  });

  it('啟用 Joi schema 後，ConfigService 回傳真正的 number', async () => {
    const configService = await createConfigService({
      validationSchema: joiSchema,
    });
    const port = configService.get<number>('PORT');

    expect(port).toBe(3000);
    expect(typeof port).toBe('number');
    expect(port + 1).toBe(3001);
  });

  it('啟用 custom validate 後，ConfigService 回傳函式轉換的 number', async () => {
    const configService = await createConfigService({
      validate: validateEnvironment,
    });
    const port = configService.get<number>('PORT');

    expect(port).toBe(3000);
    expect(typeof port).toBe('number');
    expect(port + 1).toBe(3001);
  });

  it('兩種解法都會套用 number 預設值', () => {
    const joiResult = joiSchema.validate({});
    const customResult = validateEnvironment({});

    if (joiResult.error) {
      throw joiResult.error;
    }

    const joiValue = joiResult.value as EnvironmentVariables;

    expect(joiValue.PORT).toBe(3000);
    expect(typeof joiValue.PORT).toBe('number');
    expect(customResult.PORT).toBe(3000);
    expect(typeof customResult.PORT).toBe('number');
  });

  it.each(['not-a-number', ''])('兩種解法都拒絕非數字內容 %p', (port) => {
    expect(joiSchema.validate({ PORT: port }).error).toBeDefined();
    expect(() => validateEnvironment({ PORT: port })).toThrow();
  });

  it.each(['-1', '70000'])('兩種解法都拒絕超出範圍的值 %p', (port) => {
    expect(joiSchema.validate({ PORT: port }).error).toBeDefined();
    expect(() => validateEnvironment({ PORT: port })).toThrow();
  });

  it('custom validate 回傳轉換後的 PORT，而不是原始字串', () => {
    const validatedConfig = validateEnvironment({ PORT: '3000' });

    expect(validatedConfig).toEqual({ PORT: 3000 });
  });
});
