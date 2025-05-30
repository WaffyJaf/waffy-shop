import  { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar.tsx';
import { useAuth } from '../component/AuthContext.tsx';
import { getCartItems, updateCartItemQuantity, removeCartItem, createOrder } from '../api/orderapi.ts';

interface CartItem {
  id: string;
  product_id: number;
  quantity: number;
  product: {
    id_products: number;
    name: string;
    price: number;
    image_url?: string;
    stock: number;
  };
}

const Cart: React.FC = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [selectedItems, setSelectedItems] = useState<string[]>([]); 
  const [selectAll, setSelectAll] = useState(false); 

  useEffect(() => {
    if (!user || !user.user_id) {
      Swal.fire({
        icon: 'warning',
        title: 'กรุณาเข้าสู่ระบบ',
        text: 'คุณต้องเข้าสู่ระบบเพื่อดูตะกร้าสินค้า',
        confirmButtonText: 'เข้าสู่ระบบ',
        confirmButtonColor: '#9333ea',
      }).then(() => {
        navigate('/login');
      });
      return;
    }

    const fetchCart = async () => {
      setIsLoading(true);
      try {
        const data = await getCartItems(user.user_id);
        setCartItems(data);
        setSelectedItems(data.map((item: CartItem) => item.id));
        setSelectAll(true);
      } catch (error) {
        console.error('Error fetching cart:', error);
        Swal.fire({
          icon: 'error',
          title: 'เกิดข้อผิดพลาด',
          text: error instanceof Error ? error.message : 'ไม่สามารถดึงข้อมูลตะกร้าสินค้าได้',
          confirmButtonText: 'ตกลง',
          confirmButtonColor: '#9333ea',
        });
      } finally {
        setIsLoading(false);
      }
    };

    fetchCart();
  }, [user, navigate]);

  // Handle individual item selection
  const handleSelectItem = (itemId: string) => {
    setSelectedItems((prev) =>
      prev.includes(itemId)
        ? prev.filter((id) => id !== itemId)
        : [...prev, itemId]
    );
    // Update selectAll state if not all items are selected
    setSelectAll(cartItems.length === selectedItems.length + 1 && !selectedItems.includes(itemId));
  };

  // Handle "select all" checkbox
  const handleSelectAll = () => {
    if (selectAll) {
      setSelectedItems([]);
    } else {
      setSelectedItems(cartItems.map((item) => item.id));
    }
    setSelectAll(!selectAll);
  };

  const updateQuantity = async (itemId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    try {
      const updatedItem = await updateCartItemQuantity(itemId, newQuantity);
      setCartItems((prev) =>
        prev.map((item) =>
          item.id === itemId ? { ...item, quantity: updatedItem.cartItem.quantity } : item
        )
      );
      Swal.fire({
        icon: 'success',
        title: 'อัปเดตจำนวน',
        text: 'จำนวนสินค้าในตะกร้าถูกอัปเดตแล้ว',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error updating quantity:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถอัปเดตจำนวนสินค้าได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  const removeItem = async (itemId: string) => {
    try {
      await removeCartItem(itemId);
      setCartItems((prev) => prev.filter((item) => item.id !== itemId));
      setSelectedItems((prev) => prev.filter((id) => id !== itemId));
      Swal.fire({
        icon: 'success',
        title: 'ลบสินค้า',
        text: 'สินค้าถูกลบออกจากตะกร้าแล้ว',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error removing item:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถลบสินค้าออกจากตะกร้าได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  // Bulk remove selected items
  const removeSelectedItems = async () => {
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีสินค้าถูกเลือก',
        text: 'กรุณาเลือกสินค้าที่ต้องการลบ',
        confirmButtonColor: '#9333ea',
      });
      return;
    }

    try {
      await Promise.all(selectedItems.map((itemId) => removeCartItem(itemId)));
      setCartItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setSelectAll(false);
      Swal.fire({
        icon: 'success',
        title: 'ลบสินค้าสำเร็จ',
        text: 'สินค้าที่เลือกถูกลบออกจากตะกร้าแล้ว',
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (error) {
      console.error('Error removing selected items:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถลบสินค้าที่เลือกได้',
        confirmButtonColor: '#9333ea',
      });
    }
  };

  // Calculate total for selected items only
  const calculateTotal = () => {
    return cartItems
      .filter((item) => selectedItems.includes(item.id))
      .reduce((total, item) => total + item.quantity * item.product.price, 0)
      .toFixed(2);
  };

  const handleCreateOrder = async () => {
    if (selectedItems.length === 0) {
      Swal.fire({
        icon: 'warning',
        title: 'ไม่มีสินค้าถูกเลือก',
        text: 'กรุณาเลือกสินค้าที่ต้องการสั่งซื้อ',
        confirmButtonColor: '#9333ea',
      });
      return;
    }

    setIsLoading(true);
    try {
      const selectedCartItems = cartItems.filter((item) =>
        selectedItems.includes(item.id)
      );
      await createOrder(user!.user_id, selectedCartItems);
      setCartItems((prev) => prev.filter((item) => !selectedItems.includes(item.id)));
      setSelectedItems([]);
      setSelectAll(false);
      Swal.fire({
        icon: 'success',
        title: 'สร้างคำสั่งซื้อสำเร็จ',
        text: 'คำสั่งซื้อของคุณถูกสร้างเรียบร้อยTHEN',
        confirmButtonColor: '#9333ea',
      }).then(() => {
        navigate('/order');
      });
    } catch (error) {
      console.error('Error creating order:', error);
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: error instanceof Error ? error.message : 'ไม่สามารถสร้างคำสั่งซื้อได้',
        confirmButtonColor: '#9333ea',
      });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-r from-gray-950 to-sky-900 text-white">
      <Navbar />
      <div className="max-w-5xl mx-auto p-6">
        <div className="flex items-center ">
          <i className="fa-solid fa-cart-shopping fa-xl text-amber-300"></i>
          <span className="text-3xl font-bold ml-5">ตะกร้าสินค้า</span>
        </div>
        {isLoading ? (
          <div className="text-center text-lg mt-10">กำลังโหลดตะกร้าสินค้า...</div>
        ) : cartItems.length > 0 ? (
          <div className="mt-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center flex-row-reverse">
                <span className="text-lg font-semibold ml-2">เลือกทั้งหมด</span>
                <input
                  type="checkbox"
                  checked={selectAll}
                  onChange={handleSelectAll}
                  className="h-5 w-5"
                />
              </div>
              <button
                onClick={removeSelectedItems}
                className="bg-red-600 text-white px-4 py-2 rounded hover:bg-red-700 transition"
                disabled={selectedItems.length === 0}
              >
                ลบที่เลือก
              </button>
            </div>
            
            {cartItems.map((item) => (
              <div
                key={item.id}
                className="flex items-center bg-white text-gray-900 rounded-lg shadow-lg mb-4 p-3"
              >
                <input
                  type="checkbox"
                  checked={selectedItems.includes(item.id)}
                  onChange={() => handleSelectItem(item.id)}
                  className=" h-5 w-5"
                />
                <img
                  src={
                    item.product.image_url
                      ? `http://localhost:3000${item.product.image_url}`
                      : '/logo_waffy.png'
                  }
                  alt={item.product.name}
                  className="w-24 h-24 object-cover rounded-lg ml-4"
                  onError={(e) => (e.currentTarget.src = '/logo_waffy.png')}
                  loading="lazy"
                />
                <div className="flex-1 ml-5">
                  <h3 className="text-lg font-semibold">{item.product.name}</h3>
                  <p className="text-gray-600">
                    ราคา: ฿{!isNaN(Number(item.product.price)) ? Number(item.product.price).toFixed(2) : '0.00'}
                  </p>
                  <p className="text-gray-600">สต็อก: {item.product.stock}</p>
                  <div className="flex items-center mt-2">
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity - 1)}
                      disabled={item.quantity <= 1}
                      className="bg-gray-200 text-gray-900 px-3 py-1 rounded-l-lg disabled:opacity-50"
                    >
                      -
                    </button>
                    <span className="px-4 py-1 bg-gray-100">{item.quantity}</span>
                    <button
                      onClick={() => updateQuantity(item.id, item.quantity + 1)}
                      disabled={item.quantity >= item.product.stock}
                      className="bg-gray-200 text-gray-900 px-3 py-1 rounded-r-lg disabled:opacity-50"
                    >
                      +
                    </button>
                    <button
                      onClick={() => removeItem(item.id)}
                      className="text-red-600 hover:text-red-800"
                      aria-label={`Remove ${item.product.name} from cart`}
                    >
                      <i className="fa-solid fa-trash ml-5 fa-xl"></i>
                    </button>
                  </div>
                </div>
                <p className="text-lg font-bold">
                  ฿{!isNaN(Number(item.product.price)) && !isNaN(item.quantity)
                    ? (item.quantity * Number(item.product.price)).toFixed(2)
                    : '0.00'}
                </p>
              </div>
            ))}
            <div className="flex justify-between items-center mt-8">
              <span className="text-2xl font-bold">ยอดรวม: ฿{calculateTotal()}</span>
              <button
                onClick={handleCreateOrder}
                disabled={isLoading || selectedItems.length === 0}
                className="bg-blue-600 text-white px-8 py-3 rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {isLoading ? 'กำลังดำเนินการ...' : 'สร้างคำสั่งซื้อ'}
              </button>
            </div>
          </div>
        ) : (
          <p className="text-center text-lg mt-10">ตะกร้าสินค้าว่างเปล่า</p>
        )}
        <div className="flex justify-center mt-8">
          <Link
            to="/"
            className="hover:text-purple-400 text-gray-900 px-8 py-3 bg-white text-lg font-semibold rounded-lg hover:bg-gray-900 transition"
          >
            กลับสู่หน้าหลัก
          </Link>
        </div>
      </div>
    </div>
  );
};

export default Cart;