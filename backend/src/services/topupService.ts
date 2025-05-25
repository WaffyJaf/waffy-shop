import { PrismaClient, topups_status } from '@prisma/client';
import QRCode from 'qrcode';
import generatePayload from 'promptpay-qr';
import path from 'path';
import dotenv from 'dotenv';
import Jimp from 'jimp';
import jsQR from 'jsqr';

dotenv.config();

const prisma = new PrismaClient();
const SELLER_PROMPTPAY_ID = process.env.SELLER_PROMPTPAY_ID || '0973139076';

interface TopupData {
  user_id: number;
  amount: number;
  payment_method: string;
  slip_image?: string;
}

export interface SlipData {
  amount: number;
  dateTime: string;
  accountName: string;
  transactionId?: string;
  reference?: string;
}

export const createTopup = async (data: TopupData) => {
  const transaction_ref = `TXN-${Date.now()}-${Math.random().toString(36).substring(2, 9)}`;

  const topup = await prisma.topups.create({
    data: {
      user_id: data.user_id,
      amount: data.amount,
      status: topups_status.PENDING,
      payment_method: data.payment_method,
      transaction_ref,
      slip_image: data.slip_image,
    },
  });

  return topup;
};

export const generateQRCode = async (amount: number): Promise<string> => {
  const qrPayload = generatePayload(SELLER_PROMPTPAY_ID, { amount });
  const qrCodeFileName = `qrcode-${Date.now()}.png`;
  const qrCodePath = path.join(__dirname, '../../qrcode', qrCodeFileName);
  await QRCode.toFile(qrCodePath, qrPayload);
  return `/qrcode/${qrCodeFileName}`;
};

export const readQRFromImage = async (imagePath: string): Promise<string | null> => {
  try {
    console.log(`[QR] Reading QR code from: ${imagePath}`);
    
    const image = await Jimp.read(imagePath);
    
    // Preprocessing steps
    image.greyscale(); // Convert to grayscale
    image.normalize(); // Normalize image to improve contrast
    image.contrast(0.5); // Increase contrast
    
    // Optional: Apply adaptive thresholding to handle low-contrast images
    image.contrast(0.7); // Try higher contrast for edge cases
    
    const sizes = [
      { width: image.bitmap.width, height: image.bitmap.height }, // Original size
      { width: 800, height: 600 },
      { width: 1200, height: 900 },
      { width: 600, height: 600 }, // Add square size for QR codes
    ];
    
    for (const size of sizes) {
      try {
        const resizedImage = image.clone().resize(size.width, size.height, Jimp.RESIZE_BICUBIC);
        const imageData = {
          data: new Uint8ClampedArray(resizedImage.bitmap.data),
          width: resizedImage.bitmap.width,
          height: resizedImage.bitmap.height,
        };
        
        const qrCode = jsQR(imageData.data, imageData.width, imageData.height, {
          inversionAttempts: 'attemptBoth', // Try both inverted and non-inverted
        });
        
        if (qrCode && qrCode.data) {
          console.log(`[QR] Successfully read QR code at size ${size.width}x${size.height}`);
          console.log(`[QR] QR Data: ${qrCode.data.substring(0, 100)}...`);
          
          // Validate QR data (e.g., check if it matches EMVCo format)
          if (/^\d{4}/.test(qrCode.data)) {
            return qrCode.data;
          } else {
            console.warn('[QR] Invalid QR data format, expected EMVCo');
          }
        }
      } catch (resizeError) {
        console.warn(`[QR] Failed to process at size ${size.width}x${size.height}:`, resizeError);
      }
    }
    
    console.warn('[QR] No valid QR code found in image');
    return null;
  } catch (error) {
    console.error('[QR] Error reading QR code:', error);
    return null;
  }
};


