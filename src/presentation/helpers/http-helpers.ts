import { HttpResponse } from '../protocols/http';
import { InternalServerError } from '../errors/internal-server-error';

export const badRequest = (error: Error): HttpResponse => ({
  statusCode: 400,
  body: error
});

export const internalServerError = (error: Error): HttpResponse => ({
  statusCode: 500,
  body: new InternalServerError(error.stack)
});

export const ok = (data: any): HttpResponse => ({
  statusCode: 200,
  body: data
});