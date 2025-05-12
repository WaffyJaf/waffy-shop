import express,{Request , Response} from 'express';
import { createCategory ,getAllCategories ,deleteCategory } from "../controllers/categoryController";


const router = express.Router();

router.post("/createcategory", async (req: Request, res: Response) => {
  await createCategory(req, res);
});

router.get("/", async (req: Request, res: Response) => {
  await getAllCategories(req, res);
});

router.delete("/delete/:id", async (req: Request, res: Response) => {
  await deleteCategory(req, res);
});

export default router ;