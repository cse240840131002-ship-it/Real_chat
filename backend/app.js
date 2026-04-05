import dotenv from "dotenv";
dotenv.config();

import express from 'express';
import morgan from 'morgan';
import connect from './db/db.js';
import useRoutes from './routes/user.routes.js';
import projectRoutes from './routes/project.routes.js'; 
import aiRoutes from './routes/ai.routes.js';
import cookieParser from 'cookie-parser';
import cors from 'cors';

connect();

const app= express();

app.use(morgan('dev'));
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({extended:true}));
app.use(cookieParser());
app.use('/users',useRoutes);
app.use('/projects',projectRoutes);
app.use('/ai', aiRoutes);


app.get('/',(req,res)=>{
    res.send('hello world!');
});
export default app;