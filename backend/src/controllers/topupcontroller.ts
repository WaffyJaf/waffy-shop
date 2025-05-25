import { Request, Response } from 'express';
import Tesseract from 'tesseract.js';
import { PrismaClient, topups_status } from '@prisma/client';
import path from 'path';
import fs from 'fs';
import { createTopup, generateQRCode, readQRFromImage,parseQRSlipData , SlipData  } from '../services/topupService';

const prisma = new PrismaClient();

export const createTopupRequest = async (req: Request, res: Response) => {
  try {
    const { user_id, amount, payment_method } = req.body;

    console.log('createTopupRequest body:', req.body);

    if (!user_id || !amount || !payment_method) {
      return res.status(400).json({ error: 'Missing required fields' });
    }

    const topupData = {
      user_id: parseInt(user_id),
      amount: Number(amount),
      payment_method,
    };

    const topup = await createTopup(topupData);
    const qrCodePath = await generateQRCode(topupData.amount);

    res.status(201).json({
      message: 'Top-up request created successfully',
      topup,
      qrCode: qrCodePath,
    });
  } catch (error: any) {
    console.error('Error in createTopupRequest:', error);
    res.status(500).json({ error: `Internal server error: ${error.message || 'Unknown error'}` });
  }
};

export const uploadSlip = async (req: Request, res: Response) => {
  try {
    const { topupId } = req.body;
    const slipImage = req.file?.filename;

    console.log('uploadSlip body:', req.body);
    console.log('uploadSlip file:', req.file);
    console.log('topupId:', topupId);
    console.log('slipImage:', slipImage);

    if (!topupId) {
      return res.status(400).json({ error: 'Missing topupId' });
    }
    if (!req.file) {
      return res.status(400).json({ error: 'No slip image uploaded' });
    }
    if (!slipImage) {
      return res.status(400).json({ error: 'Failed to process slip image' });
    }

    const topupIdNum = parseInt(topupId);
    if (isNaN(topupIdNum)) {
      return res.status(400).json({ error: 'Invalid topupId' });
    }

    const topup = await prisma.topups.findUnique({
      where: { id: topupIdNum },
    });

    if (!topup) {
      return res.status(404).json({ error: 'Top-up request not found' });
    }

    const slipImagePath = `/slips/${slipImage}`;
    const fullPath = path.join(__dirname, '../../slips', slipImage);
    console.log('Saving slipImagePath:', slipImagePath);
    console.log('Full file path:', fullPath);

    if (!fs.existsSync(fullPath)) {
      console.error('Slip image not found at:', fullPath);
      return res.status(500).json({ error: 'Slip image file not found after upload' });
    }

    await prisma.topups.update({
      where: { id: topupIdNum },
      data: { slip_image: slipImagePath },
    });

    res.status(200).json({
      message: 'Slip uploaded successfully',
      slipImage: slipImagePath,
    });
  } catch (error: any) {
    console.error('Error in uploadSlip:', error);
    res.status(500).json({ error: `Internal server error: ${error.message || 'Unknown error'}` });
  }
};

