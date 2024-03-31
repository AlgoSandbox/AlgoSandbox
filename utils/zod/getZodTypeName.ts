import { z, ZodSymbol } from 'zod';

// Get type name of any zod type
export default function getZodTypeName(zodType: z.ZodType): string {
  if (zodType instanceof z.ZodObject) {
    return 'object';
  }
  if (zodType instanceof z.ZodAny) {
    return 'any';
  }
  if (zodType instanceof z.ZodBigInt) {
    return 'bigint';
  }
  if (zodType instanceof z.ZodDate) {
    return 'date';
  }
  if (zodType instanceof z.ZodArray) {
    return 'array';
  }
  if (zodType instanceof z.ZodString) {
    return 'string';
  }
  if (zodType instanceof z.ZodEnum) {
    return 'enum';
  }
  if (zodType instanceof z.ZodNumber) {
    return 'number';
  }
  if (zodType instanceof z.ZodBoolean) {
    return 'boolean';
  }
  if (zodType instanceof z.ZodNull) {
    return 'null';
  }
  if (zodType instanceof z.ZodUndefined) {
    return 'undefined';
  }
  if (zodType instanceof z.ZodSet) {
    return 'set';
  }
  if (zodType instanceof z.ZodFunction) {
    return 'function';
  }
  if (zodType instanceof z.ZodRecord) {
    return 'record';
  }
  if (zodType instanceof z.ZodMap) {
    return 'map';
  }
  if (zodType instanceof z.ZodTuple) {
    return 'tuple';
  }
  if (zodType instanceof z.ZodOptional) {
    return `optional<${getZodTypeName(zodType._def.innerType)}>`;
  }
  if (zodType instanceof z.ZodNullable) {
    return `${getZodTypeName(zodType._def.innerType)} | null`;
  }
  if (zodType instanceof z.ZodUnknown) {
    return 'unknown';
  }
  if (zodType instanceof ZodSymbol) {
    return 'symbol';
  }
  console.error('unknown type', zodType);
  return 'unknown type';
}
