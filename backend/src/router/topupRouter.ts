import express, { Request, Response } from 'express';
import { createTopupRequest , processSlipHandler ,uploadSlip } from '../controllers/topupcontroller';
import upload from '../middleware/uploadMiddleware'; 
const router = express.Router();


router.post('/create', upload.none(), async (req: Request, res: Response) => {
  await createTopupRequest(req, res);
});

router.post('/upload-slip', upload.single('slip_image'), async (req: Request, res: Response) => {
  await uploadSlip(req, res);
});

router.post('/process-slip', async (req: Request, res: Response) => {
  await processSlipHandler(req, res);
});

export default router;