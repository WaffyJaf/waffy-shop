import express,{Request , Response} from 'express';
import { AddProducts, uploadImage } from '../controllers/productcontrpller';


const router = express.Router();

router.post("/addproduct", async (req: Request, res: Response) => {
  await AddProducts(req, res);
});

router.post("/uploadimage", async (req: Request, res: Response) => {
  await uploadImage(req, res);
});


export default router ;

