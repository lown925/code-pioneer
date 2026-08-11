import type { NextFunction, Request, Response } from 'express';
import type { AppEnvironment } from './environment.config';

export function createCommunityUploadBlocker(appEnvironment: AppEnvironment) {
  return (_request: Request, response: Response, next: NextFunction) => {
    if (appEnvironment === 'trial' || appEnvironment === 'production') {
      response.sendStatus(404);
      return;
    }

    next();
  };
}
