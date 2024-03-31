import { IsString, IsNotEmpty } from 'class-validator';

export class CreatePostDto {
  constructor(content: string) {
    this.content = content;
  }

  @IsString()
  @IsNotEmpty()
  content: string;
}
