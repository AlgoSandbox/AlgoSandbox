import { z } from 'zod';

import getZodTypeName from './getZodTypeName';

export default function stringifyZodType(zodType: z.ZodType): string {
  if (zodType instanceof z.ZodNullable) {
    return `Nullable<${stringifyZodType(zodType._def.innerType)}>`;
  }
  if (zodType instanceof z.ZodOptional) {
    return `Optional<${stringifyZodType(zodType._def.innerType)}>`;
  }
  if (zodType instanceof z.ZodArray) {
    return `Array<${stringifyZodType(zodType._def.type)}>`;
  }
  if (zodType instanceof z.ZodSet) {
    return `Set<${stringifyZodType(zodType._def.valueType)}>`;
  }
  if (zodType instanceof z.ZodObject) {
    return `{\n${Object.entries(zodType.shape)
      .map(([key, value]) => {
        const valueTypeStringified = stringifyZodType(value as z.ZodType)
          .split('\n')
          .join('\n  ');
        return `  ${key}: ${valueTypeStringified},`;
      })
      .join('\n')}\n}`;
  }
  if (zodType instanceof z.ZodRecord) {
    return `Record<${stringifyZodType(
      zodType._def.keyType,
    )}, ${stringifyZodType(zodType._def.valueType)}>`;
  }
  if (zodType instanceof z.ZodUnion) {
    return `(${zodType._def.options.map(stringifyZodType).join(' | ')})`;
  }
  if (zodType instanceof z.ZodIntersection) {
    return `(${zodType._def.left._def.typeName} & ${zodType._def.right._def.typeName})`;
  }
  if (zodType instanceof z.ZodTuple) {
    return `[${zodType._def.items.map(stringifyZodType).join(', ')}]`;
  }
  if (zodType instanceof z.ZodFunction) {
    const stringifiedArgs = (() => {
      const args = zodType._def.args;
      if (args instanceof z.ZodTuple) {
        return (args.items as Array<z.ZodType>)
          .map((type, index) => `arg${index}: ${stringifyZodType(type)}`)
          .join(', ');
      }
      return `...args: ${stringifyZodType(args)}`;
    })();

    return `(${stringifiedArgs}) => ${stringifyZodType(zodType._def.returns)}`;
  }
  if (zodType instanceof z.ZodEnum) {
    return `Enum<${(zodType._def.values as Array<z.ZodType>)
      .map((value) => JSON.stringify(value))
      .join(' | ')}>`;
  }
  return getZodTypeName(zodType);
}