// ฟังก์ชันแปลง EMVCo QR Code format
const parseEMVCoQR = (qrData: string): { [key: string]: string } => {
  const result: { [key: string]: string } = {};
  let i = 0;
  
  // Validate QR data
  if (!qrData || !/^\d{4}/.test(qrData)) {
    console.warn('[QR Parse] Invalid EMVCo QR data:', qrData);
    return result;
  }
  
  try {
    while (i < qrData.length) {
      if (i + 4 > qrData.length) {
        console.warn('[QR Parse] Incomplete EMVCo data at index', i);
        break;
      }
      
      // Read tag (2 digits)
      const tag = qrData.substring(i, i + 2);
      i += 2;
      
      // Read length (2 digits)
      const lengthStr = qrData.substring(i, i + 2);
      const length = parseInt(lengthStr, 10);
      i += 2;
      
      if (isNaN(length) || length < 0 || i + length > qrData.length) {
        console.warn(`[QR Parse] Invalid length for tag ${tag} at index ${i}:`, lengthStr);
        break;
      }
      
      // Read value
      const value = qrData.substring(i, i + length);
      i += length;
      
      result[tag] = value;
      
      // Parse sub-tags for merchant data (tags 26-51)
      if (parseInt(tag) >= 26 && parseInt(tag) <= 51 && value.length >= 4) {
        const subData = parseEMVCoQR(value);
        Object.keys(subData).forEach(subTag => {
          result[`${tag}.${subTag}`] = subData[subTag];
        });
      }
    }
  } catch (error) {
    console.error('[QR Parse] Error parsing EMVCo QR:', error);
  }
  
  console.log('[QR Parse] Parsed EMVCo data:', result);
  return result;
};

