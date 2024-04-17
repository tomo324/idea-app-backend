import { Module } from '@nestjs/common';
import { AiPostController } from './ai-post.controller';
import { AiPostService } from './ai-post.service';

@Module({
  controllers: [AiPostController],
  providers: [AiPostService],
})
export class AiPostModule {}
