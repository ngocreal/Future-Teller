import { useState, useEffect } from 'react';
import AdminTable from '../components/AdminTable';
import AddEditPopup from '../components/AddEditPopup';
import styles from '../styles/Admin.module.css';
import { ToastContainer, toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

export default function Admin() {
  const [activeTab, setActiveTab] = useState('times');
  const [data, setData] = useState([]);
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [editData, setEditData] = useState(null);

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
    console.log('Editing item:', item); // Debug để kiểm tra dữ liệu
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

  return (
    <div className={styles.container}>
      <header className={styles.header}>
        <span>Xin chào, Admin</span>
        <button className={styles.logoutButton}>Đăng xuất</button>
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
        <button className={styles.addButton} onClick={handleAdd}>Thêm</button>
      </div>
      <AdminTable data={data} table={activeTab} onEdit={handleEdit} onDelete={handleDelete} />
      <AddEditPopup
        isOpen={isPopupOpen}
        onClose={() => setIsPopupOpen(false)}
        onSave={handleSave}
        initialData={editData}
        table={activeTab}
      />
      <ToastContainer position="top-right" autoClose={3000} />
    </div>
  );
}