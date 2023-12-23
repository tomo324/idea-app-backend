import { Injectable } from '@nestjs/common';

@Injectable()
export class AuthService {
  constructor() {}
  signup() {
    return { message: 'signup' };
  }

  signin() {
    return { message: 'signin' };
  }
}
