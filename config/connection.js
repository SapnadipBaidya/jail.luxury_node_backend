import { Sequelize } from "sequelize";
import dotenv from "dotenv";
dotenv.config();
// Allows for environmental variables to be used
console.log("sqeee",process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW)
const connection = new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
  host: process.env.DB_IP,
  dialect: "mysql",
  dialectOptions: {
    decimalNumbers: true,
  },
});

export default connection;