export const parseQRSlipData = (qrData: string): SlipData => {
  console.log('[QR Parse] Parsing QR data:', qrData.substring(0, 100));
  
  let amount = 0;
  let dateTime = '';
  let accountName = '';
  let transactionId = '';
  let reference = '';
  
  try {
    // Handle EMVCo QR format
    if (/^\d{4}/.test(qrData)) {
      console.log('[QR Parse] Detected EMVCo QR format');
      const emvData = parseEMVCoQR(qrData);
      
      // Extract amount from tag 54
      if (emvData['54']) {
        const rawAmount = emvData['54'];
        // Handle amount with implied decimal (e.g., "10000" means 100.00)
        if (/^\d+$/.test(rawAmount)) {
          amount = parseInt(rawAmount, 10) / 100;
        } else {
          amount = parseFloat(rawAmount);
        }
        console.log(`[QR Parse] Found amount from EMVCo tag 54: ${amount} (raw: ${rawAmount})`);
      }
      
      // Extract additional data (tag 62)
      Object.keys(emvData).forEach(key => {
        if (key.startsWith('62.')) {
          const subTag = key.split('.')[1];
          const value = emvData[key];
          
          if (['01', '05', '07'].includes(subTag)) {
            if (!reference) reference = value;
            console.log(`[QR Parse] Found reference (${subTag}): ${value}`);
          }
          if (['08', '09'].includes(subTag)) {
            if (!transactionId) transactionId = value;
            console.log(`[QR Parse] Found transactionId (${subTag}): ${value}`);
          }
        }
      });
      
      // Extract account name from merchant info (tags 26-51)
      Object.keys(emvData).forEach(key => {
        if (key.includes('.') && !accountName) {
          const value = emvData[key];
          if (value && value.length > 2 && !/^\d+$/.test(value)) {
            accountName = value;
            console.log(`[QR Parse] Found accountName: ${accountName}`);
          }
        }
      });
      
      // Handle dateTime (convert Buddhist calendar if needed)
      if (emvData['58'] || emvData['62.07']) {
        dateTime = emvData['62.07'] || emvData['58'] || '';
        if (dateTime.match(/\d{1,2}\/\d{1,2}\/25\d{2}/)) {
          // Convert Buddhist year (e.g., 2568) to Gregorian (2025)
          dateTime = dateTime.replace(/25(\d{2})/, (match, year) => `20${year}`);
          console.log(`[QR Parse] Converted Buddhist dateTime: ${dateTime}`);
        }
      }
      
      if (!dateTime) {
        dateTime = new Date().toLocaleString('th-TH', { timeZone: 'Asia/Bangkok' });
        console.log(`[QR Parse] Using current dateTime: ${dateTime}`);
      }
    }
    
    // Handle JSON format (fallback)
    if (amount === 0) {
      try {
        const jsonData = JSON.parse(qrData);
        if (jsonData.amount) amount = parseFloat(jsonData.amount);
        if (jsonData.date) dateTime = jsonData.date;
        if (jsonData.time) dateTime += ` ${jsonData.time}`;
        if (jsonData.account) accountName = jsonData.account;
        if (jsonData.transactionId) transactionId = jsonData.transactionId;
        if (jsonData.ref) reference = jsonData.ref;
        console.log('[QR Parse] Parsed from JSON format');
      } catch {
        console.log('[QR Parse] Not a JSON format');
      }
    }
    
    // Handle text-based format
    if (amount === 0) {
      const lines = qrData.split('\n').map(line => line.trim()).filter(line => line.length > 0);
      
      for (const line of lines) {
        // Amount patterns
        const amountPatterns = [
          /amount[:\s]*(\d+(?:\.\d{2})?)/i,
          /จำนวน[:\s]*(\d+(?:\.\d{2})?)/i,
          /amt[:\s]*(\d+(?:\.\d{2})?)/i,
          /(\d+\.\d{2})/,
        ];
        
        for (const pattern of amountPatterns) {
          const match = line.match(pattern);
          if (match && !amount) {
            amount = parseFloat(match[1]);
            console.log(`[QR Parse] Found amount: ${amount} from line: "${line}"`);
            break;
          }
        }
        
        // Date patterns (including Buddhist calendar)
        const datePatterns = [
          /date[:\s]*([^\s]+\s+[^\s]+)/i,
          /วันที่[:\s]*([^\s]+)/i,
          /(\d{1,2}\/\d{1,2}\/25\d{2})/,
          /(\d{4}-\d{2}-\d{2})/,
        ];
        
        for (const pattern of datePatterns) {
          const match = line.match(pattern);
          if (match && !dateTime) {
            dateTime = match[1] || match[0];
            if (dateTime.match(/25\d{2}/)) {
              dateTime = dateTime.replace(/25(\d{2})/, `20$1`);
            }
            console.log(`[QR Parse] Found dateTime: ${dateTime} from line: "${line}"`);
            break;
          }
        }
        
        // Time (if not already included)
        if (!dateTime.includes(':')) {
          const timeMatch = line.match(/(\d{1,2}:\d{2}(?::\d{2})?)/);
          if (timeMatch) {
            dateTime += ` ${timeMatch[1]}`;
          }
        }
        
        // Account name
        const accountPatterns = [
          /account[:\s]*(.+)/i,
          /receiver[:\s]*(.+)/i,
          /ผู้รับ[:\s]*(.+)/i,
          /to[:\s]*(.+)/i,
        ];
        
        for (const pattern of accountPatterns) {
          const match = line.match(pattern);
          if (match && !accountName) {
            accountName = match[1].trim();
            console.log(`[QR Parse] Found accountName: ${accountName} from line: "${line}"`);
            break;
          }
        }
        
        // Transaction ID
        const transactionPatterns = [
          /ref[:\s]*([^\s]+)/i,
          /transaction[:\s]*([^\s]+)/i,
          /txn[:\s]*([^\s]+)/i,
          /id[:\s]*([^\s]+)/i,
        ];
        
        for (const pattern of transactionPatterns) {
          const match = line.match(pattern);
          if (match && !transactionId) {
            transactionId = match[1];
            console.log(`[QR Parse] Found transactionId: ${transactionId} from line: "${line}"`);
            break;
          }
        }
      }
    }
    
    // Handle URL format (e.g., PromptPay)
    if (qrData.startsWith('http') || qrData.includes('promptpay')) {
      try {
        const url = new URL(qrData);
        const params = url.searchParams;
        
        if (params.get('amount')) amount = parseFloat(params.get('amount')!);
        if (params.get('date')) dateTime = params.get('date')!;
        if (params.get('time')) dateTime += ` ${params.get('time')}`;
        if (params.get('account')) accountName = params.get('account')!;
        if (params.get('ref')) reference = params.get('ref')!;
        console.log('[QR Parse] Parsed from URL format');
      } catch (urlError) {
        console.warn('[QR Parse] Failed to parse URL format:', urlError);
      }
    }
    
  } catch (error) {
    console.error('[QR Parse] Error parsing QR data:', error);
  }
  
  // Final validation
  if (amount === 0) {
    console.warn('[QR Parse] Failed to extract amount from QR data');
  }
  
  console.log('[QR Parse] Final parsed data:', { amount, dateTime, accountName, transactionId, reference });
  return { amount, dateTime, accountName, transactionId, reference };
};






