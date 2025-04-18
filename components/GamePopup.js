import styles from '../styles/Player.module.css';

const GamePopup = ({isOpen, onClose, title, content, showNavigation = false, onNext, onPrev, step, popupWidth, popupHeight, onIncreaseSize, onDecreaseSize}) => {
  if (!isOpen) return null;

  return (
    <div className={styles.popupOverlay}>
      <div className={styles.popupWrapper}>
        <div className={styles.popup} style={{ width: `${popupWidth}px`, maxHeight: `${popupHeight}vh` }}>
          <div className={styles.popupHeader}>
            {title}
          </div>
          <div className={styles.popupContent}>
            {content}
          </div>
          {showNavigation && (
            <div className={styles.suggestionButtonContainer}>
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
      </div>
    </div>
  );
};

export default GamePopup;