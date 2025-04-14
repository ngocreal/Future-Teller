import { useState, useEffect, useRef } from 'react';
import styles from '../styles/Player.module.css';
import AddEditPopup from '../components/AddEditPopup';

const Player = () => {
  const [gameState, setGameState] = useState('initial'); // (initial, movingToCenter, shuffling, stopped, dealing, dealt, flipping, flipped)
  const [cards, setCards] = useState([]); // list 4 lá bài
  const [question, setQuestion] = useState(''); // ques ghép
  const [outlines, setOutlines] = useState([]); // db outlines
  const [currentOutlineIndex, setCurrentOutlineIndex] = useState(0); // Chỉ số gợi ý hiện tại
  const [isPopupOpen, setIsPopupOpen] = useState(false);
  const [flippedCards, setFlippedCards] = useState([false, false, false, false]); // tt lật bài
  const [showStartButton, setShowStartButton] = useState(true); //tt nút bắt đầu
  const [dealtCards, setDealtCards] = useState([]); // list lá bài đã được phát
  const [showCardStack, setShowCardStack] = useState(true); // tt xấp bài

  // Lấy dữ liệu từ API khi tải trang
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

  const startShuffling = () => {
    setShowStartButton(false); // Ẩn nút bắt đầu
    setGameState('movingToCenter');
    setTimeout(() => {
      setGameState('shuffling');
      setTimeout(() => {
        setGameState('stopped');
      }, 3000); // Xáo bài
    }, 1000); // Di chuyển về giữa
  };

  // Phát từ trái sang phải
  const dealCards = () => {
    setGameState('dealing');
    let index = 0;
    const interval = setInterval(() => {
      setDealtCards((prev) => [...prev, { ...cards[index], position: index }]);
      index++;
      if (index === 4) {
        clearInterval(interval);
        setShowCardStack(false); // Ẩn khi phát lá cuối cùng
        setGameState('dealt');
        // tự động lật sau 3 giây nghỉ
        setTimeout(() => {
          setGameState('flipping');
          flipCardsSequentially();
        }, 1000);
      }
    }, 500); // Phát mỗi lá cách 0.5 giây
  };

  // Lật bài lần lượt
  const flipCardsSequentially = async () => {
    console.log('Starting flipCardsSequentially...');
  
    // Hàm delay để chờ 500ms
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
    // Lật từng thẻ
    for (let index = 0; index < 4; index++) {
      setFlippedCards((prev) => {
        const newFlipped = [...prev];
        newFlipped[index] = true;
        console.log('Updated flippedCards:', newFlipped);
        return newFlipped;
      });
      await delay(500); // Chờ 500ms trước khi lật thẻ tiếp
    }
  
    // lật xong
    setGameState('flipped');
    if (cards.length === 4) {
      const timeTitle = cards[0].title;
      let questionElements = [];

      if (timeTitle === 'Con người có thể sống trên Mặt trăng') {
        questionElements = [
          <span key="time" className={styles.timeHighlight}>{timeTitle}</span>,
          ', khi ',
          <span key="major" className={styles.majorHighlight}>{cards[1].title}</span>,
          ' có sự hỗ trợ của công nghệ ',
          <span key="tech" className={styles.techHighlight}>{cards[2].title}</span>,
          ' sẽ ',
          <span key="impact" className={styles.impactHighlight}>{cards[3].title}</span>,
          ' như thế nào?',
        ];
      } else if (timeTitle === 'Sau Thế chiến thứ 3') {
        questionElements = [
          <span key="time" className={styles.timeHighlight}>{timeTitle}</span>,
          ', ',
          <span key="major" className={styles.majorHighlight}>{cards[1].title}</span>,
          ' có sự hỗ trợ của công nghệ ',
          <span key="tech" className={styles.techHighlight}>{cards[2].title}</span>,
          ' sẽ ',
          <span key="impact" className={styles.impactHighlight}>{cards[3].title}</span>,
          ' ra sao?',
        ];
      } else if (cards[3].title === 'mâu thuẫn xã hội') {
        questionElements = [
          <span key="time" className={styles.timeHighlight}>{timeTitle}</span>,
          ', ',
          <span key="major" className={styles.majorHighlight}>{cards[1].title}</span>,
          ' có sự hỗ trợ của công nghệ ',
          <span key="tech" className={styles.techHighlight}>{cards[2].title}</span>,
          ' sẽ ',
          <span key="impact" className={styles.impactHighlight}>{cards[3].title}</span>,
          ' như thế nào?',
        ];
      } else if (cards[3].title === 'khủng hoảng kinh tế') {
        questionElements = [
          <span key="time" className={styles.timeHighlight}>{timeTitle}</span>,
          ', ',
          <span key="major" className={styles.majorHighlight}>{cards[1].title}</span>,
          ' có sự hỗ trợ của công nghệ ',
          <span key="tech" className={styles.techHighlight}>{cards[2].title}</span>,
          ' sẽ ',
          <span key="impact" className={styles.impactHighlight}>{cards[3].title}</span>,
          ' ra sao?',
        ];
      } else {
        questionElements = [
          <span key="time" className={styles.timeHighlight}>{timeTitle}</span>,
          ', ',
          <span key="major" className={styles.majorHighlight}>{cards[1].title}</span>,
          ' có sự hỗ trợ của công nghệ ',
          <span key="tech" className={styles.techHighlight}>{cards[2].title}</span>,
          ' sẽ ',
          <span key="impact" className={styles.impactHighlight}>{cards[3].title}</span>,
          ' gì?',
        ];
      }

      setQuestion(questionElements);
    }
  };

  // Mở pop
  const openSuggestion = () => {
    if (outlines.length > 0) {
      setIsPopupOpen(true);
    }
  };

  // Đóng pop
  const closePopup = () => {
    setIsPopupOpen(false);
    setCurrentOutlineIndex(0); // Reset về gợi ý đầu tiên khi đóng
  };

  const prevSuggestion = () => {
    if (currentOutlineIndex > 0) {
      setCurrentOutlineIndex((prev) => prev - 1);
    } else {
      setCurrentOutlineIndex(0); // Giữ nguyên ở gợi ý đầu 
    }
  };

  // Chuyển sang gợi ý tiếp theo
  const nextSuggestion = () => {
    if (currentOutlineIndex + 1 < outlines.length) {
      setCurrentOutlineIndex((prev) => prev + 1);
    } else {
      setIsPopupOpen(false); // Đóng popup khi hết
      setCurrentOutlineIndex(0); // Reset về bước đầu
    }
  };

  return (
    <div className={styles.container}>
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

      {/* Animation xào bài */}
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

      {/* sau khi xào gom lại 1 chồng */}
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

      {/* Lật bài*/}
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

      {/* Pop gợi ý */}
      {isPopupOpen && outlines[currentOutlineIndex] && (
        <AddEditPopup
          isOpen={isPopupOpen}
          onClose={closePopup}
          onNext={nextSuggestion}
          onPrev={prevSuggestion}
          initialData={outlines[currentOutlineIndex]}
          table="outlines"
          mode="suggestion"
        />
      )}
    </div>
  );
};

export default Player;