import { Logger } from '@nestjs/common';
import { FilteratorSearchFieldAttribute } from '../../auth/ldap/interfaces';
import { SearchUserPaginatorResponseDto, SearchUserRecordDto } from '../../auth/ldap/dto';
import { MemoryUsage } from '../interfaces';
import { clearConfigCache } from 'prettier';

/**
 * generic function to get Enum key from a Enum value
 * @param enumType a typescript Type
 * @param enumValue string value
 */
export const getEnumKeyFromEnumValue = (enumType: any, enumValue: string | number): any => {
  const keys: string[] = Object.keys(enumType).filter((x) => enumType[x] === enumValue);
  if (keys.length > 0) {
    return keys[0];
  } else {
    // throw error to caller function
    // throw new Error(`Invalid enum value '${enumValue}'! Valid enum values are ${Object.keys(myEnum)}`);
    throw new Error(`Invalid enum value '${enumValue}'! Valid enum value(s() are ${Object.values(enumType)}`);
  }
};

/**
 * generic function to get Enum value from a Enum key
 * @param enumType a typescript Type
 * @param enumValue string value
 */
export const getEnumValueFromEnumKey = (enumType: any, enumKey: string | number): any => {
  // use getEnumKeyByEnumValue to get key from value
  const keys = Object.keys(enumType).filter((x) => getEnumKeyFromEnumValue(enumType, enumType[x]) === enumKey);
  if (keys.length > 0) {
    // return value from equality key
    return enumType[keys[0]];
  } else {
    // throw error to caller function
    throw new Error(`Invalid enum key '${enumKey}'! Valid enum key(s() are ${Object.keys(enumType)}`);
  }
};

/**
 * map object keys to lowercase, used for ex to convert header keys to lowercase
 * @param obj
 */
export const mapKeysToLowerCase = (obj: object) => {
  const keys: string[] = Object.keys(obj);
  // initialize result
  const result: { [key: string]: string; } = {};
  keys.forEach((e) => {
    result[e.toLowerCase()] = obj[e];
  });

  return result;
};

/**
 * helper to convert Record Type into array
 * @param record 
 */
export const recordToArray = (record: any) => {
  if (Array.isArray(Object.values(record))) {
    // console.log(`Object.values(record): [${JSON.stringify(Object.values(record), undefined, 2)}]`);
    return Object.values(record);
  }
}

/**
 * paginator helper function
 * @param items array of items
 * @param currentPage
 * @param perPageItems
 * @description used like `console.log(paginator(products, 2, 2));`
 */
export const paginator = (items: any, currentPage: number, perPageItems: number): Promise<SearchUserPaginatorResponseDto> => {
  return new Promise((resolve, reject) => {
    try {
      // defaults
      const page = currentPage || 1;
      const perPage = perPageItems || 25;
      const offset = (page - 1) * perPage;
      const paginatedItems = items.slice(offset).slice(0, perPageItems);
      const totalPages = Math.ceil(items.length / perPage);

      resolve({
        page,
        perPage,
        prePage: page - 1 ? page - 1 : null,
        nextPage: (totalPages > page) ? page + 1 : null,
        totalRecords: items.length,
        totalPages,
        data: paginatedItems,
      });
    } catch (error) {
      // reject promise
      reject(error);
    }
  })
};

/**
 * helper function to filter array based on searchAttributes
 * @param items 
 * @param searchAttributes can use all props at same time, "search": {"username": { "exact": "mario", "contains": "ari", "regex": "\b(\\w*mario\\w*)\b" } }
 */
export const filterator = (items: SearchUserRecordDto[], searchAttributes?: Array<FilteratorSearchFieldAttribute>): Promise<SearchUserRecordDto[]> => new Promise((resolve, reject) => {
  try {
    if (Array.isArray(searchAttributes)) {
      // start with full recordSet
      let result: SearchUserRecordDto[] = items;
      // loop searchAttributes and start filter
      searchAttributes.forEach((attribute: FilteratorSearchFieldAttribute) => {
        // check if is a valid object with attributeKey
        if (typeof attribute === 'object' && Array.isArray(Object.keys(attribute))) {
          // can be 'cn', 'cn||displayName' ect
          const attributeKey = Object.keys(attribute)[0];
          const attributeKeys = attributeKey.split('||');

          // exact
          if (attribute[attributeKey].exact) {
            // Logger.log(`filterator attribute: exact '${attribute[attributeKey].exact}'`);
            // filter normal attributeKey
            if (attributeKey !== 'memberOf') {
              // old non OR array 
              // return e[attributeKey] === attribute[attributeKey].exact;
              // new OR array
              let exactResult: Array<SearchUserRecordDto> = [];
              // loop OR array fields
              attributeKeys.forEach((f) => {
                const innerResult = result.filter((e) => {
                  return e[f] === attribute[attributeKey].exact;
                });
                // if innerResult has foundedRecords, push to helper array
                if (innerResult.length > 0) {
                  exactResult = exactResult.concat(innerResult);
                }
              });
              // replace current result pipeline with matched or results
              result = exactResult;
            }
            // filter memberOf attributeKey, THIS don't work with more than on field
            else {
              // if memberOf we must search in all items the memberOf array to see if includes exact match
              if (attribute[attributeKey].exact) {
                result = result.filter((e) => Array.isArray(e[attributeKey]) && e[attributeKey].length > 0 && e[attributeKey].includes(attribute[attributeKey].exact));
              }
            }
          }

          // includes
          // some properties may not exists in some users, we must check with ?.includes, for ex telephoneNumber
          if (attribute[attributeKey]?.includes) {
            // Logger.log(`filterator attribute: contains '${attribute[attributeKey].includes}'`);
            // filter attributeKey
            let exactResult: Array<SearchUserRecordDto> = [];
            // loop OR array fields
            attributeKeys.forEach((f) => {
              const innerResult = result.filter((e) => {
                return attribute[attributeKey]?.includes && (e[f]).includes(attribute[attributeKey]?.includes);
              });
              // if innerResult has foundedRecords, push to helper array
              if (innerResult.length > 0) {
                exactResult = exactResult.concat(innerResult);
              }
            });
            // replace current result pipeline with matched or results
            result = exactResult;
          }

          // includes
          // some properties may not exists in some users, we must check with ?.includes, for ex telephoneNumber
          if (attribute[attributeKey]?.regex) {
            // Logger.log(`filterator attribute: contains '${attribute[attributeKey].regex}'`);
            // filter attributeKey
            let exactResult: Array<SearchUserRecordDto> = [];
            // loop OR array fields
            attributeKeys.forEach((f) => {
              const innerResult = result.filter((e) => {
                const regExp = new RegExp(attribute[attributeKey].regex, attribute[attributeKey].regexOptions ? attribute[attributeKey].regexOptions : undefined);
                return regExp.test(e[f]);
              });
              // if innerResult has foundedRecords, push to helper array
              if (innerResult.length > 0) {
                exactResult = exactResult.concat(innerResult);
              }
            });
            // replace current result pipeline with matched or results
            result = exactResult;
          }
        }
      });
      // end of search all attributes
      resolve(result);
    } else {
      resolve(items);
    }
  } catch (error) {
    // reject promise
    reject(error);
  }
});

