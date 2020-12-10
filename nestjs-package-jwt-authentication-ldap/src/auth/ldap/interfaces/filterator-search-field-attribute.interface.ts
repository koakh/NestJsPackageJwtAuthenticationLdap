export interface FilteratorSearchFieldAttribute {
  [key:string]: {
    // must match string
    exact?: string,
    // must contain string
    includes?: string,
    // must match regex
    regex?: string,
  }
}