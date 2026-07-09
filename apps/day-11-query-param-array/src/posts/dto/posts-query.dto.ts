export class PostsQueryDto {
  // 這裡故意只寫 TypeScript 型別，示範它不會自動把 query 字串切成陣列。
  tags: string[];
}
