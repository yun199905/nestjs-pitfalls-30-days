import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class Post {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  authorId: number;

  constructor(partial?: Partial<Post>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
