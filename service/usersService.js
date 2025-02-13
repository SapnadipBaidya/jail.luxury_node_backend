import connection from "../config/connection.js";
import Addresses from "../models/Addresses.js";

const sequelize = connection;

export async function addOrEditUserAddress({
    userId,
    addressLine1,
    addressLine2="",
    state,
    country,
    pincode,
    defaultAddress = 0,
    addressId = null,
    addressName = ""
  }) {
    try {
      // ✅ Validate input parameters
      if (!userId || !addressLine1 || !state || !country || !pincode) {
        throw new Error("Missing required parameters: userId, addressLine1, state, country, pincode");
      }
  
      // ✅ Get user_address entry (FIXED: Properly handle query result)
      const [userAddressRows] = await sequelize.query(
        `SELECT user_address_id FROM user_address WHERE fk_user_id = ?`,
        { replacements: [userId], type: sequelize.QueryTypes.SELECT }
      );
      
      let userAddressId;
      if (userAddressRows?.user_address_id) {
        userAddressId = userAddressRows?.user_address_id;
      } else {
        // ✅ Create new user_address entry
        const [addressInsert] = await sequelize.query(
          `INSERT INTO user_address (fk_user_id) VALUES (?)`,
          { replacements: [userId] }
        );
        userAddressId = addressInsert.insertId;
        console.log(`✅ Created user_address entry (ID: ${userAddressId})`);
      }
  
      // ✅ Check for existing address (optimized query)
      const existingAddress = await Addresses.findOne({
        where: {
          address_id :addressId,
          fk_user_adderess_id: userAddressId
        }
      });
  
      if (existingAddress) {
        // ✅ Update existing address
        await existingAddress.update({ is_default: defaultAddress , address_name:addressName  });
        return { 
          success: true, 
          action: "updated", 
          message: "Address updated successfully",
          addressId: existingAddress.address_id,
         
        };
      }
  
      // ✅ Create new address
      const newAddress = await Addresses.create({
        adress_line1: addressLine1,
        adress_line2: addressLine2,
        state,
        country,
        pincode,
        is_default: defaultAddress,
        fk_user_adderess_id: userAddressId,
        address_name:addressName 
      });
  
      return { 
        success: true, 
        action: "added", 
        message: "Address added successfully",
        addressId: newAddress.address_id 
      };
  
    } catch (error) {
      console.error("❌ Address update error:", error.message);
      return { 
        success: false, 
        message: `Address operation failed: ${error.message}` 
      };
    }
  }


  export async function deleteUserAddress({ userId, addressId = null }) {
    try {
      // ✅ Validate input parameters
      if (!addressId || !userId) {
        throw new Error("Missing required parameters: addressId and userId");
      }
  
      // ✅ Get user_address entry
      const [userAddressRows] = await sequelize.query(
        `SELECT user_address_id FROM user_address WHERE fk_user_id = ?`,
        { replacements: [userId], type: sequelize.QueryTypes.SELECT }
      );
  
      // ✅ Check if user_address exists
      if (!userAddressRows?.user_address_id) {
        throw new Error("User address not found for the given userId");
      }
  
      const userAddressId = userAddressRows?.user_address_id;
  
      // ✅ Execute DELETE query
      const [result] = await sequelize.query(
        `DELETE FROM addresses 
         WHERE address_id = ? 
         AND fk_user_adderess_id = ?`,
        { replacements: [addressId, userAddressId] }
      );
  
      // ✅ Check if a row was deleted
      if (result.affectedRows > 0) {
        console.log(`✅ Address (ID: ${addressId}) successfully deleted.`);
        return { success: true, message: "Address deleted successfully." };
      } else {
        console.log(`⚠️ Address (ID: ${addressId}) not found.`);
        return { success: false, message: "Address not found." };
      }
    } catch (error) {
      console.error("❌ Error deleting address:", error.message);
      return {
        success: false,
        message: `Failed to delete address: ${error.message}`,
      };
    }
  }


export async function getUserAddresses({ userId }) {
  try {


          // ✅ Validate input parameters
          if (!userId) {
            throw new Error("Missing required parameters: addressId and userId");
          }
      
          // ✅ Get user_address entry
          const [userAddressRows] = await sequelize.query(
            `SELECT user_address_id FROM user_address WHERE fk_user_id = ?`,
            { replacements: [userId], type: sequelize.QueryTypes.SELECT }
          );
      
          // ✅ Check if user_address exists
          if (!userAddressRows?.user_address_id) {
            throw new Error("User address not found for the given userId");
          }
      
          const userAddressId = userAddressRows?.user_address_id;
  
          
    console.log("userId", userId);
    const existingAddressesResult = await Addresses.findAll({
        where: {
          fk_user_adderess_id: userAddressId
        }
      });

    console.log(`Fetched ${existingAddressesResult}`);
    return existingAddressesResult;
  } catch (error) {
    console.error(error);
  }
}
