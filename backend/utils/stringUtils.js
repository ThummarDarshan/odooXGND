/**
 * Converts a string to title case (first letter capitalized, rest lowercase)
 * @param {string} str - The string to convert
 * @returns {string} - The string in title case
 */
function toTitleCase(str) {
  if (!str || typeof str !== 'string') {
    return str;
  }
  
  // Convert to lowercase first, then capitalize first letter
  return str.toLowerCase().replace(/^\w/, (c) => c.toUpperCase());
}

/**
 * Converts first name and last name to title case
 * @param {string} firstName - The first name to convert
 * @param {string} lastName - The last name to convert
 * @returns {Object} - Object with titleCaseFirstName and titleCaseLastName
 */
function convertNamesToTitleCase(firstName, lastName) {
  return {
    titleCaseFirstName: toTitleCase(firstName),
    titleCaseLastName: toTitleCase(lastName)
  };
}

module.exports = {
  toTitleCase,
  convertNamesToTitleCase
}; 