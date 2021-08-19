/**
 * App Name : Employee Management (Server)
 * file name : user.controller.js
 * files descriptions : This is the module for controlling the user route.
 * Author : Md Habibul Hasan
 * Date : 17/08/2021
 */

//Dependendicies
require('dotenv').config();
const userModel = require('../models/user.model');
const CsvToJson = require('csvtojson');
const path = require('path');
const fs = require('fs');
const nodemailer = require('nodemailer');

// Email credintials
const { SMTP_HOST, SMTP_PORT, SMTP_USER, SMTP_PASS } = process.env;

// Regular expressions
const emailRE =
  /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

// Getting the users with pagination
const getUsers = async (req, res) => {
  const { page } = req.query;
  const columnNumber = await userModel.count();
  const size = 5;
  const pageNum = Math.floor(columnNumber / size);
  userModel
    .findAll({
      limit: 5,
      offset: (page ? page : 0) * size,
      order: [['id', 'DESC']],
      raw: true,
    })
    .then((data) => {
      res.status(200).send({
        status: 'success',
        code: 200,
        message: 'Getting all user data is successfull',
        pageNum,
        data: data,
      });
    })
    .catch((err) => {
      res.status(500).send({
        status: 'error',
        code: 500,
        message: 'Internal Server Error',
        data: null,
      });
    });
};

// Sending emails to multiple users via Mailgun
const postEmailUserSend = (req, res) => {
  const {
    recipients,
    email: { subject, message },
  } = req.body;

  const transporter = nodemailer.createTransport({
    host: SMTP_HOST,
    port: SMTP_PORT,
    auth: {
      user: SMTP_USER,
      pass: SMTP_PASS,
    },
  });

  transporter.sendMail(
    {
      from: 'programmerhasan0@gmail.com',
      to: recipients,
      subject,
      text: message,
    },
    (err, data) => {
      if (err) {
        console.log(err);
        res.status(421).send({
          status: 'error',
          code: 421,
          message: err.message,
          data: null,
        });
      } else if (!err) {
        console.log(data);
        res.status(200).send({
          status: 'success',
          code: 200,
          message: 'Email has benn sent to your desired users',
          data: null,
        });
      }
    }
  );
};

// Creating user via Form
const postCreateUser = async (req, res) => {
  const { first_name, last_name, email } = req.body;
  if (first_name.length > 1 && last_name.length > 1 && emailRE.test(email)) {
    const findEmail = await userModel.findOne({ where: { email }, raw: true });
    if (findEmail && findEmail.email === email) {
      res.status(409).send({
        status: 'error',
        code: 409,
        message: 'User already exists, please try another email',
        data: null,
      });
    } else {
      userModel
        .create({ first_name, last_name, email })
        .then((result) => {
          res.status(200).send({
            status: 'success',
            code: 200,
            message: 'User created successfully',
            data: null,
          });
        })
        .catch((err) => {
          console.log(err);
          res.status(500).send({
            status: 'error',
            code: 500,
            message: 'Internal server error',
            data: null,
          });
        });
    }
  } else {
    res.status(400).send({
      status: 'error',
      code: 400,
      message: 'Please fill the input correctly',
    });
  }
};

// Creating user via CSV file
const postCreateUserCsv = async (req, res) => {
  if (req.files.file.mimetype === 'text/csv') {
    const filePath = path.join(path.resolve('./'), 'uploads', 'data.csv');
    fs.writeFile(filePath, req.files.file.data, async (err, fileContent) => {
      if (err) {
        res.status(500).send({
          status: 'error',
          code: 500,
          message: 'Internal Server Error',
          data: null,
        });
        return;
      } else {
        const arrData = await CsvToJson().fromFile(filePath);

        const checkedData = arrData.filter((user) => {
          if (
            user.first_name &&
            user.last_name &&
            user.email &&
            user.first_name.length > 1 &&
            user.last_name.length > 1 &&
            emailRE.test(user.email)
          ) {
            return user;
          } else {
            return;
          }
        });

        const filteredData = checkedData.map((user) => ({
          first_name: user.first_name,
          last_name: user.last_name,
          email: user.email,
        }));

        let isExists = false;
        for (let i = 0; i < filteredData.length; i++) {
          const element = filteredData[i];
          const isEmailExised = await userModel.findOne({
            where: { email: element.email },
          });
          if (isEmailExised) {
            isExists = true;
            break;
          } else {
            continue;
          }
        }
        if (isExists) {
          res.status(409).send({
            status: 'error',
            code: 409,
            message:
              'An User is Already Exists from the csv file, Please upload a CSV file that has all new Users',
            data: {
              total: 0,
              success: 0,
              failed: 0,
            },
          });
        } else {
          userModel
            .bulkCreate(filteredData)
            .then((result) => {
              res.status(200).send({
                status: 'success',
                code: 200,
                message: 'Users created successfully from the CSV file',
                data: {
                  total: arrData.length,
                  success: filteredData.length,
                  failed: arrData.length - filteredData.length,
                },
              });
            })
            .catch((err) => {
              res.status(500).send({
                status: 'error',
                code: 500,
                message: 'Internal Server Error',
                data: null,
              });
            });
        }
      }
    });
  } else {
    res.status(400).send({
      status: 'error',
      code: 400,
      message: 'Please Upload a valid CSV file.',
      data: null,
    });
  }
};

//All Exports ==> GET
module.exports.getUsers = getUsers;

// All Exports ==> POST
module.exports.postEmailUserSend = postEmailUserSend;
module.exports.postCreateUser = postCreateUser;
module.exports.postCreateUserCsv = postCreateUserCsv;
