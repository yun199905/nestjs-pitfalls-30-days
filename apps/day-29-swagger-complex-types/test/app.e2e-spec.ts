import { INestApplication } from '@nestjs/common';
import { Test, TestingModule } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import request from 'supertest';
import type { App } from 'supertest/types';
import { Day29SwaggerComplexTypesModule } from './../src/day-29-swagger-complex-types.module';
import { PublishChannel } from './../src/dto/request/publish-channel.enum';

type SchemaProperties = Record<string, Record<string, unknown>>;

describe('Day29SwaggerComplexTypesController (e2e)', () => {
  let app: INestApplication;

  beforeAll(async () => {
    const moduleFixture: TestingModule = await Test.createTestingModule({
      imports: [Day29SwaggerComplexTypesModule],
    }).compile();

    app = moduleFixture.createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  const post = {
    title: '同一個 DTO，三個世界',
    viewCount: 321,
    published: true,
    createdAt: '2026-10-13T08:00:00.000Z',
    tags: [{ name: 'nestjs', slug: 'nestjs' }],
    channels: [PublishChannel.Web, PublishChannel.App],
    externalRef: 'POST-2026-0913',
    keywordGroups: [
      ['nestjs', 'nest'],
      ['swagger', 'openapi'],
    ],
    author: {
      displayName: 'Cindy',
      featuredPost: {
        title: '容器與內容物',
        viewCount: 42,
        published: false,
        createdAt: '2026-10-12T08:00:00.000Z',
        tags: [],
        channels: [PublishChannel.Newsletter],
        externalRef: 42,
        keywordGroups: [],
        author: { displayName: 'Cindy' },
      },
    },
  };

  function createDocument() {
    return SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Day 29').build(),
    );
  }

  function properties(schemaName: string): SchemaProperties {
    const schema = createDocument().components?.schemas?.[schemaName] as {
      properties: SchemaProperties;
    };

    return schema.properties;
  }

  it.each(['broken', 'correct'] as const)(
    'POST /posts/%s 在 runtime 原樣收到整個巢狀結構',
    (variant) => {
      return request(app.getHttpServer() as App)
        .post(`/posts/${variant}`)
        .send(post)
        .expect(201)
        .expect({ variant, post });
    },
  );

  it.each(['BrokenPostDto', 'PostDto'])(
    '%s 的基本型別能直接從 design:type 產生正確 schema',
    (schemaName) => {
      expect(properties(schemaName).title).toEqual({
        type: 'string',
        description: '文章標題',
      });
      expect(properties(schemaName).viewCount).toEqual({
        type: 'number',
        description: '瀏覽次數',
      });
      expect(properties(schemaName).published).toEqual({
        type: 'boolean',
        description: '是否發布',
      });
      expect(properties(schemaName).createdAt).toEqual({
        format: 'date-time',
        type: 'string',
        description: '建立時間',
      });
    },
  );

  it.each(['BrokenPostDto', 'PostDto'])(
    '%s 的欄位順序與文章說明一致',
    (schemaName) => {
      expect(Object.keys(properties(schemaName))).toEqual([
        'title',
        'viewCount',
        'published',
        'createdAt',
        'tags',
        'channels',
        'externalRef',
        'keywordGroups',
        'author',
      ]);
    },
  );

  it('現象一：DTO 陣列的 items 退化成字串，連帶元素 DTO 不會被掃描', () => {
    expect(properties('BrokenPostDto').tags).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
    expect(properties('PostDto').tags).toEqual({
      type: 'array',
      items: { $ref: '#/components/schemas/TagDto' },
    });

    // items 被填成 string 之後，Swagger 沒有理由再往下掃描元素 DTO
    expect(createDocument().components?.schemas).not.toHaveProperty(
      'BrokenTagDto',
    );
  });

  it('現象二：enum 陣列退化成單一 enum；enumName 讓它變成可重用的具名 schema', () => {
    expect(properties('BrokenPostDto').channels).toEqual({
      type: 'string',
      enum: ['web', 'app', 'newsletter'],
    });
    expect(properties('PostDto').channels).toEqual({
      type: 'array',
      description: '發布通路',
      items: { $ref: '#/components/schemas/PublishChannel' },
    });

    // 沒有 enumName 時 enum 會被 inline 展開；有了才會抽成 components.schemas 的一員
    expect(createDocument().components?.schemas?.PublishChannel).toMatchObject({
      type: 'string',
      enum: ['web', 'app', 'newsletter'],
    });
  });

  it('現象三：union 退化成裸 object，多維陣列被壓平成一維', () => {
    expect(properties('BrokenPostDto').externalRef).toEqual({
      type: 'object',
    });
    expect(properties('PostDto').externalRef).toMatchObject({
      oneOf: [{ type: 'string' }, { type: 'number' }],
    });

    // 少掉一層：文件說是字串陣列，實際是字串陣列的陣列
    expect(properties('BrokenPostDto').keywordGroups).toEqual({
      type: 'array',
      items: { type: 'string' },
    });
    expect(properties('PostDto').keywordGroups).toMatchObject({
      type: 'array',
      items: { type: 'array', items: { type: 'string' } },
    });
  });

  it('correct 版的 schema 一律用 $ref 或明確的 schema，沒有任何裸 object', () => {
    const correctSchemas = ['PostDto', 'AuthorDto', 'TagDto'];

    correctSchemas.forEach((name) => {
      Object.entries(properties(name)).forEach(([key, property]) => {
        expect({ name, key, property }).not.toMatchObject({
          property: { type: 'object' },
        });
      });
    });
  });
});
