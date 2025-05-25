import express,{Request , Response} from 'express';
import { AddCart , getCart,updateCart,RemoveCart,CreateOrder,getOrdersByUser } from '../controllers/ordercontroller';

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

router.post("/createorder", async (req: Request, res: Response) => {
  await CreateOrder(req, res);
});

router.get("/get/:userId", async (req: Request, res: Response) => {
  await getOrdersByUser(req, res);
});


export default router ;