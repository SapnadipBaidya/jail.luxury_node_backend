require("dotenv").config();

const Sequelize = require("sequelize");

// Allows for environmental variables to be used
const sequelize =  new Sequelize(process.env.DB_NAME, process.env.DB_USER, process.env.DB_PW, {
      host: process.env.DB_IP,
      dialect: "mysql",
      dialectOptions: {
        decimalNumbers: true,
      },
    });

module.exports = sequelize;
