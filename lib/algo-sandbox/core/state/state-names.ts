import z from 'zod';

export type SandboxStateType<T extends z.ZodType = z.SomeZodObject> = {
  name: string;
  shape: T;
};

export function createState<T extends z.SomeZodObject>(
  name: string,
  shape: T,
): SandboxStateType<T> {
  return {
    name,
    shape,
  };
}
