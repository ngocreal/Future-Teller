import styles from '../styles/Player.module.css';

const GamePopup = ({ isOpen, onClose, title, content, showNavigation = false, onNext, onPrev, step, fontScale, onIncreaseSize, onDecreaseSize }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupWrapper}>
        <div className={styles.popup}>
          <div className={styles.popupHeader} style={{ fontSize: `${40 * fontScale}px` }}>
            {title}
            {showNavigation && <div className={styles.headerDivider}></div>}
          </div>
          <div className={styles.popupContent}>
            {content}
          </div>
          <div className={styles.sizeControlContainer}>
            <button className={styles.sizeButton} onClick={onIncreaseSize}>
              +
            </button>
            <button className={styles.sizeButton} onClick={onDecreaseSize}>
              -
            </button>
          </div>
        </div>
        <button className={styles.closeButton} onClick={onClose}>
          <b>X</b>
        </button>
        {showNavigation && (
          <div className={styles.navigationButtons}>
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
    </div>
  );
};

export default GamePopup;