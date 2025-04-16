import styles from '../styles/Player.module.css';

const GamePopup = ({ isOpen, onClose, title, content, showNavigation = false, onNext, onPrev, step }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupWrapper}>
        <div className={styles.popup}>
          <div className={styles.popupHeader}>
            {title}
          </div>
          <div className={styles.popupContent}>
            {content}
          </div>
          {showNavigation && (
            <div className={styles.buttonContainer}>
              {step > 1 && (
                <button className={styles.prevButton} onClick={onPrev}>
                  Bước trước
                </button>
              )}
              <button className={styles.nextButton} onClick={onNext}>
                Bước kế tiếp
              </button>
            </div>
          )}
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <b>X</b>
        </button>
      </div>
    </div>
  );
};

export default GamePopup;