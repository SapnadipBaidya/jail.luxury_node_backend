const sequelize = require("../config/connection");

async function addOrEditWishlist({ productsDetailsId, product_id }) {
  try {
  } catch (error) {
    console.error(error);
  }
}

async function fetchUserWishlist({ userId }) {
  try {
    console.log("userId", userId);
    const replacements = [];
    let query = ` SELECT 
   p.product_id , 
   JSON_OBJECT(
      'product_id', p.product_id,
      'product_price_inr', pd.product_price_inr,
      'product_name', p.product_name,
      'products_details_id',pd.product_detail_id,
      'image',g.product_gallrey
    ) AS wishlist_details
    FROM 
      wishlist_items wi 
    JOIN 
      products p ON p.product_id = wi.fk_product_id
    left JOIN 
      products_details pd ON pd.product_detail_id = wi.fk_products_details_id   
    LEFT JOIN 
      product_gallarey g ON pd.fk_gallery_id = g.product_img_id   
    LEFT JOIN 
      wishlist w ON w.wishlist_id  = wi.fk_wishlist_id
    
    WHERE 1=1
    `;

    if (userId != undefined && userId != null) {
      query += " AND w.fk_user_id = ?";
      replacements.push(userId);
    }

    const [results] = await sequelize.query(query, { replacements });
    console.log(`Fetched ${results}`);
    return results;
  } catch (error) {
    console.error(error);
  }
}
module.exports = { addOrEditWishlist, fetchUserWishlist };
