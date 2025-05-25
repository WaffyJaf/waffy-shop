import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL;

export interface TopupResponse {
  message: string;
  topup: {
    id: number;
    user_id: number;
    amount: number;
    status: string;
    payment_method: string;
    transaction_ref: string;
    slip_image?: string;
  };
  qrCode: string;
}

export interface SlipUploadResponse {
  message: string;
  slipImage: string;
}

export interface SlipProcessResponse {
  message: string;
  slipData?: {
    amount: number;
    dateTime: string;
    accountName: string;
  };
  error?: string;
}

export const createTopup = async (
  userId: number,
  amount: number,
  paymentMethod: string
): Promise<TopupResponse> => {
  const formData = new FormData();
  formData.append('user_id', userId.toString());
  formData.append('amount', amount.toString());
  formData.append('payment_method', paymentMethod);

  const response = await axios.post(`${API_URL}/create`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' },
  });
  return response.data;
};

export const uploadSlip = async (topupId: number, slipImage: File): Promise<SlipUploadResponse> => {
  const formData = new FormData();
  formData.append('topupId', topupId.toString());
  formData.append('slip_image', slipImage);

  console.log('FormData topupId:', topupId);
  console.log('FormData slip_image:', slipImage.name);

  try {
    const response = await axios.post(`${API_URL}/upload-slip`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return response.data;
  } catch (error) {
    console.error('Error in uploadSlip:', error);
    throw error;
  }
};

export const processSlip = async (topupId: number): Promise<SlipProcessResponse> => {
  const response = await axios.post(`${API_URL}/process-slip`, { topupId }, {
    headers: { 'Content-Type': 'application/json' },
  });
  return response.data;
};