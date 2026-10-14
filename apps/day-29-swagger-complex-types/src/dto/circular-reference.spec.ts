import { INestApplication } from '@nestjs/common';
import { Test } from '@nestjs/testing';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { Day29SwaggerComplexTypesModule } from '../day-29-swagger-complex-types.module';

type SchemaProperties = Record<string, Record<string, unknown>>;

describe('循環 DTO 在 OpenAPI schema 裡的行為', () => {
  let app: INestApplication;

  beforeAll(async () => {
    app = (
      await Test.createTestingModule({
        imports: [Day29SwaggerComplexTypesModule],
      }).compile()
    ).createNestApplication();
    await app.init();
  });

  afterAll(async () => {
    await app.close();
  });

  function properties(schemaName: string): SchemaProperties {
    const document = SwaggerModule.createDocument(
      app,
      new DocumentBuilder().setTitle('Day 29').build(),
    );
    const schema = document.components?.schemas?.[schemaName] as {
      properties: SchemaProperties;
    };

    return schema.properties;
  }

  it('循環關係不會讓 createDocument() 失敗', () => {
    expect(() =>
      SwaggerModule.createDocument(
        app,
        new DocumentBuilder().setTitle('Day 29').build(),
      ),
    ).not.toThrow();
  });

  it('兩側都明確指定 eager type，仍是一側產生 $ref、另一側退化成 object', () => {
    // 執行 BrokenPostDto 的 decorator 時，BrokenAuthorDto 已經完成定義
    expect(properties('BrokenPostDto').author).toEqual({
      $ref: '#/components/schemas/BrokenAuthorDto',
    });

    // 反方向的 eager type 在 decorator 執行時仍拿不到 BrokenPostDto，於是退化成裸 object
    expect(properties('BrokenAuthorDto').featuredPost).toEqual({
      type: 'object',
    });
  });

  it('兩側都用 type: () => Dto 之後，兩個方向都是 $ref', () => {
    expect(properties('PostDto').author).toEqual({
      $ref: '#/components/schemas/AuthorDto',
    });
    expect(properties('AuthorDto').featuredPost).toEqual({
      $ref: '#/components/schemas/PostDto',
    });
  });
});
