import cors from 'cors';
import express from "express";
import connection from "../config/dbconnection.js";
import userRouter from '../routes/user.router.js'
import dotenv from 'dotenv'
dotenv.config()

const app = express();

app.use(cors());
app.use(express.json());
app.use(userRouter);


app.listen(3000, () => {
    console.log('Server is running on port 3000');
});
