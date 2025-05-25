import React, { useState } from 'react';
import { useDropzone } from 'react-dropzone';
import Swal from 'sweetalert2';
import { createTopup, uploadSlip, processSlip, TopupResponse, SlipUploadResponse, SlipProcessResponse } from '../api/topupapi';
import Navbar from '../component/Navbar';
import { CreditCard, Star, Sparkles, QrCode, CheckCircle2, Upload, AlertCircle } from 'lucide-react';

const TopupForm: React.FC = () => {
  const [amount, setAmount] = useState<number>(0);
  const [bank, setBank] = useState<string>('SCB');
  const [slipImage, setSlipImage] = useState<File | undefined>(undefined);
  const [qrCode, setQrCode] = useState<string | null>(null);
  const [topupId, setTopupId] = useState<number | null>(null);
  const [slipUploaded, setSlipUploaded] = useState<boolean>(false);
  const [message, setMessage] = useState<string>('');
  const [error, setError] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const banks = [
    { value: 'SCB', label: 'SCB', logo: '/topup/scb.png' },
    { value: 'KTB', label: 'KTB', logo: '/topup/ktb.png' },
    { value: 'BBL', label: 'BBL', logo: '/topup/bbl.png' },
    { value: 'KBANK', label: 'KBANK', logo: '/topup/kbank.webp' },
    { value: 'GSB', label: 'GSB', logo: '/topup/gsb.jpg' },
    { value: 'TTB', label: 'TTB', logo: '/topup/ttb.jpg' },
  ];

  const { getRootProps, getInputProps } = useDropzone({
    accept: { 'image/png': ['.png'], 'image/jpeg': ['.jpg', '.jpeg'] },
    maxSize: 5 * 1024 * 1024, // 5MB
    onDrop: (acceptedFiles) => {
      setSlipImage(acceptedFiles[0]);
      setError('');
      setSlipUploaded(false);
    },
  });

  const handleGenerateQR = async () => {
    if (!amount || amount <= 0) {
      setError('Please enter a valid amount');
      Swal.fire({
        icon: 'error',
        title: 'Invalid Amount',
        text: 'Please enter a valid amount greater than 0.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const userId = 1; // แทนที่ด้วย user ID จาก authentication
      const response: TopupResponse = await createTopup(userId, amount, `PromptPay-${bank}`);
      setQrCode(`http://localhost:3000${response.qrCode}`);
      setTopupId(response.topup.id);
      setMessage(response.message);
      Swal.fire({
        icon: 'success',
        title: 'QR Code Generated',
        text: 'Your PromptPay QR code has been generated successfully!',
        confirmButtonColor: '#2563eb',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to generate QR code');
      console.error(err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to generate QR code. Please try again.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleUploadSlip = async () => {
    if (!topupId) {
      setError('Please generate a QR code first');
      Swal.fire({
        icon: 'error',
        title: 'Missing Top-up ID',
        text: 'Please generate a QR code before uploading a slip.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    if (!slipImage) {
      setError('Please upload a slip image');
      Swal.fire({
        icon: 'error',
        title: 'Missing Slip Image',
        text: 'Please upload a slip image to proceed.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response: SlipUploadResponse = await uploadSlip(topupId, slipImage);
      setSlipUploaded(true);
      setMessage(response.message);
      Swal.fire({
        icon: 'success',
        title: 'Slip Uploaded',
        text: 'Your slip has been uploaded successfully!',
        confirmButtonColor: '#2563eb',
      });
    } catch (err: any) {
      setError(err.message || 'Failed to upload slip');
      console.error('AxiosError:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to upload slip. Please try again.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleVerifySlip = async () => {
    if (!topupId) {
      setError('Please generate a QR code first');
      Swal.fire({
        icon: 'error',
        title: 'Missing Top-up ID',
        text: 'Please generate a QR code before verifying a slip.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    if (!slipUploaded) {
      setError('Please upload a slip image first');
      Swal.fire({
        icon: 'error',
        title: 'Missing Slip Image',
        text: 'Please upload a slip image before verifying.',
        confirmButtonColor: '#2563eb',
      });
      return;
    }

    setIsLoading(true);
    setError('');
    setMessage('');
    try {
      const response: SlipProcessResponse = await processSlip(topupId);
      setMessage(response.message);
      Swal.fire({
        icon: 'success',
        title: 'Slip Verified',
        text: response.message,
        confirmButtonColor: '#2563eb',
      });
      // รีเซ็ตฟอร์มหลังตรวจสอบสำเร็จ
      setAmount(0);
      setSlipImage(undefined);
      setQrCode(null);
      setTopupId(null);
      setSlipUploaded(false);
    } catch (err: any) {
      setError(err.message || 'Failed to verify slip');
      console.error('AxiosError:', err);
      Swal.fire({
        icon: 'error',
        title: 'Error',
        text: err.message || 'Failed to verify slip. Please try again.',
        confirmButtonColor: '#2563eb',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 to-sky-900">
      <Navbar />
      <div className="max-w-3xl mx-auto">
        {/* Header */}
        <div className="text-center mb-3 mt-4">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-yellow-400 rounded-full mb-4 shadow-lg">
            <CreditCard className="w-8 h-8 text-white" />
          </div>
          <span className="text-3xl font-bold bg-gradient-to-r text-white bg-clip-text ml-5">
            เติมเงิน
          </span>
        </div>

        {/* Main Form */}
        <div className="bg-white rounded-2xl shadow-xl p-8 backdrop-blur-sm border border-gray-100">
          <div className="space-y-6">
            {/* Amount Input */}
            <div className="space-y-2">
              <div className="flex">
                <Star className="w-4 h-4 mr-2 text-yellow-500" />
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  จำนวนเงิน (บาท)
                </label>
              </div>
              <div className="relative">
                <input
                  type="number"
                  value={amount}
                  onChange={(e) => setAmount(parseFloat(e.target.value) || 0)}
                  className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all duration-200 text-lg font-medium"
                  placeholder="0.00"
                  min="1"
                  step="0.01"
                  required
                />
                <div className="absolute right-3 top-3 text-gray-400 text-sm font-medium">THB</div>
              </div>
            </div>

            {/* Quick Amount Buttons */}
            <div className="grid grid-cols-4 gap-2">
              {[100, 500, 1000, 2000].map((quickAmount) => (
                <button
                  key={quickAmount}
                  type="button"
                  onClick={() => setAmount(quickAmount)}
                  className="py-2 px-3 text-sm font-medium text-blue-600 border border-blue-200 rounded-lg hover:bg-blue-200 transition-colors"
                >
                  {quickAmount}
                </button>
              ))}
            </div>

            {/* Bank Selection */}
            <div className="space-y-3">
              <div className="flex">
                <Sparkles className="w-4 h-4 mr-2 text-purple-500" />
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  เลือกธนาคาร
                </label>
              </div>
              <div className="grid grid-cols-3 gap-3">
                {banks.map((b) => (
                  <div
                    key={b.value}
                    onClick={() => setBank(b.value)}
                    className={`relative flex flex-col items-center p-4 rounded-xl cursor-pointer transition-all duration-200 hover:scale-105 ${
                      bank === b.value
                        ? 'ring-2 ring-blue-500 bg-blue-200 shadow-lg'
                        : 'border border-gray-200 hover:border-gray-300 hover:shadow-md'
                    }`}
                  >
                    <img
                      src={b.logo}
                      alt={`${b.label} logo`}
                      className="w-12 h-12 mb-2 object-contain"
                      onError={(e) => (e.currentTarget.src = '/topup/placeholder.png')}
                    />
                    <span className="text-xs font-medium text-gray-700">{b.label}</span>
                    {bank === b.value && (
                      <CheckCircle2 className="absolute top-2 right-2 w-5 h-5 text-blue-500" />
                    )}
                  </div>
                ))}
              </div>
            </div>

            {/* Generate QR Button */}
            <button
              type="button"
              onClick={handleGenerateQR}
              disabled={isLoading}
              className="w-full py-3 bg-gradient-to-r from-green-500 to-green-600 text-white font-semibold rounded-xl hover:from-green-600 hover:to-green-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && !slipImage && !slipUploaded ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <QrCode className="w-5 h-5 mr-2" />
              )}
              {isLoading && !slipImage && !slipUploaded ? 'กำลังสร้าง QR Code...' : 'สร้าง QR Code'}
            </button>

            {/* QR Code Display */}
            {qrCode && (
              <div className="mt-6 p-6 bg-gradient-to-t from-white to-blue-50 rounded-xl border border-blue-100">
                <div className="text-center">
                  <div className="bg-gradient-to-r bg-blue-900 text-white py-3 px-6 rounded-t-xl">
                    <span className="text-lg font-bold flex items-center justify-center">
                      <QrCode className="w-5 h-5 mr-2" />
                      พร้อมเพย์
                    </span>
                    <p className="text-blue-100 text-sm mt-1">สแกนเพื่อชำระเงิน</p>
                  </div>
                  <div className="bg-white p-6 rounded-b-xl shadow-inner">
                    <img
                      src={qrCode}
                      alt="PromptPay QR Code"
                      className="w-60 h-60 mx-auto object-contain"
                      onError={(e) => console.error('Failed to load QR code:', e)}
                    />
                    <p className="mt-4 text-black font-semibold text-lg">{amount} บาท</p>
                    {topupId && (
                      <p className="mt-2 text-gray-600 text-sm">Top-up ID: {topupId}</p>
                    )}
                  </div>
                </div>
              </div>
            )}

            {/* File Upload */}
            <div className="space-y-2 mt-4">
              <div className="flex">
                <Upload className="w-4 h-4 mr-2 text-green-500" />
                <label className="flex items-center text-sm font-semibold text-gray-700">
                  อัปโหลดสลิป
                </label>
              </div>
              <div
                {...getRootProps()}
                className="flex items-center justify-center w-full py-4 border-2 border-dashed border-gray-300 rounded-xl cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-all duration-200"
              >
                <input {...getInputProps()} />
                <div className="text-center">
                  <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2" />
                  <p className="text-gray-600 text-sm">
                    {slipImage ? slipImage.name : 'คลิกเพื่ออัปโหลดสลิป (PNG/JPG, สูงสุด 5MB)'}
                  </p>
                </div>
              </div>
            </div>

            {/* Upload Slip Button */}
            <button
              type="button"
              onClick={handleUploadSlip}
              disabled={isLoading || !slipImage}
              className="w-full py-3 bg-gradient-to-r from-blue-500 to-blue-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-blue-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && slipImage && !slipUploaded ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <Upload className="w-5 h-5 mr-2" />
              )}
              {isLoading && slipImage && !slipUploaded ? 'กำลังอัปโหลดสลิป...' : 'อัปโหลดสลิป'}
            </button>

            {/* Verify Slip Button */}
            <button
              type="button"
              onClick={handleVerifySlip}
              disabled={isLoading || !slipUploaded}
              className="w-full py-3 bg-gradient-to-r from-teal-700 to-sky-600 text-white font-semibold rounded-xl hover:from-blue-600 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center"
            >
              {isLoading && slipUploaded ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
              ) : (
                <CheckCircle2 className="w-5 h-5 mr-2" />
              )}
              {isLoading && slipUploaded ? 'กำลังตรวจสอบสลิป...' : 'ยืนยันสลิป'}
            </button>

            {/* Messages */}
            {message && (
              <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-lg flex items-center">
                <CheckCircle2 className="w-5 h-5 text-green-500 mr-2" />
                <p className="text-green-700 font-medium">{message}</p>
              </div>
            )}
            {error && (
              <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded-lg flex items-center">
                <AlertCircle className="w-5 h-5 text-red-500 mr-2" />
                <p className="text-red-700 font-medium">{error}</p>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default TopupForm;