import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Admin.module.css';
import EmojiPicker from 'emoji-picker-react';

const AddEditPopup = ({ isOpen, onClose, onSave, onNext, onPrev, initialData, table, mode = 'add' }) => {
  const [formData, setFormData] = useState({});
  const [imagePreview, setImagePreview] = useState(null);
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isDragging, setIsDragging] = useState(false);
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 });
  const popupRef = useRef(null);

  useEffect(() => {
    if (initialData && isOpen) {
      setFormData(initialData);
      setImagePreview(initialData.image || null);
    } else {
      setFormData({ emoji: '😊' });
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
      data.append('emoji', formData.emoji || '😊');
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

  const handleMouseDown = (e) => {
    if (popupRef.current) {
      setIsDragging(true);
      const rect = popupRef.current.getBoundingClientRect();
      setDragOffset({
        x: e.clientX - rect.left,
        y: e.clientY - rect.top,
      });
    }
  };

  const handleMouseMove = (e) => {
    if (isDragging) {
      setPosition({
        x: e.clientX - dragOffset.x,
        y: e.clientY - dragOffset.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  if (!isOpen) return null;

  return (
    <div
      className={styles.popupOverlay}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div
        className={styles.popup}
        ref={popupRef}
        style={{
          transform: `translate(${position.x}px, ${position.y}px)`,
          cursor: isDragging ? 'grabbing' : 'default',
        }}
      >
        <div className={styles.popupHeader} onMouseDown={handleMouseDown}>
          {mode === 'suggestion' ? (
            <>
              <h1 style={{ textAlign: 'center', margin: 0, flex: 1 }}>
                Quy trình thảo luận
              </h1>
              <button className={styles.closeButton} onClick={onClose}>
                <b>X</b>
              </button>
            </>
          ) : (
            <>
              <h1 style={{ margin: 0, flex: 1, textAlign: 'center' }}>
                {mode === 'edit' ? 'Sửa' : 'Thêm'}{' '}
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
              <button className={styles.closeButton} onClick={onClose}>
                <b>X</b>
              </button>
            </>
          )}
        </div>

        {mode === 'suggestion' ? (
          <div className={styles.formContainer}>
            {initialData ? (
              <>
                <h2 style={{ textAlign: 'center'}}>
                  {initialData.step}. {initialData.title}
                </h2>
                <h2 style={{ textAlign: 'center' }}>({initialData.time})</h2>
                <p>{initialData.content}</p>
                <p>{initialData.suggest}</p>
              </>
            ) : (
              <p style={{ textAlign: 'center' }}>Không có dữ liệu gợi ý.</p>
            )}
          </div>
        ) : (
          <div className={styles.formContainer}>
            {table === 'outlines' && (
              <>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Bước</label>
                  <input
                    type="text"
                    name="step"
                    value={formData.step || ''}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Thời gian</label>
                  <input
                    type="text"
                    name="time"
                    value={formData.time || ''}
                    onChange={handleChange}
                    className={styles.formInput}
                  />
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Nội dung</label>
                  <textarea
                    name="content"
                    value={formData.content || ''}
                    onChange={handleChange}
                    className={styles.formTextarea}
                  ></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>Gợi ý</label>
                  <textarea
                    name="suggest"
                    value={formData.suggest || ''}
                    onChange={handleChange}
                    className={styles.formTextarea}
                  ></textarea>
                </div>
                <div className={styles.formGroup}>
                  <label className={styles.formLabel}>
                    Emoji{' '}
                    <span
                      className={styles.emojiDisplay}
                      onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                    >
                      {formData.emoji || '😊'}
                    </span>
                  </label>
                  {showEmojiPicker && (
                    <div className={styles.emojiPicker}>
                      <EmojiPicker onEmojiClick={handleEmojiClick} />
                    </div>
                  )}
                </div>
              </>
            )}
            <div className={styles.formGroup}>
              <label className={styles.formLabel}>Tiêu đề</label>
              <input
                type="text"
                name="title"
                value={formData.title || ''}
                onChange={handleChange}
                className={styles.formInput}
              />
            </div>
            {table !== 'outlines' && (
              <div className={styles.formGroup}>
                <label className={styles.formLabel}>Ảnh</label>
                <input
                  type="file"
                  name="image"
                  accept="image/*"
                  onChange={handleChange}
                  className={styles.formInput}
                />
                {imagePreview && (
                  <img src={imagePreview} alt="Preview" className={styles.imagePreview} />
                )}
              </div>
            )}
          </div>
        )}

        <div className={styles.popupButtons}>
          {mode === 'suggestion' ? (
            <>
              <button onClick={onPrev} className={styles.prevButton}>
                Bước trước
              </button>
              <button onClick={onNext} className={styles.nextButton}>
                Bước kế tiếp
              </button>
            </>
          ) : (
            <>
              <button onClick={handleSubmit} className={styles.saveButton}>
                Lưu
              </button>
              <button onClick={onClose} className={styles.cancelButton}>
                Hủy
              </button>
            </>
          )}
        </div>
      </div>
    </div>
  );
};

export default AddEditPopup;