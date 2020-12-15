import { Logger } from '@nestjs/common';
import { FilteratorSearchFieldAttribute } from '../../auth/ldap/interfaces';
import { SearchUserPaginatorResponseDto, SearchUserRecordDto } from '../../auth/ldap/dto';
import { MemoryUsage } from '../interfaces';

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
      const perPage = perPageItems || 10;
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
export const filterator = (items: any, searchAttributes?: Array<FilteratorSearchFieldAttribute>): Promise<SearchUserRecordDto[]> => new Promise((resolve, reject) => {
  try {
    if (Array.isArray(searchAttributes)) {
      let result: SearchUserRecordDto[] = items;
      searchAttributes.forEach((attribute: FilteratorSearchFieldAttribute) => {
        // check if is a valid object with attributeKey
        if (typeof attribute === 'object' && Array.isArray(Object.keys(attribute))) {
          const attributeKey = Object.keys(attribute)[0];
          if (attribute[attributeKey].exact) {
            // Logger.log(`filterator attribute: exact '${attribute[attributeKey].exact}'`);
            // filter normal attributeKey
            if (attributeKey !== 'memberOf') {
              result = result.filter((e) => e[attributeKey] === attribute[attributeKey].exact);
              // filter memberOf attributeKey
            } else {
              // if memberOf we must search in all items the memberOf array to see if includes exact match
              if (attribute[attributeKey].exact) {
                result = result.filter((e) => Array.isArray(e[attributeKey]) && e[attributeKey].length > 0 && e[attributeKey].includes(attribute[attributeKey].exact));
              }
            }
          }
          if (attribute[attributeKey].includes) {
            // Logger.log(`filterator attribute: contains '${attribute[attributeKey].includes}'`);
            // filter attributeKey
            result = result.filter((e) => {
              return (e[attributeKey]).includes(attribute[attributeKey].includes);
            });
          }
          if (attribute[attributeKey].regex) {
            // Logger.log(`filterator attribute: regex '${attribute[attributeKey].regex}'`);
            try {
              result = result.filter((e) => {
                const regExp = new RegExp(attribute[attributeKey].regex);
                return regExp.test(e[attributeKey]);
              });
            } catch (error) {
              Logger.log(`filterator invalid regExp on attributeKey ${attributeKey}. regExp: '${attribute[attributeKey].regex}'`);
            }
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