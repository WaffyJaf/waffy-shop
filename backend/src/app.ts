import express, { Application } from "express";
import cors from "cors";
import dotenv from "dotenv";
import authrouter from "./router/authrouter";
import adminrouter from "./router/adminrouter";
import productrouter from "./router/productrouter";
import categoryrouter from "./router/categoryrouter";

dotenv.config();
const app : Application = express();
const port : number = Number(process.env.PORT) || 3000 ;

app.use(cors({
  origin: [
    'http://localhost:5173',
  ],
  credentials: true,
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

app.use(express.json());
app.use("/auth",authrouter);
app.use("/admin",adminrouter);
app.use("/product",productrouter);
app.use('/uploads', express.static('D:/NPM I/backend/uploads'));
app.use("/category",categoryrouter);



app.listen(port, () => {
  console.log(`Server is running to port ${port}`);
});
