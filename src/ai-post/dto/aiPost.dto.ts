import { IsNotEmpty, IsNumber, IsString } from 'class-validator';

export class CreateAiPostDto {
  constructor(content: string, firstPostId: number, secondPostId: number) {
    this.content = content;
    this.firstPostId = firstPostId;
    this.secondPostId = secondPostId;
  }

  @IsString()
  @IsNotEmpty()
  content: string;

  @IsNumber()
  @IsNotEmpty()
  firstPostId: number;

  @IsNumber()
  @IsNotEmpty()
  secondPostId: number;
}
