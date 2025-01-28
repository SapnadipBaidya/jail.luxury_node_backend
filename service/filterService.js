import connection from "../config/connection.js";

const sequelize = connection;



export async function getSizeFilterByCatagory(categoryId) {
    try {
      console.log("in itemsService with categoryId:", categoryId);
  
      // Execute the query
      const [results] = await sequelize.query(
        "SELECT * FROM sizes WHERE fk_category_id = ?", // Use placeholders
        {
          replacements: [categoryId],
        }
      );
  
      return results;
    } catch (error) {
      console.error("Error in getSizeFilterByCatagory:", error.message);
      throw new Error("Failed to fetch getSizeFilterByCatagory. Please try again later."); // Return user-friendly error
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
