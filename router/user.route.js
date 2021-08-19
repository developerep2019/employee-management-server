/**
 * App Name : Employee Management (Server)
 * file name : user.route.js
 * files descriptions : This module is for controlling the routes in the server.
 * Author : Md Habibul Hasan
 * Date : 17/08/2021
 */

const router = require('express').Router();
const {
  getUsers,
  postEmailUserSend,
  postCreateUser,
  postCreateUserCsv,
} = require('../controllers/users.controller');

// All GET Routes ==>
router.get('/users', getUsers);

// All POST Routes ==>
router.post('/user-email-send', postEmailUserSend);
router.post('/create-user', postCreateUser);
router.post('/create-user-csv', postCreateUserCsv);

module.exports = router;
