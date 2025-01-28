import * as searchService from "../service/searchService.js"; // Ensure .js extension

export async function searchByNameColorCategory(FilterObj) {
  return await searchService.searchByNameColorCategory(FilterObj);
}