/**
 * Converts a given string to CONSTANT_CASE.
 * @param input The input string to convert.
 * @returns The string in CONSTANT_CASE.
 */
export const constantCase = (input: string): string => {
  return input
    // Add underscores between camelCase words
    .replace(/([a-z])([A-Z])/g, '$1_$2')
    // Replace spaces and hyphens with underscores
    .replace(/[\s-]+/g, '_')
    // Convert everything to uppercase
    .toUpperCase();
}

/**
 * Converts a given string to PascalCase.
 * @param input The input string to convert.
 * @returns The string in PascalCase.
 */
export const pascalCase = (input: string): string => {
  return input
    // Convert the string to lowercase
    .toLowerCase()
    // Replace underscores, spaces, or hyphens
    .replace(/[_\s-]+(.)?/g, (_, c) =>
      // Capitalize the letter after them
      c ? c.toUpperCase() : ''
    )
    .replace(/^\w/, (c) => c.toUpperCase()); // Capitalize the first letter
}
