import { Injectable } from '@nestjs/common';

@Injectable()
export class AppService {
  getHello(): string {
    return 'API JOBSY RUNNGING ON PORT 5000';
  }
}
