import { Injectable } from '@nestjs/common';

@Injectable()
export class UsersService {
  getProfile() {
    return {
      name: 'John Doe',
      email: 'john.doe@example.com',
      membership: 'Gold',
      message: 'This is your profile information.',
    };
  }

  getUserById(userId: string) {
    return {
      id: userId,
      name: `User ${userId}`,
      age: 25,
      email: `user${userId}@example.com`,
      message: 'This is the information for user with ID.',
    };
  }
}
