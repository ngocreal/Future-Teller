import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Player.module.css';
import AddEditPopup from '../components/AddEditPopup';

const Player = () => {
  const [gameState, setGameState] = useState('initial'); // initial, movingToCenter, shuffling, stopped, dealing, dealt, flipping, flipped
  const [cards, setCards] = useState([]); // Danh sách 4 lá bài
  const [question, setQuestion] = useState(''); // Câu hỏi ghép từ 4 bảng
  const [outlines, setOutlines] = useState([]); // Dữ liệu gợi ý từ bảng outlines
  const [currentOutlineIndex, setCurrentOutlineIndex] = useState(0); // Chỉ số gợi ý hiện tại
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState([false, false, false, false]); // Trạng thái lật bài
  const [showStartButton, setShowStartButton] = useState(true); //tt nút bắt đầu
  const [dealtCards, setDealtCards] = useState([]); // list lá bài đã được phát
  const [showCardStack, setShowCardStack] = useState(true); // tt xấp bài

  // Lấy dữ liệu từ API khi trang tải
  useEffect(() => {
    const fetchData = async () => {
      const res = await fetch('/api/player');
      const data = await res.json();
      if (data.times && data.majors && data.technologies && data.impacts && data.outlines) {
        const randomTime = data.times[Math.floor(Math.random() * data.times.length)];
        const randomMajor = data.majors[Math.floor(Math.random() * data.majors.length)];
        const randomTech = data.technologies[Math.floor(Math.random() * data.technologies.length)];
        const randomImpact = data.impacts[Math.floor(Math.random() * data.impacts.length)];
        setCards([
          { type: 'time', image: randomTime.image || '/images/placeholder.png', title: randomTime.title },
          { type: 'major', image: randomMajor.image || '/images/placeholder.png', title: randomMajor.title },
          { type: 'technology', image: randomTech.image || '/images/placeholder.png', title: randomTech.title },
          { type: 'impact', image: randomImpact.image || '/images/placeholder.png', title: randomImpact.title },
        ]);
        setOutlines(data.outlines);
      }
    };
    fetchData();
  }, []);

  // Bắt đầu: Di chuyển lá bài về giữa, xáo bài, gộp thành xấp
  const startShuffling = () => {
    setShowStartButton(false); // Ẩn nút bắt đầu
    setGameState('movingToCenter');
    setTimeout(() => {
      setGameState('shuffling');
      setTimeout(() => {
        setGameState('stopped');
      }, 3000); // Xáo bài trong 3 giây
    }, 1000); // Di chuyển về giữa trong 1 giây
  };

  // Phát bài từng lá từ trái sang phải
  const dealCards = () => {
    setGameState('dealing');
    let index = 0;
    const interval = setInterval(() => {
      setDealtCards((prev) => [...prev, { ...cards[index], position: index }]);
      index++;
      if (index === 4) {
        clearInterval(interval);
        setShowCardStack(false); // Ẩn xấp bài khi phát lá cuối cùng
        setGameState('dealt');
        // Sau 3 giây nghỉ, tự động lật bài
        setTimeout(() => {
          setGameState('flipping');
          flipCardsSequentially();
        }, 3000);
      }
    }, 500); // Phát mỗi lá cách nhau 0.5 giây
  };

  // Lật bài lần lượt
  const flipCardsSequentially = () => {
    let index = 0;
    const interval = setInterval(() => {
      setFlippedCards((prev) => {
        const newFlipped = [...prev];
        newFlipped[index] = true;
        return newFlipped;
      });
      index++;
      if (index === 4) {
        clearInterval(interval);
        setGameState('flipped');
        // Hiển thị câu hỏi sau khi lật hết
        if (cards.length === 4) {
          const timeTitle = cards[0].title;
          let questionText = '';
          if (timeTitle === 'Con người có thể sống trên mặt trăng') {
            questionText = `[${timeTitle}], khi [${cards[1].title}] có sự hỗ trợ của công nghệ [${cards[2].title}] sẽ [${cards[3].title}] như thế nào?`;
          } else if (timeTitle === 'Sau Thế chiến thứ 3') {
            questionText = `[${timeTitle}], [${cards[1].title}] có sự hỗ trợ của công nghệ [${cards[2].title}] sẽ [${cards[3].title}] ra sao?`;
          } else {
            questionText = `[${timeTitle}], [${cards[1].title}] có sự hỗ trợ của công nghệ [${cards[2].title}] sẽ [${cards[3].title}] gì?`;
          }
          setQuestion(questionText);
        }
      }
    }, 500); // Lật mỗi lá cách nhau 0.5 giây
  };

  // Mở popup gợi ý
  const openSuggestion = () => {
    if (outlines.length > 0) {
      setIsPopupOpen(true);
    }
  };

  // Đóng popup gợi ý và reset chỉ số gợi ý
  const closePopup = () => {
    setIsPopupOpen(false);
    setCurrentOutlineIndex(0); // Reset về gợi ý đầu tiên khi đóng
  };

  // Chuyển sang gợi ý tiếp theo
  const nextSuggestion = () => {
    if (currentOutlineIndex + 1 < outlines.length) {
      setCurrentOutlineIndex((prev) => prev + 1);
    } else {
      setIsPopupOpen(false);
      setCurrentOutlineIndex(0);
    }
  };

  return (
    <div className={styles.container}>
      {/* Trang đầu: Các lá bài xòe ra và nút bắt đầu */}
      {gameState === 'initial' && (
        <div className={styles.initialContainer}>
          <div className={styles.cardSpread}>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
          </div>
          {showStartButton && (
            <button className={styles.startButton} onClick={startShuffling}>
              Nhấp để bắt đầu
            </button>
          )}
        </div>
      )}

      {/* Di chuyển lá bài về giữa */}
      {gameState === 'movingToCenter' && (
        <div className={styles.movingContainer}>
          <div className={styles.cardMoving}>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
          </div>
        </div>
      )}

      {/* Animation xáo bài */}
      {gameState === 'shuffling' && (
        <div className={styles.shuffleContainer}>
          <div className={styles.cardShuffle}>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
            <div className={styles.card}></div>
          </div>
        </div>
      )}

      {/* Chồng bài sau khi xáo */}
      {(gameState === 'stopped' || gameState === 'dealing') && showCardStack && (
        <div className={styles.cardStack} onClick={dealCards}>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
          <div className={styles.card}></div>
        </div>
      )}

      {/* Animation phát bài */}
      {gameState === 'dealing' && (
        <div className={styles.dealContainer}>
          {dealtCards.map((card, index) => (
            <div key={index} className={`${styles.cardDeal} ${styles[`cardPosition${card.position}`]}`}>
              <div className={styles.cardInner}>
                <div className={styles.cardBack}></div>
                <div className={styles.cardFront}>
                  <img src={card.image} alt={card.type} />
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Hiển thị 4 lá bài sau khi phát */}
      {(gameState === 'dealt' || gameState === 'flipping' || gameState === 'flipped') && (
        <div className={styles.cardsWrapper}>
          <div className={styles.cardsContainer}>
            {cards.map((card, index) => (
              <div
                key={index}
                className={`${styles.card} ${flippedCards[index] ? styles.flipped : ''}`}
              >
                <div className={styles.cardInner}>
                  <div className={styles.cardBack}></div>
                  <div className={styles.cardFront}>
                    <img src={card.image} alt={card.type} />
                  </div>
                </div>
              </div>
            ))}
          </div>
          {question && (
            <div className={styles.questionContainer}>
              <p className={styles.question}>{question}</p>
            </div>
          )}
        </div>
      )}

      {/* Nút Gợi ý */}
      {question && (
        <div className={styles.footer}>
          <button className={styles.suggestionButton} onClick={openSuggestion}>
            Gợi ý
          </button>
        </div>
      )}

      {/* Popup gợi ý */}
      {isPopupOpen && outlines[currentOutlineIndex] && (
        <AddEditPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          onNext={nextSuggestion}
          initialData={outlines[currentOutlineIndex]}
          table="outlines"
          mode="suggestion"
        />
      )}
    </div>
  );
};

export default Player;