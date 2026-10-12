import { Column, Entity, PrimaryGeneratedColumn } from 'typeorm';

@Entity()
export class User {
  @PrimaryGeneratedColumn()
  id: number;

  @Column()
  email: string;

  @Column()
  passwordHash: string;

  constructor(partial?: Partial<User>) {
    if (partial) {
      Object.assign(this, partial);
    }
  }
}
