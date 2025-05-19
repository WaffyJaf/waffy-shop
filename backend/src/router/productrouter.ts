import express,{Request , Response} from 'express';
import { AddProducts, uploadImage, getProduct,getProductsByCategory } from '../controllers/productcontrpller';


const router = express.Router();

router.post("/addproduct", async (req: Request, res: Response) => {
  await AddProducts(req, res);
});

router.post("/uploadimage", async (req: Request, res: Response) => {
  await uploadImage(req, res);
});

router.get("/getproduct", async (req: Request, res: Response) => {
  await  getProduct(req, res);
});

router.get("/category/:categoryId", async (req: Request, res: Response) => {
  await  getProductsByCategory(req, res);
});



export default router ;

