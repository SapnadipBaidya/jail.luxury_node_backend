const searchService = require("../service/searchService");

async function searchByNameColorCategory(FilterObj) {
  return await searchService.searchByNameColorCategory(FilterObj);
}

module.exports = { searchByNameColorCategory };
