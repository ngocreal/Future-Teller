import { useState, useEffect } from 'react';
import styles from '../styles/Admin.module.css';

const AddEditPopup = ({ isOpen, onClose, onSave, initialData, table }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);

  // Cập nhật formData và imagePreview khi initialData thay đổi
  useEffect(() => {
    if (initialData) {
      setFormData(initialData);
      setImagePreview(initialData.image || null);
    } else {
      setFormData({});
      setImagePreview(null);
    }
  }, [initialData]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleSubmit = () => {
    const data = new FormData();
    for (const key in formData) {
      if (key !== 'image' || (key === 'image' && formData[key] instanceof File)) {
        data.append(key, formData[key]);
      }
    }
    if (initialData?.id) {
      data.append('id', initialData.id); // Đảm bảo gửi id khi sửa
    }
    onSave(data);
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popup}>
        <h2>{initialData ? 'Sửa' : 'Thêm'} {table === 'times' ? 'Thời điểm' : table === 'majors' ? 'Ngành' : table === 'technologies' ? 'Công nghệ' : table === 'impacts' ? 'Tác động' : 'Gợi ý'}</h2>
        {table === 'times' || table === 'majors' || table === 'technologies' || table === 'impacts' || table === 'outlines' ? (
          <>
            {table === 'outlines' && (
              <>
                <input
                  type="text"
                  name="step"
                  placeholder="Bước"
                  value={formData.step || ''}
                  onChange={handleChange}
                />
                <input
                  type="text"
                  name="time"
                  placeholder="Thời gian"
                  value={formData.time || ''}
                  onChange={handleChange}
                />
                <textarea
                  name="content"
                  placeholder="Nội dung"
                  value={formData.content || ''}
                  onChange={handleChange}
                ></textarea>
                <textarea
                  name="suggest"
                  placeholder="Gợi ý"
                  value={formData.suggest || ''}
                  onChange={handleChange}
                ></textarea>
                <input
                  type="text"
                  name="emoji"
                  placeholder="Emoji"
                  value={formData.emoji || ''}
                  onChange={handleChange}
                />
              </>
            )}
            <input
              type="text"
              name="title"
              placeholder="Tiêu đề"
              value={formData.title || ''}
              onChange={handleChange}
            />
            <input
              type="file"
              name="image"
              accept="image/*"
              onChange={handleChange}
            />
            {imagePreview && (
              <img src={imagePreview} alt="Preview" style={{ width: '100px', height: '100px', marginTop: '10px' }} />
            )}
          </>
        ) : null}
        <div className={styles.popupButtons}>
          <button onClick={handleSubmit}>Lưu</button>
          <button onClick={onClose}>Hủy</button>
        </div>
      </div>
    </div>
  );
};

export default AddEditPopup;