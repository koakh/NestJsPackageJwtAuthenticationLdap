import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  // test use authService from library
  getWelcome(username: string): string {
    return `hello ${username} from ${AppService.name}`;
  }
}
