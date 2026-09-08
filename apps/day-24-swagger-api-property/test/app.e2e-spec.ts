import { INestApplication, ValidationPipe } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Day24SwaggerApiPropertyModule } from './../src/day-24-swagger-api-property.module';

type SchemaProperties = Record<string, Record<string, unknown>>;

describe('Day24SwaggerApiPropertyController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day24SwaggerApiPropertyModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    app.useGlobalPipes(new ValidationPipe());
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  // ValidationPipe 沒有開 whitelist，所以不論 schema 多殘缺，handler 都收得到完整 JSON。
  const body = {
    title: 'NestJS Swagger Debug',
    content: 'runtime 仍然可以收到這個欄位',
    tags: ['nestjs', 'swagger'],
    relatedPostIds: [23, 24],
    publishOptions: { notifyFollowers: true },
  };

  function createDocument() {
    const config = new DocumentBuilder().setTitle('Day 24').build();

    return SwaggerModule.createDocument(app, config);
  }

  function properties(schemaName: string): SchemaProperties {
    const schema = createDocument().components?.schemas?.[schemaName];

    return (schema as { properties: SchemaProperties }).properties;
  }

  const UPDATE_VARIANTS = [
    'missing-decorator',
    'untyped-array',
    'nested-interface',
    'plain-partial',
    'correct',
  ] as const;

  it.each(UPDATE_VARIANTS)(
    'PATCH /posts/:id/%s 在 runtime 收到完整 body（五支端點的 runtime 行為一致）',
    (variant) => {
      return request(app.getHttpServer() as App)
        .patch(`/posts/24/${variant}`)
        .send(body)
        .expect(200)
        .expect({ id: '24', variant, ...body });
    },
  );

  it('問題一：沒掛 @ApiProperty() 的 property 在 schema 裡完全不存在', () => {
    const brokenProperties = properties('MissingDecoratorUpdatePostDto');

    expect(brokenProperties).not.toHaveProperty('content');

    // 其餘欄位一律正確 —— 這支端點只壞在一個地方
    expect(Object.keys(brokenProperties)).toEqual([
      'title',
      'tags',
      'relatedPostIds',
      'publishOptions',
    ]);
    expect(brokenProperties.publishOptions).toEqual({
      $ref: '#/components/schemas/PublishOptionsDto',
    });
  });

  it('問題二：array 沒指定 items 型別時一律預設 string，number[] 因此被寫錯', () => {
    const brokenProperties = properties('UntypedArrayUpdatePostDto');

    // items 預設 string，所以 string[] 剛好被寫對 —— 歪打正著。
    expect(brokenProperties.tags).toMatchObject({
      type: 'array',
      items: { type: 'string' },
    });

    // 同一個預設值套在 number[] 上就默默寫錯了
    expect(brokenProperties.relatedPostIds).toMatchObject({
      type: 'array',
      items: { type: 'string' },
    });

    // 對照正解：明確給 type: [Number] 才會是 number
    expect(properties('UpdatePostDto').relatedPostIds).toMatchObject({
      type: 'array',
      items: { type: 'number' },
    });
  });

  it('問題三：巢狀型別宣告成 interface，runtime 擦除後只剩 type: object 空殼', () => {
    const document = createDocument();
    const brokenProperties = properties('NestedInterfaceUpdatePostDto');

    expect(brokenProperties.publishOptions).toEqual({ type: 'object' });

    // interface 編譯後不留痕跡，components 裡不會有它的 schema
    expect(document.components?.schemas).not.toHaveProperty(
      'BrokenPublishOptions',
    );
  });

  it('問題四：用 TypeScript 的 Partial<T> 當 body 型別，Swagger 連 requestBody 都不產生', () => {
    const document = createDocument();
    const plainPartial = document.paths['/posts/{id}/plain-partial'].patch;

    // design:paramtypes 只剩 Object，整個 operation 連 requestBody 這個 key 都沒有
    expect(plainPartial).not.toHaveProperty('requestBody');

    // 對照正解：requestBody 指向具名 schema
    expect(
      document.paths['/posts/{id}/correct'].patch?.requestBody,
    ).toMatchObject({
      content: {
        'application/json': {
          schema: { $ref: '#/components/schemas/UpdatePostDto' },
        },
      },
    });

    // 錯在拿型別而不是拿 class 本身，所以沒有任何新 schema 被產生
    expect(Object.keys(document.components?.schemas ?? {}).sort()).toEqual([
      'MissingDecoratorUpdatePostDto',
      'NestedInterfaceUpdatePostDto',
      'PublishOptionsDto',
      'UntypedArrayUpdatePostDto',
      'UpdatePostDto',
    ]);
  });

  it('正解：UpdatePostDto 五個 properties 齊全、全部 optional、巢狀走 $ref', () => {
    const schemas = createDocument().components?.schemas;

    expect(schemas?.UpdatePostDto).toEqual({
      type: 'object',
      properties: {
        title: {
          type: 'string',
          description: '文章標題',
        },
        content: {
          type: 'string',
          description: '文章內容',
        },
        tags: {
          type: 'array',
          items: { type: 'string' },
          description: '文章標籤',
        },
        relatedPostIds: {
          type: 'array',
          items: { type: 'number' },
          description: '相關文章 ID',
        },
        publishOptions: {
          $ref: '#/components/schemas/PublishOptionsDto',
        },
      },
    });

    // PartialType() 把已登記的 properties 全轉成 optional，所以沒有 required 清單
    expect(schemas?.UpdatePostDto).not.toHaveProperty('required');

    // 巢狀 DTO 自己的 required 不受影響
    expect(schemas?.PublishOptionsDto).toEqual({
      type: 'object',
      properties: {
        notifyFollowers: {
          type: 'boolean',
          description: '發布時是否通知追蹤者',
        },
      },
      required: ['notifyFollowers'],
    });
  });
});
