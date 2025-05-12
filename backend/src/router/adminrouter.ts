import express,{Request , Response} from 'express';
import { updateRole , getUserData, deleteUser} from "../controllers/admincontroller";

const router = express.Router();

router.post("/updaterole", async (req: Request, res: Response) => {
  await updateRole(req, res);
});

router.get("/userdata", async (req: Request, res: Response) => {
  await getUserData(req, res);
});

router.delete("/deleteuser/:user_id", async (req: Request, res: Response) => {
  await deleteUser(req, res); 
});

export default router;