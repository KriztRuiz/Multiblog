import "express";

export interface AuthPayload {
  id: string;
  email: string;
}

declare global {
  namespace Express {
    interface Request {
      auth?: AuthPayload;
    }
  }
}
export {};
