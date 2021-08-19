/**
 * App Name : Employee Management (Server)
 * file name : index.js
 * files descriptions : this is the entry point of the server
 * Author : Md Habibul Hasan
 * Date : 17/08/2021
 */

const express = require('express');
const cors = require('cors');
const db = require('./utils/db');
const fileUpload = require('express-fileupload');

//routers
const userRouter = require('./router/user.route');

const app = express();

app.use(express.json());
app.use(fileUpload());
app.use(express.urlencoded({ extended: false }));
app.use(cors());
app.use(userRouter);

db.sync();
const port = process.env.PORT || 5000;
app.listen(port, () => {
  console.log(`listening from port ${port}`);
});
