const sequelize = require("../config/connection");

// Allowed columns for filtering & sorting to prevent SQL injection
const allowedProductDetailsFilters = ["in_stock"];

const allowedProductFilters = [
  "gender",
  "fk_category_id",
  "sizes",
  "priceStart",
  "priceEnd",
  "colors",
];

const allowedSortColumns = [
  "product_name",
  "product_price_inr",
  "updated_at",
  "is_popular",
  "is_featured",
];

async function findAllProductsByCatagoryId({
  productDetailsFilters = {},
  productFilters = {},
  sortBy = "updated_at",
  sortOrder = "DESC",
  page = 1,
  limit = 12,
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
      'product_price_inr', p.product_price_local,
      'product_name', p.product_name,
      'gender', p.gender,
      'is_enabled', p.is_enabled,
      'fk_category_id', p.fk_category_id,
      'description', p.description,
      'products_details_id', pd.product_detail_id,
      'inStock',pd.in_stock,
      'is_featured',pd.is_featured,
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
          'size_name', s.size_name,
          'pkSizeId',s.pk_size_id
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
      if (
        allowedProductFilters.includes(key) &&
        productFilters[key] != [] &&
        productFilters[key] != "" &&
        productFilters[key] != null &&
        productFilters[key] != undefined
      ) {
        console.log(
          `Applying filter -> Key: ${key}, Value: ${productFilters[key]}`
        );

        // ✅ Handle price range filtering
        if (key === "priceStart" && productFilters.priceEnd) {
          query += ` AND p.product_price_local BETWEEN ? AND ?`;
          replacements.push(productFilters.priceStart, productFilters.priceEnd);
        }
        // ✅ Handle size filtering properly
        else if (key === "sizes") {
          console.log("sizes arr ", productFilters[key]);
          query += ` AND pd.fk_size_id IN (?)`;
          replacements.push(productFilters[key]);
        } else if (key === "colors") {
          console.log("colors arr ", productFilters[key]);
          query += ` AND pd.fk_color_id IN (?)`;
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

    // ✅ SOFT delete IMPL
    query += " AND  pd.is_deleted = 0";

    query += " ORDER BY pd.in_stock DESC , ";

    // ✅ Apply Sorting (Only if it's a valid column)
    if (allowedSortColumns.includes(sortBy)) {
      console.log("sortBy", sortBy);
      query += ` pd.${sortBy} ${
        sortOrder.toUpperCase() === "DESC" ? "DESC" : "ASC"
      } `;
    } else {
      query += " pd.created_at DESC "; // Default sorting
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

async function findProductsByPdId({ productsDetailsId, product_id }) {
  try {
    console.log("productsDetailsId", productsDetailsId);
    const replacements = [];

    let query = `
      SELECT 
        JSON_OBJECT(
          'productDetailsId', pd.product_detail_id,
          'price', p.product_price_local,
          'description', p.description,
          'moreDetails', p.more_details,
          'allColors', (
              SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'color_hex', c.color_hex,
                      'color_id', c.pk_color_id,
                      'color_name', c.color_name
                  )
              )
              FROM product_colors c
              WHERE c.pk_color_id IN (
                  SELECT DISTINCT pd.fk_color_id
                  FROM products_details pd
                  WHERE pd.fk_product_id = p.product_id
              )
          ),
          'allSizes', (
              SELECT JSON_ARRAYAGG(
                  JSON_OBJECT(
                      'size_name', s.size_name,
                      'size_id', s.pk_size_id
                  )
              )
              FROM sizes s
              WHERE s.pk_size_id IN (
                  SELECT DISTINCT pd.fk_size_id
                  FROM products_details pd
                  WHERE pd.fk_product_id = p.product_id
              )
          )
        ) AS product_data
      FROM 
        products p
      LEFT JOIN  -- ✅ Fix: Change INNER JOIN to LEFT JOIN
        products_details pd ON pd.fk_product_id = p.product_id
      WHERE 1=1 
    `;

    if (product_id !== undefined && product_id !== null) {
      query += " AND p.product_id = ? LIMIT 1;";
      replacements.push(product_id);
    }

    // Execute the query with replacements
    const [results] = await sequelize.query(query, { replacements });

    console.log(`Fetched ${results.length} products`);

    // ✅ Fix: Return `{}` instead of `[{}]`
    if (!results || results.length === 0 || (results.length === 1 && Object.keys(results[0]).length === 0)) {
      return {};
    }

    return results[0]; // ✅ Ensure only a single object is returned
  } catch (error) {
    console.error("Error fetching products:", error);
    return {};
  }
}






async function findAllAvalibaleColorsByPidAndSizeId({ productId, fkSizeId }) {
  try {
    const replacements = [];
    let query = `
      SELECT DISTINCT fk_color_id 
      FROM products_details pd 
      WHERE pd.in_stock = 1 
        AND pd.quantity > 0 
    `;

    if (productId != null) { // ✅ Covers both undefined & null
      query += " AND pd.fk_product_id = ? ";
      replacements.push(productId);
    }

    if (fkSizeId != null) {
      query += " AND pd.fk_size_id = ? ";
      replacements.push(fkSizeId);
    }

    console.log("Executing Query:", query, "Replacements:", replacements);

    const [results] = await sequelize.query(query, { replacements });
    
    return results;
  } catch (error) {
    console.error("❌ Error in findAllAvailableColorsByPidAndSizeId:", error);
    throw error; // ✅ Ensures error is propagated for proper handling
  }
}


async function findAllAvalibaleSizesByPidAndColorId({ productId, fkColorId }) {
  try {
    const replacements = [];
    let query = `
      SELECT DISTINCT fk_size_id 
      FROM products_details pd 
      WHERE pd.quantity > 0 
    `;

    if (productId != null) { // ✅ More concise check
      query += " AND pd.fk_product_id = ? ";
      replacements.push(productId);
    }

    if (fkColorId != null) {
      query += " AND pd.fk_color_id = ? ";
      replacements.push(fkColorId);
    }

    console.log("Executing Query:", query, "Replacements:", replacements);

    const [results] = await sequelize.query(query, { replacements });

    return results;
  } catch (error) {
    console.error("❌ Error in findAllAvailableSizesByPidAndColorId:", error);
    throw error; // ✅ Ensures proper error handling
  }
}

module.exports = { findAllProductsByCatagoryId, findProductsByPdId , findAllAvalibaleColorsByPidAndSizeId , findAllAvalibaleSizesByPidAndColorId };
