import connection from "../config/connection.js";

const sequelize = connection;


export async function getSizeFilterByCategory(categoryName) {
  try {
    // Validate input
    if (!categoryName || typeof categoryName !== "string") {
      throw new Error("Invalid category name provided.");
    }

    console.log("Fetching sizes for category:", categoryName);

    let results;

    // Execute the query safely using placeholders
    if (categoryName === "search") {
      [results] = await sequelize.query(
        `SELECT * 
         FROM sizes`
      );
    } else {
      [results] = await sequelize.query(
        `SELECT * 
        FROM sizes 
        WHERE fk_category_id = (
            SELECT catagory_id  
            FROM product_catagory 
            WHERE catagory_name = ?
        )`,
        { replacements: [categoryName] }
      );
    }

    // Ensure results exist before returning
    if (!results || results.length === 0) {
      console.warn(`No sizes found for category: ${categoryName}`);
      return []; // Return an empty array if no sizes are found
    }

    return results;
  } catch (error) {
    console.error("Error in getSizeFilterByCategory:", error);
    throw new Error("Failed to fetch size filters. Please try again later.");
  }
}


 export async function getAllColors() {
    try {
      const [results] = await sequelize.query(
        "SELECT * FROM product_colors"
      );
  
      return results; // Return the fetched results
    } catch (error) {
      console.error("Error fetching categories:", error.message);
      throw error; // Rethrow the error for the caller to handle
    }
  }
