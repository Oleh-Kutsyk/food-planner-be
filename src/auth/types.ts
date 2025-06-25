import { Request } from 'express';

export interface JwtPayload {
  email: string;
}

export interface AuthenticatedRequest extends Request, JwtPayload {}

export interface Tokens {
  accessToken: string;
  refreshToken: string;
}
