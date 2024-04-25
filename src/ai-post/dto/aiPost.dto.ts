import { IsNotEmpty, IsString } from 'class-validator';

export class CreateAiPostDto {
  constructor(content: string) {
    this.content = content;
  }

  @IsString()
  @IsNotEmpty()
  content: string;
}
