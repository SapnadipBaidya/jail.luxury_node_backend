const sequelize = require("../config/connection");

// Allowed columns for filtering & sorting to prevent SQL injection
const allowedProductDetailsFilters = [
  "product_price_inr",
  "fk_color_id",
  "in_stock",
  "is_featured",
  "is_popular",
];

const allowedProductFilters = [
  "gender",
  "fk_category_id",
  "sizes",
  "priceStart",
  "priceEnd",
];

const allowedSortColumns = [
  "product_name",
  "product_price_inr",
  "updated_at",
  "is_popular",
];

async function findAllProductsByCatagoryId({
  productDetailsFilters = {},
  productFilters = {},
  sortBy = "updated_at",
  sortOrder = "DESC",
  page = 1,
  limit = 10,
  defaultFlag = 0,
  userId = null, // ✅ Added userId to check wishlist status
}) {
  try {
    console.log(`Fetching products with filters:
      productDetailsFilters: ${JSON.stringify(productDetailsFilters)},
      productFilters: ${JSON.stringify(productFilters)}
    `);

    // ✅ Define base query with specific columns (avoid SELECT *)
    let query = `
    SELECT 
    JSON_OBJECT(
      'product_id', p.product_id,
      'product_price_inr', pd.product_price_inr,
      'product_name', p.product_name,
      'gender', p.gender,
      'is_enabled', p.is_enabled,
      'fk_category_id', p.fk_category_id,
      'description', p.description,
      'products_details_id', pd.product_detail_id,
      'is_wishlisted', 
        IF(EXISTS (
            SELECT 1 FROM wishlist_items wi 
            JOIN wishlist w ON wi.fk_wishlist_id = w.wishlist_id 
            WHERE wi.fk_products_details_id = pd.product_detail_id 
            AND wi.fk_product_id = p.product_id
            AND w.fk_user_id = ?
        ), TRUE, FALSE)
    ) AS product_details, 
    
    -- ✅ Select gallery fields
    JSON_OBJECT(
      'gallery_id', g.product_img_id,
      'gallery', g.product_gallrey
    ) AS gallery_details,
    
    -- ✅ Select color fields
    JSON_OBJECT(
      'color_id', c.pk_color_id,
      'color_name', c.color_name,
      'color_hex', c.color_hex
    ) AS color_details,
     
    -- ✅ Select product sizes
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

    // ✅ Query Parameters (First placeholder is for wishlist check)
    const replacements = [userId];

    // ✅ Apply Dynamic productDetailsFilters (Filtering on products_details)
    Object.keys(productDetailsFilters).forEach((key) => {
      if (allowedProductDetailsFilters.includes(key)) {
        query += ` AND pd.${key} = ?`;
        replacements.push(productDetailsFilters[key]);
      }
    });

    // ✅ Apply Dynamic productFilters (Filtering on products)
    Object.keys(productFilters).forEach((key) => {
      if (allowedProductFilters.includes(key)) {
        console.log(`Applying filter -> Key: ${key}, Value: ${productFilters[key]}`);

        // ✅ Handle price range filtering
        if (key === "priceStart" && productFilters.priceEnd) {
          query += ` AND pd.product_price_inr BETWEEN ? AND ?`;
          replacements.push(productFilters.priceStart, productFilters.priceEnd);
        }
        // ✅ Handle size filtering properly
        else if (key === "sizes") {
          query += ` AND s.size_name = ?`;
          replacements.push(productFilters[key]);
        }
        // ✅ Handle other general filters
        else if (key !== "priceStart" && key !== "priceEnd") {
          query += ` AND p.${key} = ?`;
          replacements.push(productFilters[key]);
        }
      }
    });

    // ✅ Fix: Correct condition for defaultFlag
    if (defaultFlag === 1) {
      query += ` AND pd.is_default_product = 1 `;
    }

    // ✅ Apply Sorting (Only if it's a valid column)
    if (allowedSortColumns.includes(sortBy)) {
      query += ` ORDER BY pd.${sortBy} ${sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"}`;
    } else {
      query += " ORDER BY pd.created_at DESC"; // Default sorting
    }

    // ✅ Optimize Pagination with Index-Based Offset
    const offset = (page - 1) * limit;
    query += " LIMIT ? OFFSET ?";
    replacements.push(parseInt(limit), parseInt(offset));

    // ✅ Log final query before execution
    console.log(`Final Query: ${query}`);
    console.log(`Replacements: ${JSON.stringify(replacements)}`);

    // ✅ Execute Query
    const [results] = await sequelize.query(query, { replacements });

    console.log(`Fetched ${results.length} products with applied filters.`);
    return results;
  } catch (error) {
    console.error("Error in findAllProductsByCategoryId:", error.message);
    throw new Error("Failed to fetch products. Please try again later.");
  }
}

async function findProductsByPdId({ productsDetailsId,product_id }) {
try{  console.log("productsDetailsId", productsDetailsId);
  const replacements = [];
  let query = `
SELECT 
JSON_OBJECT(
  'product_id', p.product_id,
  'product_price_inr', pd.product_price_inr,
  'product_name', p.product_name,
  'gender', p.gender,
  'is_enabled', p.is_enabled,
  'fk_category_id', p.fk_category_id,
  'description', p.description
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

  if (productsDetailsId!=undefined && productsDetailsId !=null) {
    query += " AND pd.product_detail_id = ?";
    replacements.push(productsDetailsId);
  }
  if (product_id!=undefined && product_id !=null) {
    query += " AND p.product_id = ?";
    replacements.push(product_id);
  }

  
  const [results] = await sequelize.query(query, { replacements });
  console.log(`Fetched ${results}`);
  return results;
}
catch(error){
console.error(error)
}
}
module.exports = { findAllProductsByCatagoryId, findProductsByPdId };