export const getMemoryUsage = (): MemoryUsage => {
  // inner helper function
  const formatMemoryUsage = (data: any) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  // get memoryUsage
  const memoryData = process.memoryUsage()
  // compose result object
  const memoryUsage: MemoryUsage = {
    rss: {
      value: memoryData.rss,
      formattedValue: formatMemoryUsage(memoryData.rss),
      label: `resident Set Size - total memory allocated for the process execution`,
    },
    heapTotal: {
      value: memoryData.heapTotal,
      formattedValue: formatMemoryUsage(memoryData.heapTotal),
      label: `total size of the allocated heap`,
    },
    heapUsed: {
      value: memoryData.heapUsed,
      formattedValue: formatMemoryUsage(memoryData.heapUsed),
      label: `actual memory used during the execution`,
    },
    external: {
      value: memoryData.external,
      formattedValue: formatMemoryUsage(memoryData.external),
      label: `v8 external memory`,
    },
  };
  // Logger.log(memoryUsage);
  return memoryUsage;
};

export const getMemoryUsageDifference = (start: MemoryUsage, end: MemoryUsage): MemoryUsage => {
  // inner helper function
  const formatMemoryUsage = (data: any) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  const rss = (end.rss.value - start.rss.value);
  const heapTotal = (end.heapTotal.value - start.heapTotal.value);
  const heapUsed = (end.heapUsed.value - start.heapUsed.value);
  const external = (end.external.value - start.external.value);
  // Logger.log(`rss: ${end.rss.value} - ${start.rss.value} = ${end.rss.value - start.rss.value}`);
  // Logger.log(`heapTotal: ${end.heapTotal.value} - ${start.heapTotal.value} = ${end.heapTotal.value - start.heapTotal.value}`);
  // Logger.log(`heapUsed: ${end.heapUsed.value} - ${start.heapUsed.value} = ${end.heapUsed.value - start.heapUsed.value}`);
  // Logger.log(`external: ${end.external.value} - ${start.external.value} = ${end.external.value - start.external.value}`);
  return {
    rss: {
      value: rss,
      formattedValue: formatMemoryUsage(rss),
      label: `resident Set Size - total memory allocated for the process execution`,
    },
    heapTotal: {
      value: heapTotal,
      formattedValue: formatMemoryUsage(heapTotal),
      label: `total size of the allocated heap`,
    },
    heapUsed: {
      value: heapUsed,
      formattedValue: formatMemoryUsage(heapUsed),
      label: `actual memory used during the execution`,
    },
    external: {
      value: external,
      formattedValue: formatMemoryUsage(external),
      label: `v8 external memory`,
    },
  };
};

/**
 * declare and asyncForEach helper function to work with forEach with async/await
 * @param array
 * @param callback
 */
export const asyncForEach = async (array: any, callback: any) => {
  for (let index = 0; index < array.length; index++) {
    await callback(array[index], index, array);
  }
};

/**
 * sort string array
 * @param items 
 * @returns 
 */
export const sortArrayString = (items: string[]): string[] => {
  if (items && Array.isArray(items) && items.length) {
    return items.sort(function (a, b) {
      if (a < b) {
        return -1;
      }
      if (a > b) {
        return 1;
      }
      return 0;
    });
  } else {
    return [];
  }
}

/**
 * insert Item in array at position
 * @param arr 
 * @param index 
 * @param newItem 
 * @returns 
 */
export const insertItemInArrayAtPosition = (arr: any[], index: number, newItem: any) => [
  // part of the array before the specified index
  ...arr.slice(0, index),
  // inserted item
  newItem,
  // part of the array after the specified index
  ...arr.slice(index)
];

/**
 * generate a random secret string
 * @param length 
 * @returns 
 */
export const randomSecret = (length = 100): string => {
  const charset = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz#%&~!@-#$';
  let retVal = '';
  for (let i = 0, n = charset.length; i < length; ++i) {
    retVal += charset.charAt(Math.floor(Math.random() * n));
  }
  return retVal;
};
