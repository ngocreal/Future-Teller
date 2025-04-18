import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import AdminTable from '../components/AdminTable';
import AddEditPopup from '../components/AddEditPopup';
import styles from '../styles/Admin.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';
import { FaUser, FaSignOutAlt, FaPlus, FaQrcode } from 'react-icons/fa';

export default function Admin() {
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('times');
  const [data, setData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editData, setEditData] = useState(null);
  const [isProfilePopupOpen, setIsProfilePopupOpen] = useState(false);
  const [isChangePasswordPopupOpen, setIsChangePasswordPopupOpen] = useState(false);
  const [userData, setUserData] = useState(null);
  const [currentPassword, setCurrentPassword] = useState('');
  const [newPassword, setNewPassword] = useState('');
  const [confirmNewPassword, setConfirmNewPassword] = useState('');

  // Kiểm tra trạng thái đăng nhập ngay khi trang tải
  useEffect(() => {
    const username = localStorage.getItem('user');
    if (!username) {
      toast.error('Vui lòng đăng nhập để truy cập trang admin');
      router.push('/login');
    } else {
      fetchUserData(username);
    }
  }, [router]);

  const fetchUserData = async (username) => {
    try {
      const res = await fetch(`/api/users?username=${username}`);
      const user = await res.json();
      if (res.ok && user) {
        setUserData(user);
      } else {
        throw new Error('Không tìm thấy thông tin người dùng');
      }
    } catch (error) {
      toast.error(error.message || 'Lỗi khi lấy thông tin người dùng');
      localStorage.removeItem('user');
      router.push('/login');
    }
  };

  const fetchData = async (tab) => {
    try {
      const res = await fetch(`/api/${tab}`);
      const result = await res.json();
      if (Array.isArray(result)) {
        setData(result);
      } else {
        console.error('API did not return an array:', result);
        setData([]);
      }
    } catch (error) {
      console.error('Error fetching data:', error);
      setData([]);
    }
  };

  useEffect(() => {
    fetchData(activeTab);
  }, [activeTab]);

  const handleAdd = () => {
    setEditData(null);
    setIsPopupOpen(true);
  };

  const handleEdit = (item) => {
    console.log('Editing item:', item);
    setEditData(item);
    setIsPopupOpen(true);
  };

  const handleDelete = async (id) => {
    try {
      const res = await fetch(`/api/${activeTab}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id }),
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || 'Xóa thành công');
        fetchData(activeTab);
      } else {
        toast.error(result.error || 'Xóa thất bại');
      }
    } catch (error) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleSave = async (formData) => {
    try {
      const res = await fetch(`/api/${activeTab}`, {
        method: editData ? 'PUT' : 'POST',
        body: formData,
      });
      const result = await res.json();
      if (res.ok) {
        toast.success(result.message || 'Lưu thành công');
        fetchData(activeTab);
      } else {
        toast.error(result.error || 'Lưu thất bại');
      }
    } catch (error) {
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleChangePassword = async () => {
    if (newPassword.length < 8) {
      toast.error('Mật khẩu mới phải có ít nhất 8 ký tự');
      return;
    }
    if (newPassword !== confirmNewPassword) {
      toast.error('Mật khẩu mới và xác nhận mật khẩu không khớp');
      return;
    }
    try {
      console.log('Đang kiểm tra mật khẩu hiện tại:', { username: userData.username, password: currentPassword });
      const loginRes = await fetch('/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username: userData.username, password: currentPassword }),
      });
      const loginData = await loginRes.json();
      console.log('Kết quả kiểm tra mật khẩu:', loginData);
      if (!loginData.success) {
        toast.error('Mật khẩu hiện tại không đúng');
        return;
      }
      console.log('Đang cập nhật mật khẩu mới:', { id: userData.id, password: newPassword });
      const updateRes = await fetch('/api/users', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id: userData.id, password: newPassword }),
      });
      const updateData = await updateRes.json();
      console.log('Kết quả cập nhật mật khẩu:', updateData);
      if (updateRes.ok) {
        toast.success('Đổi mật khẩu thành công');
        setIsChangePasswordPopupOpen(false);
        setCurrentPassword('');
        setNewPassword('');
        setConfirmNewPassword('');
        fetchUserData(userData.username);
      } else {
        toast.error(updateData.error || 'Đổi mật khẩu thất bại');
      }
    } catch (error) {
      console.error('Lỗi khi đổi mật khẩu:', error);
      toast.error('Lỗi: ' + error.message);
    }
  };

  const handleLogout = () => {
    localStorage.removeItem('user');
    toast.success('Đăng xuất thành công');
    router.push('/');
  };

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <h1>Xin chào, {userData?.username || 'Admin'}</h1>
        <div className={styles.headerButtons}>
          <button className={styles.profileButton} onClick={() => setIsProfilePopupOpen(true)}>
          <FaUser className={styles.buttonIcon} />Hồ sơ
          </button>
          <button className={styles.logoutButton} onClick={handleLogout}>
          <FaSignOutAlt className={styles.buttonIcon} /> Đăng xuất
          </button>
        </div>
      </header>
      <div className={styles.tabs}>
        <button
          className={activeTab === 'times' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('times')}
        >
          Thời điểm
        </button>
        <button
          className={activeTab === 'majors' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('majors')}
        >
          Ngành
        </button>
        <button
          className={activeTab === 'technologies' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('technologies')}
        >
          Công nghệ
        </button>
        <button
          className={activeTab === 'impacts' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('impacts')}
        >
          Tác động
        </button>
        <button
          className={activeTab === 'outlines' ? styles.activeTab : styles.tab}
          onClick={() => setActiveTab('outlines')}
        >
          Gợi ý
        </button>
      </div>
      <div className={styles.tableHeader}>
        <h2>Danh sách thẻ {activeTab === 'times' ? 'Thời điểm' : activeTab === 'majors' ? 'Ngành' : activeTab === 'technologies' ? 'Công nghệ' : activeTab === 'impacts' ? 'Tác động' : 'Gợi ý'}</h2>
        <button className={styles.addButton} onClick={handleAdd}><FaPlus className={styles.buttonIcon} />Thêm</button>
      </div>
      <AdminTable data={data} table={activeTab} onEdit={handleEdit} onDelete={handleDelete} />
      <div className={styles.footerText}>
            Bản quyền thuộc về FLASH VN & được cấp phép bởi nhóm cộng đồng.
          </div>
      <AddEditPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSave={handleSave}
        initialData={editData}
        table={activeTab}
      />
      {isProfilePopupOpen && userData && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupWrapper}>
            <div className={styles.popup}>
              <div className={styles.popupHeader}>
                <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Hồ sơ</h1>
              </div>
              <div className={styles.formContainer}>
                <label className={styles.formLabel}>Tên đăng nhập:</label>
                <input
                  type="text"
                  value={userData.username}
                  readOnly
                  className={styles.formInput}
                />
                <label className={styles.formLabel}>Email:</label>
                <input
                  type="email"
                  value={userData.email}
                  readOnly
                  className={styles.formInput}
                />
                <label className={styles.formLabel}>Mật khẩu:</label>
                <input
                  type="text"
                  value="********"
                  readOnly
                  className={styles.formInput}
                />
              </div>
              <div className={styles.popupButtons}>
                <button
                  className={styles.editButton}
                  onClick={() => {
                    setIsProfilePopupOpen(false);
                    setIsChangePasswordPopupOpen(true);
                  }}
                >
                  Đổi mật khẩu
                </button>
              </div>
            </div>
            <button className={styles.closeButton} onClick={() => setIsProfilePopupOpen(false)}>
              <b>X</b>
            </button>
          </div>
        </div>
      )}
      {isChangePasswordPopupOpen && userData && (
        <div className={styles.popupOverlay}>
          <div className={styles.popupWrapper}>
            <div className={styles.popup}>
              <div className={styles.popupHeader}>
                <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>Đổi mật khẩu</h1>
              </div>
              <div className={styles.formContainer}>
                <label className={styles.formLabel}>Mật khẩu hiện tại:</label>
                <input
                  type="password"
                  value={currentPassword}
                  onChange={(e) => setCurrentPassword(e.target.value)}
                  className={styles.formInput}
                  placeholder="Nhập mật khẩu hiện tại"
                />
                <label className={styles.formLabel}>Mật khẩu mới:</label>
                <input
                  type="password"
                  value={newPassword}
                  onChange={(e) => setNewPassword(e.target.value)}
                  className={styles.formInput}
                  placeholder="Nhập mật khẩu mới (ít nhất 8 ký tự)"
                />
                <label className={styles.formLabel}>Xác nhận mật khẩu mới:</label>
                <input
                  type="password"
                  value={confirmNewPassword}
                  onChange={(e) => setConfirmNewPassword(e.target.value)}
                  className={styles.formInput}
                  placeholder="Xác nhận mật khẩu mới"
                />
              </div>
              <div className={styles.popupButtons}>
                <button onClick={handleChangePassword} className={styles.saveButton}>
                  Xác nhận
                </button>
                <button onClick={() => setIsChangePasswordPopupOpen(false)} className={styles.cancelButton}>
                  Hủy
                </button>
              </div>
            </div>
            <button className={styles.closeButton} onClick={() => setIsChangePasswordPopupOpen(false)}>
              <b>X</b>
            </button>
          </div>
        </div>
      )}
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}