export const processSlipHandler = async (req: Request, res: Response) => {
  try {
    const { topupId } = req.body;

    // Validate topupId
    if (!topupId) {
      return res.status(400).json({ error: 'Missing topupId' });
    }

    const topupIdNum = parseInt(topupId, 10);
    if (isNaN(topupIdNum) || topupIdNum <= 0) {
      return res.status(400).json({ error: 'Invalid topupId: must be a positive number' });
    }

    // Fetch top-up record
    const topup = await prisma.topups.findUnique({
      where: { id: topupIdNum },
    });

    if (!topup) {
      return res.status(404).json({ error: 'Top-up request not found' });
    }

    if (!topup.slip_image) {
      return res.status(400).json({ error: 'No slip image associated with this top-up' });
    }

    // Construct and validate slip image path
    const slipImagePath = path.resolve(__dirname, '../../slips', path.basename(topup.slip_image));
    
    // Security: Ensure path is within expected directory to prevent path traversal
    const slipsDir = path.resolve(__dirname, '../../slips');
    if (!slipImagePath.startsWith(slipsDir)) {
      console.error('[Slip Handler] Invalid slip image path:', slipImagePath);
      return res.status(400).json({ error: 'Invalid slip image path' });
    }

    if (!fs.existsSync(slipImagePath)) {
      console.error('[Slip Handler] Slip image not found at:', slipImagePath);
      return res.status(400).json({ error: 'Slip image file not found' });
    }

    // Read QR code from slip image
    let qrData: string | null = null;
    try {
      qrData = await readQRFromImage(slipImagePath);
      if (!qrData) {
        return res.status(400).json({
          error: 'No QR code found in slip image',
          suggestion: 'Please ensure the slip image contains a clear, readable QR code',
        });
      }
      console.log('[Slip Handler] Successfully extracted QR data:', qrData.substring(0, 100));
    } catch (err) {
      console.error('[Slip Handler] QR code reading error:', err);
      return res.status(500).json({
        error: 'Failed to read QR code from slip image',
        details: err instanceof Error ? err.message : 'Unknown error',
      });
    }

    // Parse QR data
    const slipData: SlipData = parseQRSlipData(qrData);

    // Validate extracted amount
    if (!slipData.amount || slipData.amount <= 0) {
      console.warn('[Slip Handler] Failed to extract valid amount from QR data:', slipData);
      return res.status(400).json({
        error: 'Unable to extract valid amount from QR code',
        slipData,
        qrData: qrData.length > 200 ? qrData.substring(0, 200) + '...' : qrData,
        suggestion: 'Ensure the QR code contains a valid amount (e.g., EMVCo tag 54)',
      });
    }

    // Convert and validate dateTime (handle Buddhist calendar)
    let parsedDateTime: string = slipData.dateTime;
    if (parsedDateTime.match(/\d{1,2}\/\d{1,2}\/25\d{2}/)) {
      parsedDateTime = parsedDateTime.replace(/25(\d{2})/, '20$1');
      console.log('[Slip Handler] Converted Buddhist dateTime to Gregorian:', parsedDateTime);
    }

    // Validate transactionId and reference
    const transactionRef = slipData.transactionId || slipData.reference || null;
    if (!transactionRef) {
      console.warn('[Slip Handler] No transactionId or reference found in QR data');
    }

    // Compare amounts
    const expectedAmount = parseFloat(topup.amount.toString());
    const tolerance = 0.01; // Allow small floating-point differences
    if (Math.abs(slipData.amount - expectedAmount) <= tolerance) {
      // Update top-up status
      await prisma.topups.update({
        where: { id: topupIdNum },
        data: {
          status: topups_status.SUCCESS,
          confirmed_at: parsedDateTime ? new Date(parsedDateTime) : new Date(),
          transaction_ref: transactionRef,
          payment_method: 'QR_SLIP_VERIFICATION',
        },
      });

      return res.status(200).json({
        message: 'Slip verified successfully via QR code, top-up status updated to SUCCESS',
        slipData: {
          ...slipData,
          dateTime: parsedDateTime,
        },
        method: 'QR_CODE',
        transactionRef,
      });
    } else {
      return res.status(400).json({
        error: 'Amount mismatch',
        expected: expectedAmount,
        found: slipData.amount,
        slipData: {
          ...slipData,
          dateTime: parsedDateTime,
        },
        method: 'QR_CODE',
        suggestion: 'Ensure the QR code amount matches the expected top-up amount',
      });
    }
  } catch (error: any) {
    console.error('[Slip Handler] Error in processSlipHandler:', {
      error: error.message,
      stack: error.stack,
      topupId: req.body.topupId,
    });
    return res.status(500).json({
      error: 'Internal server error',
      message: error.message || 'Unknown error',
      suggestion: 'Please try again or contact support',
    });
  }
};


export const testQRReading = async (imagePath: string) => {
  const qrData = await readQRFromImage(imagePath);
  if (qrData) {
    console.log('QR Data:', qrData);
    const slipData = parseQRSlipData(qrData);
    console.log('Parsed Slip Data:', slipData);
  } else {
    console.log('No QR code found');
  }
};