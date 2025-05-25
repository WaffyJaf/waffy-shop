import express, { Application } from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authrouter from './router/authrouter';
import adminrouter from './router/adminrouter';
import productrouter from './router/productrouter';
import categoryrouter from './router/categoryrouter';
import orderrouter from './router/orderrouter';
import topuprouter from './router/topupRouter';
import path from 'path';

dotenv.config();
const app: Application = express();
const port: number = Number(process.env.PORT) || 3000;

app.use(
  cors({
    origin: [
      'http://localhost:5173',
      'https://waffy-shop-frontend.onrender.com' 
    ],
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
    allowedHeaders: ['Content-Type', 'Authorization'],
  })
);

app.use(express.json());
app.use('/auth', authrouter);
app.use('/admin', adminrouter);
app.use('/product', productrouter);
app.use('/uploads', express.static(path.join(__dirname, '../uploads')));
app.use('/qrcode', express.static(path.join(__dirname, '../qrcode')));
app.use('/slips', express.static(path.join(__dirname, '../slips')));
app.use('/category', categoryrouter);
app.use('/order', orderrouter);
app.use('/topups', topuprouter);

app.listen(port, () => {
  console.log(`Server is running on port ${port}`);
});