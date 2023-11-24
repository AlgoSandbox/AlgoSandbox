import { SomeZodObject } from 'zod';

export type SandboxStateType<T extends SomeZodObject = SomeZodObject> = {
  name: string;
  shape: T;
};

export function createState<T extends SomeZodObject>(
  name: string,
  shape: T,
): SandboxStateType<T> {
  return {
    name,
    shape,
  };
}
