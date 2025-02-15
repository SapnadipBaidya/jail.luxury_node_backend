import express from "express";
import { verifyToken } from "../../utils/verifyToken.js";
import { handleRequest } from "../../utils/handleRequest.js";
import * as paymentController from "../../controllers/paymentController.js";

const router = express.Router();


// ✅ checkout Route
router.post("/checkout", verifyToken, async (req, res) => {
  await handleRequest(req, res, paymentController.checkout);
});

// ✅ verification route
router.post("/verification", verifyToken, async (req, res) => {
  await handleRequest(req, res, paymentController.verification);
});


export default router;