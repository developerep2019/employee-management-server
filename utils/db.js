/**
 * App Name : Employee Management (Server)
 * file name : user.model.js
 * files descriptions : This is the database connection.
 * Author : Md Habibul Hasan
 * Date : 18/08/2021
 */

const Sequelize = require('sequelize');
require('dotenv').config();

const { DB_NAME, DB_USER, DB_PASS } = process.env;

const db = new Sequelize(DB_NAME, DB_USER, DB_PASS, {
  host: 'localhost',
  dialect: 'mysql',
});

module.exports = db;
