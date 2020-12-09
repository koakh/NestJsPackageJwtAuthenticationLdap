export interface MemoryUsage {
  rss: {
    value: number,
    formattedValue: string,
    label: string,
  }
  heapTotal: {
    value: number,
    formattedValue: string,
    label: string,
  }
  heapUsed: {
    value: number,
    formattedValue: string,
    label: string,
  }
  external: {
    value: number,
    formattedValue: string,
    label: string,
  }
}