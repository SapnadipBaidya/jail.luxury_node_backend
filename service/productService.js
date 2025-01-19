const sequelize = require("../config/connection");

// Allowed columns for filtering & sorting to prevent SQL injection
const allowedProductDetailsFilters = [
  "product_price_inr", "fk_color_id", "in_stock", "is_featured", "is_popular"
];

const allowedProductFilters = [
  "gender", "fk_category_id"
];

const allowedSortColumns = ["product_name", "product_price_inr", "updated_at","is_popular"];

async function findAllProductsByCategoryId({ 
  productDetailsFilters = {}, 
  productFilters = {},
  sortBy = "updated_at", 
  sortOrder = "DESC", 
  page = 1, 
  limit = 10,
  defaultFlag = 0
}) {
  try {
    console.log(`Fetching products with filters:
      productDetailsFilters: ${JSON.stringify(productDetailsFilters)},
      productFilters: ${JSON.stringify(productFilters)}
    `);

    // Define base query with specific columns (avoid SELECT *)
    let query = `
    SELECT 
    -- Select product fields and alias them
    JSON_OBJECT(
      'product_id', p.product_id,
      'product_price_inr',pd.product_price_inr,
      'product_name', p.product_name,
      'gender', p.gender,
      'is_enabled', p.is_enabled,
      'fk_category_id', p.fk_category_id,
      'description',p.description
    ) AS product_details, 
    
    -- Select gallery fields
    JSON_OBJECT(
      'gallery_id', g.product_img_id,
      'image_url', g.product_gallrey
    ) AS gallery_details,
    
    -- Select color fields
    JSON_OBJECT(
      'color_id', c.pk_color_id,
      'color_name', c.color_name,
      'color_hex', c.color_hex
    ) AS color_details,
     
    -- Select product sizes
    JSON_OBJECT(
      'size_name', s.size_name
    ) AS size_details

      FROM 
        products_details pd
      JOIN 
        products p ON pd.fk_product_id = p.product_id
      LEFT JOIN 
        sizes s ON pd.fk_size_id = s.pk_size_id  
      LEFT JOIN 
        product_gallarey g ON pd.fk_gallery_id = g.product_img_id
      LEFT JOIN 
        product_colors c ON pd.fk_color_id = c.pk_color_id
      WHERE 1=1
    `;

    // Query Parameters
    const replacements = [];

    // Apply Dynamic productDetailsFilters (Filtering on products_details)
    Object.keys(productDetailsFilters).forEach((key) => {
      if (allowedProductDetailsFilters.includes(key)) {
        query += ` AND pd.${key} = ?`;
        replacements.push(productDetailsFilters[key]);
      }
    });

    // Apply Dynamic productFilters (Filtering on products)
    Object.keys(productFilters).forEach((key) => {
      if (allowedProductFilters.includes(key)) {
        query += ` AND p.${key} = ?`;
        replacements.push(productFilters[key]);
      }
    });

    // Fix: Correct condition for defaultFlag
    if (defaultFlag === 1) {
      query += ` AND pd.is_default_product = 1 `;
    }

    // Apply Sorting (Only if it's a valid column)
    if (allowedSortColumns.includes(sortBy)) {
      query += ` ORDER BY pd.${sortBy} ${sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"}`;
    } else {
      query += " ORDER BY pd.created_at DESC"; // Default sorting
    }

    // Optimize Pagination with Index-Based Offset
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    replacements.push(parseInt(limit), parseInt(offset));

    // Execute Query
    const [results] = await sequelize.query(query, { replacements });

    console.log(`Fetched ${results.length} products with applied filters.`);
    return results;
  } catch (error) {
    console.error("Error in findAllProductsByCategoryId:", error.message);
    throw new Error("Failed to fetch products. Please try again later.");
  }
}

module.exports = { findAllProductsByCategoryId };