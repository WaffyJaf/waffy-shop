import React, { useState, useEffect } from 'react';
import { UserRole, User } from '../type/user';
import { updateUserRole, getUsers , deleteUser } from '../api/admin';
import Swal from 'sweetalert2';
import Navbar from '../component/Navbar';
import { useNavigate } from 'react-router-dom';

const userRoleOptions = [
  { value: 'USER', label: 'ผู้ใช้' },
  { value: 'ADMIN', label: 'ผู้ดูแลระบบ' },
];

const AdminRoleManager: React.FC = () => {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      setLoading(true);
      setError(null);
      const userData = await getUsers();
      setUsers(userData);
    } catch (err) {
      setError('ไม่สามารถโหลดข้อมูลผู้ใช้ได้');
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถโหลดข้อมูลผู้ใช้ได้',
        confirmButtonColor: '#9333ea',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleEditRole = async (userId: number, currentRole: UserRole) => {
    const { value: selectedRole } = await Swal.fire({
      title: 'เปลี่ยนบทบาทผู้ใช้',
      input: 'select',
      inputOptions: userRoleOptions.reduce((options, role) => {
        options[role.value] = role.label;
        return options;
      }, {} as Record<string, string>),
      inputValue: currentRole,
      confirmButtonColor: '#9333ea',
      confirmButtonText: 'ยืนยัน',
      cancelButtonText: 'ยกเลิก',
      showCancelButton: true,
      inputPlaceholder: 'เลือกบทบาทใหม่',
    });

    if (selectedRole && selectedRole !== currentRole) {
      await handleRoleChange(userId, selectedRole as UserRole);
    }
  };

  const handleRoleChange = async (userId: number, newRole: UserRole) => {
    try {
      setLoading(true);
      await updateUserRole(userId, newRole);
      setUsers(prevUsers => 
        prevUsers.map(user => 
          user.user_id === userId ? { ...user, role: newRole } : user
        )
      );
      const roleLabel = userRoleOptions.find(role => role.value === newRole)?.label || newRole;
      Swal.fire({
        icon: 'success',
        title: 'สำเร็จ!',
        text: `อัพเดทบทบาทเป็น ${roleLabel} เรียบร้อยแล้ว`,
        timer: 1500,
        showConfirmButton: false,
      });
    } catch (err) {
      setError('ไม่สามารถอัพเดทบทบาทได้');
      Swal.fire({
        icon: 'error',
        title: 'เกิดข้อผิดพลาด',
        text: 'ไม่สามารถอัพเดทบทบาทได้',
        confirmButtonColor: '#9333ea',
      });
    } finally {
      setLoading(false);
    }
  };

  async function handleDeleteUser(user_id: number) {
    Swal.fire({
      title: 'ยืนยันการลบ',
      text: 'คุณต้องการลบกิจกรรมนี้หรือไม่?',
      icon: 'warning',
      showCancelButton: true,
      confirmButtonColor: '#9333ea',
      cancelButtonColor: '#ef4444',
      confirmButtonText: 'ใช่, ลบเลย!',
      cancelButtonText: 'ยกเลิก',
    }).then(async (result) => {
      if (result.isConfirmed) {
        try {
          await deleteUser(user_id);
          Swal.fire({
            icon: 'success',
            title: 'ลบสำเร็จ',
            text: 'ลบผู้ใช้เรียบร้อย',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#9333ea',
           }).then(() => {
        navigate('/manageuser'); 
      });
          getUsers();
        } catch (error) {
          console.error('เกิดข้อผิดพลาดในการลบผู้ใช้:', error);
          Swal.fire({
            icon: 'error',
            title: 'เกิดข้อผิดพลาด',
            text: 'ไม่สามารถลบผู้ใช้ได้',
            confirmButtonText: 'ตกลง',
            confirmButtonColor: '#9333ea',
          });
        }
      }
    });
  }

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-xl text-purple-600 animate-pulse">กำลังโหลด...</div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-b from-purple-50 to-white">
        <div className="text-xl text-red-600">ข้อผิดพลาด: {error}</div>
      </div>
    );
  }

  return (
    
     
      <div className="min-h-screen bg-gradient-to-br from-gray-900 to-sky-900">
        <Navbar />
        <div className="container mx-auto">
          <div className="flex justify-between items-center mb-8 mt-10">
            <span className="text-3xl font-bold text-white flex items-center ">
              <i className="fa-solid fa-user mr-3 text-amber-300"></i> จัดการบทบาทผู้ใช้
            </span>
          
          </div>

          <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full text-left">
                <thead className="bg-yellow-500 text-black">
                  <tr>
                    <th className="p-4 font-semibold">USER ID</th>
                    <th className="p-4 font-semibold">USERNAME</th>
                    <th className="p-4 font-semibold">EMAIL</th>
                    <th className="p-4 font-semibold">ROLE</th>
                    <th className="p-4 font-semibold">จัดการ</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200">
                  {users.map(user => (
                    <tr 
                      key={user.user_id}
                      className="hover:bg-purple-50 transition-colors duration-200"
                    >
                      <td className="p-4 ">{user.user_id}</td>
                      <td className="p-4 text-blue-700">{user.name}</td>
                      <td className="p-4">{user.email}</td>
                      <td className="p-4">
                        <span 
                          className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${
                            user.role === 'ADMIN' 
                              ? 'bg-green-100 text-green-700' 
                              : 'bg-blue-100 text-blue-700'
                          }`}
                        >
                          {userRoleOptions.find(role => role.value === user.role)?.label || user.role}
                        </span>
                      </td>
                      <td className="p-4 flex items-center gap-4 ">
                        <button
                          onClick={() => handleEditRole(user.user_id, user.role)}
                          className="text-gray-700 hover:text-gray-800 transition-colors "
                        >
                          <i className="fa-solid fa-pen-to-square"></i>
                        </button>
                        <button
                          onClick={() => handleDeleteUser(user.user_id)}
                          className="text-red-700 hover:text-red-950 transition-colors "
                          >
                          <i className="fa-solid fa-trash"></i>
                          </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>

        </div>
      </div>
    
  );
};

export default AdminRoleManager;
