import { Injectable } from '@nestjs/common';

@Injectable()
export class UserService {
  getCurrentUser() {
    return {
      id: 'user-1',
      name: 'Cors Demo User',
      role: 'author',
      note: 'Pretend this profile is fetched with a cookie-based session from another origin.',
    };
  }
}
