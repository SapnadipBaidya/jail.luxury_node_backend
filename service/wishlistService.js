const sequelize = require("../config/connection");

async function addOrEditWishlist({ userId, productsDetailsId, product_id }) {
    try {
        if (!userId || !productsDetailsId || !product_id) {
            throw new Error("Missing required parameters: userId, productsDetailsId, or product_id");
        }

        // ✅ Get or Create Wishlist ID
        let wishlistId;
        const [wishlistResult] = await sequelize.query(
            `SELECT wishlist_id FROM wishlist WHERE fk_user_id = ? LIMIT 1`,
            { replacements: [userId] }
        );

        if (wishlistResult.length > 0) {
            wishlistId = wishlistResult[0].wishlist_id;
        } else {
            console.log(`✅ Creating wishlist for user ID: ${userId}`);
            const [wishlistInsert] = await sequelize.query(
                `INSERT INTO wishlist (fk_user_id) VALUES (?)`,
                { replacements: [userId] }
            );
            wishlistId = wishlistInsert.insertId;
            console.log(`✅ New wishlist created (ID: ${wishlistId})`);
        }

        console.log("Wishlist ID:", wishlistId);

        // ✅ Check if product already exists in the wishlist
        const [existingItem] = await sequelize.query(
            `SELECT wish_item_id FROM wishlist_items 
             WHERE fk_products_details_id = ? AND fk_product_id = ? AND fk_wishlist_id = ? LIMIT 1`,
            { replacements: [productsDetailsId, product_id, wishlistId] }
        );

        if (existingItem.length > 0) {
            await deleteFromUserWishlist({ userId, productsDetailsId, product_id });
            console.log(`✅ Product (ID: ${product_id}) removed from wishlist.`);
            return { success: true, action: "removed", message: "Product removed from wishlist." };
        } else {
            console.log(`✅ Adding product to wishlist (fk_wishlist_id: ${wishlistId})`);
            await sequelize.query(
                `INSERT INTO wishlist_items (fk_products_details_id, fk_product_id, fk_wishlist_id, created_at)
                 VALUES (?, ?, ?, NOW())`,
                { replacements: [productsDetailsId, product_id, wishlistId] }
            );
            console.log(`✅ Product (ID: ${product_id}) added to wishlist.`);
            return { success: true, action: "added", message: "Product added to wishlist." };
        }
    } catch (error) {
        console.error("❌ Error updating wishlist:", error.message);
        return { success: false, message: "Failed to update wishlist." };
    }
}

async function deleteFromUserWishlist({ userId, productsDetailsId, product_id }) {
    try {
        if (!productsDetailsId || !product_id || !userId) {
            throw new Error("Missing required parameters: productsDetailsId, product_id, or userId");
        }

        const [result] = await sequelize.query(
            `DELETE FROM wishlist_items 
             WHERE fk_products_details_id = ? 
             AND fk_product_id = ? 
             AND fk_wishlist_id IN (SELECT wishlist_id FROM wishlist WHERE fk_user_id = ?)`,
            { replacements: [productsDetailsId, product_id, userId] }
        );

        if (result.affectedRows > 0) {
            console.log(`✅ Product (ID: ${product_id}) successfully removed from wishlist.`);
            return { success: true, message: "Product removed from wishlist." };
        } else {
            console.log(`⚠️ Product (ID: ${product_id}) not found in wishlist.`);
            return { success: false, message: "Product not found in wishlist." };
        }
    } catch (error) {
        console.error("❌ Error deleting from wishlist:", error.message);
        return { success: false, message: "Failed to remove product from wishlist." };
    }
}

async function fetchUserWishlist({ userId }) {
    try {
        if (!userId) throw new Error("Missing required parameter: userId");

        let query = `
        SELECT 
            p.product_id, 
            JSON_OBJECT(
                'product_id', p.product_id,
                'product_price_inr', pd.product_price_inr,
                'product_name', p.product_name,
                'products_details_id', pd.product_detail_id
            ) AS product_details,
            JSON_OBJECT(
                'gallery', g.product_gallrey
            ) AS gallery_details
        FROM 
            wishlist_items wi 
        JOIN 
            products p ON p.product_id = wi.fk_product_id
        LEFT JOIN 
            products_details pd ON pd.product_detail_id = wi.fk_products_details_id   
        LEFT JOIN 
            product_gallarey g ON pd.fk_gallery_id = g.product_img_id   
        LEFT JOIN 
            wishlist w ON w.wishlist_id = wi.fk_wishlist_id
        WHERE w.fk_user_id = ?`;

        const [results] = await sequelize.query(query, { replacements: [userId] });

        console.log(`✅ Fetched ${results.length} wishlist items for user ID: ${userId}`);
        return results;
    } catch (error) {
        console.error("❌ Error fetching wishlist:", error.message);
        return { success: false, message: "Failed to fetch wishlist." };
    }
}

module.exports = { addOrEditWishlist, fetchUserWishlist, deleteFromUserWishlist };