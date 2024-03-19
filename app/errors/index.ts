import { Either, left, right } from '@sweet-monads/either';
import { z } from 'zod';

export type ErrorEntry = {
  message: string;
};

export type ErrorOr<T> = Either<Array<ErrorEntry>, T>;

export function success<T>(value: T): ErrorOr<T> {
  return right(value);
}

export function error<T>(...messages: Array<string>): ErrorOr<T> {
  return left(messages.map((message) => ({ message })));
}

export const errorEntrySchema = z.object({
  message: z.string(),
});
