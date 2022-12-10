import { isNil } from 'lodash';
import { isObject, isRegExp, isDate } from 'util';

export const clean = <T extends object = any>(obj: T, strict = false, excludeKeys: string[] = []) => {
  Object.entries(obj).forEach(([key, value]) => {
    const isStrict: boolean[] = [];
    if (isStrict) isStrict.push(value === '');
    if (isStrict) isStrict.push(value === 0);
    if (isStrict) isStrict.push(value === null);
    if (isStrict) isStrict.push(value === undefined);
    if (isStrict) isStrict.push(value === BigInt(0));
    if (excludeKeys.includes(key)) return;
    if (typeof value === 'string' && isStrict) isStrict.push(value.trim() === '');
    const invalidObject = isDate(value) || isRegExp(value);
    if (isObject(value) && !invalidObject) clean(value, strict, excludeKeys);
    if ((value && typeof value === 'object' && !Object.keys(value).length) || value === null || value === undefined) {
      if (Array.isArray(obj)) {
        if (/\d+/.test(key)) {
          (<Array<any>>obj).splice(parseInt(key), 1);
        }
      } else {
        delete obj[key];
      }
    } else if (isNil(value) || isStrict.some((s) => s)) delete obj[key];
  });
  return obj;
};
