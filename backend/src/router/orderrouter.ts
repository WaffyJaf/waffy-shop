import express,{Request , Response} from 'express';
import { AddCart , getCart,updateCart,RemoveCart } from '../controllers/ordercontroller';

const router = express.Router();

router.post("/addcart", async (req: Request, res: Response) => {
  await AddCart(req, res);
});

router.get("/:userId", async (req: Request, res: Response) => {
  await getCart(req, res);
});

router.put("/:itemId", async (req: Request, res: Response) => {
  await updateCart(req, res);
});

router.delete("/:itemId", async (req: Request, res: Response) => {
  await RemoveCart(req, res);
});


export default router ;