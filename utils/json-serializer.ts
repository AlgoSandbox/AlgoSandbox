// Adapted from: https://github.com/vkiryukhin/jsonfn/blob/master/jsonfn.js
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function serializeJson(json: any) {
  return JSON.stringify(json, (_, value) => {
    if (value instanceof Function || typeof value === 'function') {
      const fnBody = value.toString();

      const stringified = (() => {
        if (fnBody.length < 8 || fnBody.substring(0, 8) !== 'function') {
          //this is ES6 Arrow Function
          console.log('stringified closure', fnBody);
          return '_NuFrRa_' + fnBody;
        }

        console.log('stringified function', fnBody);

        return fnBody;
      })();

      return JSON.stringify(['function', stringified]);
    }

    if (value instanceof Set) {
      return JSON.stringify(['set', Array.from(value)]);
    }

    return value;
  });
}

export function deserializeJson(json: string) {
  return JSON.parse(json, (_, value) => {
    if (typeof value === 'string') {
      try {
        const valueParsed = JSON.parse(value);

        if (Array.isArray(valueParsed) && valueParsed[0] === 'function') {
          const fnValue = valueParsed[1] as string;

          if (fnValue.substring(0, 8) === '_NuFrRa_') {
            // Arrow function
            return eval(fnValue.substring(8));
          } else {
            return eval(`(${fnValue})`);
          }
        }

        if (Array.isArray(valueParsed) && valueParsed[0] === 'set') {
          return new Set(valueParsed[1]);
        }
      } catch {
        // Do nothing
      }
    }

    return value;
  });
}
