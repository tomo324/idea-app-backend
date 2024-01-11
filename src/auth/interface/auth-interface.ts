export interface UserWithoutHash {
  id: number;
  email: string;
  name: string;
  hash?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface GetUserInterface {
  id: number;
  email: string;
  name: string;
  hash?: string;
  createdAt: Date;
  updatedAt: Date;
  [key: string]: any;
}
