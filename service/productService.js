const sequelize = require("../config/connection");

async function findAllProductsByCatagoryId(fkCategoryId) {
  try {
    console.log(`Fetching products for category ID: ${fkCategoryId}`);

    const query = `
      SELECT 
        p.*, 
        g.*  
      FROM 
        products p
      JOIN 
        product_gallarey g
      ON 
        p.fk_gallery_id = g.product_img_id
      WHERE 
        p.fk_category_id = ?;
    `;

    // Execute the query with a replacement for the category ID
    const [results] = await sequelize.query(query, { replacements: [fkCategoryId] });

    console.log(`Fetched ${results.length} products for category ID: ${fkCategoryId}`);
    return results;
  } catch (error) {
    console.error("Error in findAllProductsByCatagoryId:", error.message);
    throw new Error("Failed to fetch products. Please try again later.");
  }
}

module.exports = { findAllProductsByCatagoryId };