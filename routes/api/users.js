import express from "express";
import { verifyToken } from "../../utils/verifyToken.js";
import * as usersController from "../../controllers/usersController.js";

const router = express.Router();

// ✅ Helper function to handle common logic
const handleRequest = async (req, res, controllerMethod) => {
  try {
    const { payloadObj } = req.body;
    payloadObj.userId = req.user.user_id; // Attach userId from the authenticated user

    console.log("Request Payload:", payloadObj);

    const data = await controllerMethod(payloadObj);
    res.status(200).json({ success: true, data });
  } catch (error) {
    console.error("Error in request handler:", error.message);
    res.status(500).json({ success: false, message: error.message });
  }
};

// ✅ Add or Edit User Address
router.post("/addOrEditUserAddress", verifyToken, async (req, res) => {
  await handleRequest(req, res, usersController.addOrEditUserAddress);
});

// ✅ Delete User Address
router.post("/deleteUserAddress", verifyToken, async (req, res) => {
  await handleRequest(req, res, usersController.deleteUserAddress);
});

// ✅ Get User Addresses
router.post("/getUserAddresses", verifyToken, async (req, res) => {
  await handleRequest(req, res, usersController.getUserAddresses);
});

export default router;