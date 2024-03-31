/* eslint-disable @typescript-eslint/no-explicit-any */
import { z } from 'zod';

import getZodTypeName from './getZodTypeName';

const maxLazyDepth = 3;

export default function stringifyZodType(
  zodType: z.ZodType,
  lazyDepth = 0,
): string {
  if (zodType instanceof z.ZodNullable) {
    return `${stringifyZodType(zodType._def.innerType, lazyDepth)} | null`;
  }
  if (zodType instanceof z.ZodOptional) {
    return `Optional<${stringifyZodType(zodType._def.innerType, lazyDepth)}>`;
  }
  if (zodType instanceof z.ZodArray) {
    return `Array<${stringifyZodType(zodType._def.type, lazyDepth)}>`;
  }
  if (zodType instanceof z.ZodSet) {
    return `Set<${stringifyZodType(zodType._def.valueType, lazyDepth)}>`;
  }
  if (zodType instanceof z.ZodObject) {
    return `{\n${Object.entries(zodType.shape)
      .map(([key, value]) => {
        const valueTypeStringified = stringifyZodType(
          value as z.ZodType,
          lazyDepth,
        )
          .split('\n')
          .join('\n  ');
        return `  ${key}: ${valueTypeStringified},`;
      })
      .join('\n')}\n}`;
  }
  if (zodType instanceof z.ZodRecord) {
    return `Record<${stringifyZodType(
      zodType._def.keyType,
    )}, ${stringifyZodType(zodType._def.valueType, lazyDepth)}>`;
  }
  if (zodType instanceof z.ZodUnion) {
    return `(${zodType._def.options
      .map((type: any) => stringifyZodType(type, lazyDepth))
      .join(' | ')})`;
  }
  if (zodType instanceof z.ZodIntersection) {
    return `(${zodType._def.left._def.typeName} & ${zodType._def.right._def.typeName})`;
  }
  if (zodType instanceof z.ZodTuple) {
    return `[${zodType._def.items
      .map((type: any) => stringifyZodType(type, lazyDepth))
      .join(', ')}]`;
  }
  if (zodType instanceof z.ZodFunction) {
    const stringifiedArgs = (() => {
      const args = zodType._def.args;
      if (args instanceof z.ZodTuple) {
        return (args.items as Array<z.ZodType>)
          .map(
            (type, index) =>
              `arg${index}: ${stringifyZodType(type, lazyDepth)}`,
          )
          .join(', ');
      }
      return `...args: ${stringifyZodType(args, lazyDepth)}`;
    })();

    return `(${stringifiedArgs}) => ${stringifyZodType(
      zodType._def.returns,
      lazyDepth,
    )}`;
  }
  if (zodType instanceof z.ZodEnum) {
    return `Enum<${(zodType._def.values as Array<z.ZodType>)
      .map((value) => JSON.stringify(value))
      .join(' | ')}>`;
  }
  if (zodType instanceof z.ZodLazy) {
    if (lazyDepth >= maxLazyDepth) {
      return '...';
    }
    return stringifyZodType(zodType._def.getter(), lazyDepth + 1);
  }
  return getZodTypeName(zodType);
}
