import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { Day17ConfigModuleScopeModule } from './../src/day-17-config-module-scope.module';

// 這支測試是「有沒有修好」的判定條件：
// 起始（壞掉的）狀態下模組根本編不起來，compile() 就會拋出
// UnknownDependenciesException，這是刻意的。套用解法一或解法二之後才會轉綠。
describe('Day17ConfigModuleScopeModule (e2e)', () => {
  let moduleFixture: TestingModule;

  // 不依賴 repo 根目錄的 .env：@nestjs/config 只會填入 process.env 裡還不存在的 key，
  // 所以先設好，測試就跟 .env 存不存在無關。
  beforeAll(() => {
    process.env.DB_NAME = ':memory:';
    process.env.DB_LOGGING = 'false';
  });

  afterEach(async () => {
    await moduleFixture?.close();
  });

  it('ConfigService 的值有進到 forRootAsync 的 useFactory', async () => {
    moduleFixture = await Test.createTestingModule({
      imports: [Day17ConfigModuleScopeModule],
    }).compile();

    await moduleFixture.init();

    // 連線真的建立起來了，而且用的是 ConfigService 讀出來的設定，
    // 代表 useFactory 確實拿到了 ConfigService
    const dataSource = moduleFixture.get(DataSource);

    expect(dataSource.isInitialized).toBe(true);
    expect(dataSource.options.database).toBe(':memory:');
  });
});
