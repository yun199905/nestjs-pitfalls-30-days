import { Column, Entity, OneToMany, PrimaryGeneratedColumn } from 'typeorm';
import { Post } from '../posts/post.entity';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  name: string;

  // lazy: true 讓這個關聯欄位變成 Promise，存取時才即時查詢
  @OneToMany(() => Post, (post) => post.author, { lazy: true })
  posts: Promise<Post[]>;
}
