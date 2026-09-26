import { Column, Entity, ManyToOne, PrimaryGeneratedColumn } from 'typeorm';
import { User } from '../users/user.entity';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  title: string;

  // user 的型別註記是必要的：User.posts 因為 lazy: true 而是 Promise<Post[]>，
  // 搭配兩個 entity 的循環 import 會讓 TS 推不出型別而報 implicit any，不要移除
  @ManyToOne(() => User, (user: User) => user.posts)
  author: User;
}
