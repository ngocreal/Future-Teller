import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Admin.module.css';
import EmojiPicker from 'emoji-picker-react';

const AddEditPopup = ({ isOpen, onClose, onSave, initialData, table }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isMoving, setIsMoving] = useState(false);
  const popupRef = useRef(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
      setImagePreview(initialData.image || null);
    } else {
      setFormData({ emoji: '' });
      setImagePreview(null);
    }
  }, [initialData, isOpen]);

  const handleChange = (e) => {
    if (e.target.name === 'image') {
      const file = e.target.files[0];
      setFormData({ ...formData, image: file });
      setImagePreview(URL.createObjectURL(file));
    } else {
      setFormData({ ...formData, [e.target.name]: e.target.value });
    }
  };

  const handleEmojiClick = (emojiObject) => {
    setFormData({ ...formData, emoji: emojiObject.emoji });
    setShowEmojiPicker(false);
  };

  const handleSubmit = () => {
    const data = new FormData();
    if (table === 'outlines') {
      data.append('step', formData.step || '');
      data.append('title', formData.title || '');
      data.append('time', formData.time || '');
      data.append('content', formData.content || '');
      data.append('suggest', formData.suggest || '');
      data.append('emoji', formData.emoji || '');
    } else {
      data.append('title', formData.title || '');
      if (formData.image instanceof File) {
        data.append('image', formData.image);
      }
    }
    const id = initialData?.id;
    if (id && !isNaN(id) && id > 0) {
      data.append('id', id.toString());
    }
    onSave(data);
    onClose();
  };

  const handleClearEmoji = () => {
    setFormData({ ...formData, emoji: '' }); // Xóa emoji, đặt về chuỗi rỗng
  };

  const handleHeaderClick = (e) => {
    setIsMoving(true);
    const startX = e.clientX - position.x;
    const startY = e.clientY - position.y;

    const handleMouseMove = (moveEvent) => {
      if (isMoving) {
        setPosition({
          x: moveEvent.clientX - startX,
          y: moveEvent.clientY - startY,
        });
      }
    };

    const handleMouseUp = () => {
      setIsMoving(false);
      window.removeEventListener('mousemove', handleMouseMove);
      window.removeEventListener('mouseup', handleMouseUp);
    };

    window.addEventListener('mousemove', handleMouseMove);
    window.addEventListener('mouseup', handleMouseUp);
  };

  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupWrapper}>
        <div
          className={styles.popup}
          ref={popupRef}
          style={{
            transform: `translate(${position.x}px, ${position.y}px)`,
          }}
        >
          <div className={styles.popupHeader} onMouseDown={handleHeaderClick}>
            <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
              {initialData ? 'Sửa' : 'Thêm'}{' '}
              {table === 'times'
                ? 'Thời điểm'
                : table === 'majors'
                ? 'Ngành'
                : table === 'technologies'
                ? 'Công nghệ'
                : table === 'impacts'
                ? 'Tác động'
                : 'Gợi ý'}
            </h1>
          </div>

          <div className={styles.formContainer}>
            {table === 'outlines' ? (
              <>
                <label className={styles.formLabel}>Bước:</label>
                <input
                  type="text"
                  name="step"
                  value={formData.step || ''}
                  onChange={handleChange}
                  className={styles.formInput}
                />
                <label className={styles.formLabel}>Tiêu đề:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className={styles.formInput}
                />
                <label className={styles.formLabel}>Thời gian:</label>
                <input
                  type="text"
                  name="time"
                  value={formData.time || ''}
                  onChange={handleChange}
                  className={styles.formInput}
                />
                <label className={styles.formLabel}>Nội dung:</label>
                <textarea
                  name="content"
                  value={formData.content || ''}
                  onChange={handleChange}
                  className={styles.formTextarea}
                />
                <label className={styles.formLabel}>Gợi ý:</label>
                <textarea
                  name="suggest"
                  value={formData.suggest || ''}
                  onChange={handleChange}
                  className={styles.formTextarea}
                />
                <label className={styles.formLabel}>Chọn Emoji: {' '}
                  <button
                    onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    className={styles.emojiButton}
                  >
                    {formData.emoji || 'Chọn'}
                  </button>
                  {formData.emoji && (
    <button
      onClick={handleClearEmoji}
      className={styles.emojiButton}
      style={{ marginLeft: '10px', color: '#e65a00' }}
    >
      Xóa
    </button>
  )}
  </label>
                {showEmojiPicker && (
                  <div className={styles.emojiPicker}>
                    <EmojiPicker onEmojiClick={handleEmojiClick} />
                  </div>
                )}
              </>
            ) : (
              <>
                <label className={styles.formLabel}>Tiêu đề:</label>
                <input
                  type="text"
                  name="title"
                  value={formData.title || ''}
                  onChange={handleChange}
                  className={styles.formInput}
                />
                <label className={styles.formLabel}>Hình ảnh:</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className={styles.formInput}
                />
                {imagePreview && (
                  <img
                    src={imagePreview}
                    alt="Preview"
                    className={styles.imagePreview}
                  />
                )}
              </>
            )}
          </div>
          <div className={styles.popupButtons}>
            <button onClick={handleSubmit} className={styles.saveButton}>
              Lưu
            </button>
            <button onClick={onClose} className={styles.cancelButton}>
              Hủy
            </button>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <b>X</b>
        </button>
      </div>
    </div>
  );
};

export default AddEditPopup;