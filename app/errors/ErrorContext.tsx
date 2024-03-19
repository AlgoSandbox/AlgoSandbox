import { createContext, useContext, useMemo, useState } from 'react';

import { ErrorEntry } from '.';

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
