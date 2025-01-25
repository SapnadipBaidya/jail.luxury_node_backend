const sequelize = require("../config/connection");

async function addOrEditCart({
  userId,
  productsDetailsId,
  product_id,
  quantity,
}) {
  try {
    // ✅ Validate input parameters
    if (!userId || !productsDetailsId || !product_id || !quantity) {
      throw new Error(
        "Missing required parameters: userId, productsDetailsId, or product_id"
      );
    }

    // ✅ Check if the user has an existing carts
    const [cartResult] = await sequelize.query(
      `SELECT cart_id FROM carts WHERE fk_user_id = ?`,
      { replacements: [userId] }
    );

    let cartId;
    if (cartResult.length > 0) {
      cartId = cartResult[0].cart_id; // ✅ Use existing carts
    } else {
      // ✅ Create a new carts for the user if none exists
      console.log(`✅ proceeding to create cart for user ID: ${userId}`);
      const [cartInsert] = await sequelize.query(
        `INSERT INTO carts (fk_user_id) VALUE (?)`,
        { replacements: [userId] }
      );
      cartId = cartInsert; // ✅ Retrieve new carts ID
      console.log(cartInsert);
      console.log(
        `✅ Created new carts for user ID: ${userId} (ID: ${cartId})`
      );
    }

    console.log("cartId is ", cartId);

    // ✅ Check if the product is already in the user's carts
    const [existingItem] = await sequelize.query(
      `SELECT * FROM cart_items 
             WHERE fk_product_details_id = ? 
             AND fk_product_id = ? 
             AND fk_cart_id = ?`,
      { replacements: [productsDetailsId, product_id, cartId] ,type: sequelize.QueryTypes.SELECT}
    );
    console.log("existingItem  is ", existingItem);

    const [productPriceInr] = await sequelize.query(
      `SELECT product_price_inr FROM products_details WHERE product_detail_id = ?`,
      { replacements: [productsDetailsId], type: sequelize.QueryTypes.SELECT }
    );
    console.log("productPriceInr", productPriceInr);

    if (!productPriceInr) {
      throw new Error(`Product details not found for ID: ${productsDetailsId}`);
    }

    const itemPrice = productPriceInr.product_price_inr; // Extract the price from the query result

    let modifiedQuantity = existingItem?.quantity ? existingItem?.quantity : 0
    console.log("modifiedQuantity",modifiedQuantity,"quantity",quantity)
    modifiedQuantity += quantity;
    if (existingItem  && modifiedQuantity > 0) {
      await sequelize.query(
        `UPDATE cart_items SET item_price = ?, quantity = ?, fk_product_id = ?, fk_cart_id = ?, updated_at = NOW() WHERE fk_product_details_id = ?;`, // Fixed: Added a missing value for fk_cart_id
        {
          replacements: [
            itemPrice,
            modifiedQuantity,
            product_id,
            cartId,
            productsDetailsId,
          ],
        } // Ensure correct order
      );

      console.log(
        `✅ Product (ID: ${product_id}) existingItem?.quantity  ` +
          modifiedQuantity
      );
      return {
        success: true,
        action: "updated",
        message: "Product quantity and price updated to carts.",
      };
    }
    console.log("trying to  insert :: no exisitng item");

    // Insert into cart_items
    await sequelize.query(
      `INSERT INTO cart_items (fk_product_details_id, item_price,quantity, fk_product_id, fk_cart_id, created_at)
                 VALUES (?, ?, ? ,?, ?, NOW())`, // Fixed: Added a missing value for fk_cart_id
      {
        replacements: [
          productsDetailsId,
          itemPrice,
          modifiedQuantity,
          product_id,
          cartId,
        ],
      } // Ensure correct order
    );

    console.log(
      `✅ Added product ${product_id} with price ${itemPrice} to cart ${cartId}`
    );
    return {
      success: true,
      action: "added",
      message: "Product added to carts.",
    };
  } catch (error) {
    console.error("❌ Error updating carts:", error.message);
    return { success: false, message: "Failed to update carts." };
  }
}

async function deleteFromUserCart({ userId, productsDetailsId, product_id }) {
  try {
    // Validate input parameters
    if (!productsDetailsId || !product_id) {
      throw new Error(
        "Missing required parameters: productsDetailsId or product_id"
      );
    }

    // Execute DELETE query
    const result = await sequelize.query(
      `DELETE FROM cart_items 
             WHERE fk_product_details_id = ? 
             AND fk_product_id = ? AND fk_cart_id IN (SELECT cart_id FROM carts WHERE fk_user_id = ?)`,
      { replacements: [productsDetailsId, product_id, userId] }
    );

    // Check if a row was deleted
    if (result[0].affectedRows > 0) {
      console.log(
        `✅ Product (ID: ${product_id}) successfully removed from carts.`
      );
      return { success: true, message: "Product removed from carts." };
    } else {
      console.log(`⚠️ Product (ID: ${product_id}) not found in carts.`);
      return { success: false, message: "Product not found in carts." };
    }
  } catch (error) {
    console.error("❌ Error deleting from carts:", error.message);
    return { success: false, message: "Failed to remove product from carts." };
  }
}

async function fetchUserCart({ userId }) {
  try {
    console.log("userId", userId);
    const replacements = [];
    let query = ` SELECT p.product_id , 
    JSON_OBJECT(
      'product_id', p.product_id,
      'product_price_inr', pd.product_price_inr,
      'product_name', p.product_name,
      'products_details_id',pd.product_detail_id
    ) AS product_details,
     JSON_OBJECT(
     'gallery',g.product_gallrey
     ) AS gallery_details,
     JSON_OBJECT(
     'itemPrice',ci.item_price,
     'quantity',ci.quantity
     ) AS cart_details,
     JSON_OBJECT(
     'size_name', s.size_name,
     'pkSizeId',s.pk_size_id
     ) AS size_details
     FROM 
      cart_items ci 
     JOIN 
      products p ON p.product_id = ci.fk_product_id
    left JOIN 
      products_details pd ON pd.product_detail_id = ci.fk_product_details_id   
    LEFT JOIN 
      product_gallarey g ON pd.fk_gallery_id = g.product_img_id  
    LEFT JOIN 
      sizes s ON pd.fk_size_id = s.pk_size_id  
    LEFT JOIN 
      carts c ON c.cart_id  = ci.fk_cart_id
    WHERE 1=1
    `;

    if (userId != undefined && userId != null) {
      query += " AND c.fk_user_id = ?";
      replacements.push(userId);
    }

    const [results] = await sequelize.query(query, { replacements });
    console.log(`Fetched ${results}`);
    return results;
  } catch (error) {
    console.error(error);
  }
}
module.exports = { addOrEditCart, fetchUserCart, deleteFromUserCart };
