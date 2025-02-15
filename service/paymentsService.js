import Razorpay from "razorpay";
import connection from "../config/connection.js";
const sequelize = connection;


const razorpay = new Razorpay({
    key_id: process.env.RAZORPAY_KEY_ID || "",
    key_secret: process.env.RAZORPAY_KEY_SECRET,
});

export async function paymentVerification() {
  try {
    console.log("inside verification");
  } catch (error) {
    console.error("Error fetching categories:", error.message);
    throw error; // Rethrow the error for the caller to handle
  }
}

export async function itemsCheckout({currency="INR",name,amount}) {
    try {
        // Create an entry for razorpay
        console.log("itemsCheckout",name,amount)
        const order = await razorpay.orders.create({
          amount: Number(amount * 100),
          currency,
        });    

        // await orderModel.create({
        //   order_id: order.id,
        //   name: name,
        //   amount: amount,
        // });

        console.log("order",order)
        return null;
      } catch (error) {
        console.log(error);
        return null;
      }
}


