import { Injectable, Logger } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';

@Injectable()
export class JwtGuard extends AuthGuard('jwt') {
  private logger = new Logger('JwtGuard');

  constructor() {
    super();
  }

  handleRequest(
    ...args: Parameters<
      ReturnType<typeof AuthGuard>['prototype']['handleRequest']
    >
  ) {
    // エラーだけログに記録
    // エラーとは、第１引数(err)があるか、第2引数(user)がfalseの場合
    if (args[0] || !args[1]) {
      const cache: any = [];
      const circularReplacer = () => {
        return (key: string, value: any) => {
          if (typeof value === 'object' && value !== null) {
            if (cache.includes(value)) {
              // 循環参照を見つけた場合、何も返さない（またはカスタムの値を返す）
              return;
            }
            // 値をキャッシュに追加
            cache.push(value);
          }
          return value;
        };
      };

      this.logger.error(JSON.stringify(args, circularReplacer(), 2));
    }
    return super.handleRequest(
      args[0],
      args[1],
      args[2],
      args[3] as any,
      args[4],
    );
  }
}
