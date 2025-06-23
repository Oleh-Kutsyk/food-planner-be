import { Request } from 'express';

export interface JwtPayload {
  email: string;
}

export interface AuthenticatedRequest extends Request, JwtPayload {}
