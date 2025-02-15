import connection from "../config/connection.js";
const sequelize = connection;


export async function verification() {
  try {
    console.log("inside verification");
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw error; // Rethrow the error for the caller to handle
  }
}

export async function checkout() {
  try {
    console.log("inside checkout");
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw error; // Rethrow the error for the caller to handle
  }
}


