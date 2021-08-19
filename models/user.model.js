/**
 * App Name : Employee Management (Server)
 * file name : user.model.js
 * files descriptions : This module is for the users table in the database.
 * Author : Md Habibul Hasan
 * Date : 17/08/2021
 */

const db = require('../utils/db');
const { Sequelize, DataTypes, Model } = require('sequelize');

class User extends Model {}

User.init(
  {
    first_name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    last_name: {
      allowNull: false,
      type: DataTypes.STRING,
    },
    email: {
      allowNull: false,
      type: DataTypes.STRING,
      unique: true,
    },
  },
  {
    modelName: 'user',
    sequelize: db,
  }
);

module.exports = User;
