import { Logger } from '@nestjs/common';
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
 * paginator helper function
 * @param items array of items
 * @param currentPage
 * @param perPageItems
 * @description used like `console.log(paginator(products, 2, 2));`
 */
export const paginator = (items: any, currentPage: number, perPageItems: number) => {
  // defaults
  const page = currentPage || 1;
  const perPage = perPageItems || 10;
  const offset = (page - 1) * perPage;

  const paginatedItems = items.slice(offset).slice(0, perPageItems);
  const totalPages = Math.ceil(items.length / perPage);

  return {
    page,
    perPage,
    prePage: page - 1 ? page - 1 : null,
    nextPage: (totalPages > page) ? page + 1 : null,
    total: items.length,
    totalPages,
    data: paginatedItems,
  };
};

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
  Logger.log(memoryUsage);
  return memoryUsage;
};

export const getMemoryUsageDifference = (start: MemoryUsage, end: MemoryUsage): MemoryUsage => {
  // inner helper function
  const formatMemoryUsage = (data: any) => `${Math.round(data / 1024 / 1024 * 100) / 100} MB`;
  const rss = (end.rss.value - start.rss.value);
  const heapTotal = (end.heapTotal.value - start.heapTotal.value);
  const heapUsed = (end.heapUsed.value - start.heapUsed.value);
  const external = (end.external.value - start.external.value);
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