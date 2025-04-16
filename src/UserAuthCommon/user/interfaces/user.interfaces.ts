import { Request } from 'express';

export interface RequestWithUser extends Request {
  userId: string;
  email: string;
}
export interface IUserFromGoogle {
  email: string;
  firstName: string;
  lastName: string;
  picture: string;
  accessToken: string;
  refreshToken: string;
}
export interface RequestWithGoogleUser extends Request {
  user: IUserFromGoogle;
}
