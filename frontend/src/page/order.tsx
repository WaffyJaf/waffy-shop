import React, { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar.tsx';
import { useAuth } from '../component/AuthContext.tsx';
import { getOrdersByUser, uploadPaymentSlip } from '../api/orderapi.ts';
import { Order } from '../type/product.ts';

const OrdersPage: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [orders, setOrders] = useState<Order[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [uploadingOrderId, setUploadingOrderId] = useState<number | null>(null);
  const [uploadAmount, setUploadAmount] = useState<number>(0);
  const [uploadSlip, setUploadSlip] = useState<File | null>(null);

  useEffect(() => {
    if (!user || !user.user_id) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบเพื่อดูคำสั่งซื้อ',
        confirmButtonText: 'เข้าสู่ระบบ',
        confirmButtonColor: '#9333ea',
      }).then(() => navigate('/login'));
      return;
    }

    fetchOrders();
  }, [user]);

  const fetchOrders = async () => {
    setIsLoading(true);
    try {
      const fetchedOrders = await getOrdersByUser(user!.user_id);
      setOrders(fetchedOrders);
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
        confirmButtonColor: '#9333ea',
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setUploadSlip(e.target.files[0]);
    }
  };

  const handleUploadSlip = async () => {
    if (!uploadSlip || !uploadingOrderId || !uploadAmount) {
      Swal.fire({
        icon: 'warning',
        title: 'ข้อมูลไม่ครบ',
        text: 'กรุณากรอกข้อมูลให้ครบถ้วน',
        confirmButtonColor: '#9333ea',
      });
      return;
    }

    try {
      await uploadPaymentSlip(uploadingOrderId, uploadAmount, uploadSlip);
      Swal.fire({
        icon: 'success',
        title: 'อัปโหลดสลิปสำเร็จ',
        timer: 1500,
        showConfirmButton: false,
      });
      setUploadingOrderId(null);
      setUploadAmount(0);
      setUploadSlip(null);
      fetchOrders();
    } catch (error: any) {
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error.message,
        confirmButtonColor: '#9333ea',
      });
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-950 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <h1 className="text-3xl font-bold mb-6">การชำระเงินและคำสั่งซื้อ</h1>

        {isLoading ? (
          <div className="text-center">กำลังโหลดคำสั่งซื้อ...</div>
        ) : orders.length === 0 ? (
          <p className="text-center">ไม่มีคำสั่งซื้อ</p>
        ) : (
          orders.map((order) => (
            <div key={order.id} className="bg-white text-gray-900 rounded-lg shadow-lg mb-4 p-6">
              <p><strong>รหัสคำสั่งซื้อ:</strong> {order.id}</p>
              <p><strong>ยอดรวม:</strong> ฿{Number(order.total || 0).toFixed(2)}</p>
              <p><strong>สถานะ:</strong> {order.status}</p>
              <p><strong>วันที่สร้าง:</strong> {new Date(order.created_at).toLocaleString('th-TH')}</p>
              <p className="mt-2"><strong>รายการสินค้า:</strong></p>
              <ul className="list-disc ml-6">
                {order.order_items.map((item) => (
                  <li key={item.id}>{item.products.name} - จำนวน: {item.quantity}, ราคา: ฿{Number(item.price).toFixed(2)}</li>
                ))}
              </ul>
              <div className="mt-4">
                <p className="font-semibold">การชำระเงิน:</p>
                {order.payments.length === 0 ? (
                  <div className="mt-2">
                    <p>ยังไม่ได้ชำระเงิน</p>
                    <input type="number" placeholder="จำนวนเงิน" className="border p-2 rounded bg-gray-100 w-full mt-2" value={uploadingOrderId === order.id ? uploadAmount : ''} onChange={(e) => {
                      setUploadingOrderId(order.id);
                      setUploadAmount(Number(e.target.value));
                    }} />
                    <input type="file" accept="image/*" className="border p-2 rounded bg-gray-100 w-full mt-2" onChange={(e) => {
                      setUploadingOrderId(order.id);
                      handleFileChange(e);
                    }} />
                    <button className="mt-2 bg-purple-600 text-white px-4 py-2 rounded hover:bg-purple-700" onClick={handleUploadSlip}>อัปโหลดสลิป</button>
                  </div>
                ) : (
                  order.payments.map((payment) => (
                    <div key={payment.id} className="mt-2">
                      <p>จำนวนเงิน: ฿{payment.amount.toFixed(2)} | สถานะ: {payment.status}</p>
                      {payment.slip_image && (
                        <img src={`http://localhost:3000${payment.slip_image}`} alt="slip" className="w-32 h-32 object-cover rounded mt-2" onError={(e) => (e.currentTarget.src = '/logo_waffy.png')} />
                      )}
                    </div>
                  ))
                )}
              </div>
            </div>
          ))
        )}

        <div className="flex justify-center mt-8">
          <Link to="/" className="bg-white text-gray-900 px-6 py-3 rounded-lg font-semibold hover:bg-gray-900 hover:text-white transition">
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default OrdersPage;
