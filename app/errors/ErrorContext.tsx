import { Either, left, right } from '@sweet-monads/either';
import { createContext, useContext, useMemo, useState } from 'react';
import { z } from 'zod';

export type ErrorEntry = {
  message: string;
};

export type ErrorOr<T> = Either<[ErrorEntry], T>;

export function success<T>(value: T): ErrorOr<T> {
  return right(value);
}

export function error<T>(message: string): ErrorOr<T> {
  return left([{ message }]);
}

export function unwrapErrorOr<T>(errorOr: ErrorOr<T>): T | null {
  if (errorOr.isRight()) {
    return errorOr.value;
  }
  return null;
}

export const errorEntrySchema = z.object({
  message: z.string(),
});

export type Failable<T> =
  | {
      value: T;
      hasError: false;
    }
  | {
      hasError: true;
      errors: [ErrorEntry];
    };

export type ErrorContext = {
  errors: ErrorEntry[];
  addError: (error: ErrorEntry) => void;
};

const ErrorContext = createContext<ErrorContext>({
  errors: [],
  addError: () => {},
});

export function ErrorContextProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [errors, setErrors] = useState<ErrorEntry[]>([]);

  const value = useMemo(
    () => ({
      errors,
      addError: (error: ErrorEntry) => {
        setErrors((prevErrors) => [...prevErrors, error]);
      },
    }),
    [errors],
  );

  return (
    <ErrorContext.Provider value={value}>{children}</ErrorContext.Provider>
  );
}

export function useErrorContext() {
  return useContext(ErrorContext);
}
