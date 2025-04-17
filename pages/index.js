import { useState, useEffect } from 'react';
import { useRouter } from 'next/router'; // Thêm useRouter
import { FaWrench } from 'react-icons/fa'; // Thêm icon cờ lê
import styles from '../styles/Player.module.css';
import GamePopup from '../components/GamePopup';

const Player = () => {
  const router = useRouter(); // Khởi tạo router
  const [gameState, setGameState] = useState('initial'); // (initial, emptySlots, dealing, dealt, flipping, flipped)
  const [cards, setCards] = useState([]); // list 4 lá bài
  const [question, setQuestion] = useState(''); // ques ghép
  const [outlines, setOutlines] = useState([]); // db outlines
  const [currentOutlineIndex, setCurrentOutlineIndex] = useState(0); // Chỉ số gợi ý hiện tại
  const [isPopupOpen, setIsPopupOpen] = useState(false); // Popup gợi ý
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false); // Popup cách chơi
  const [flippedCards, setFlippedCards] = useState([false, false, false, false]); // tt lật bài
  const [showStartButton, setShowStartButton] = useState(true); // tt nút bắt đầu
  const [dealtCards, setDealtCards] = useState([]); // list lá bài đã được phát
  const [showQuestion, setShowQuestion] = useState(false); // Kiểm soát hiển thị câu hỏi
  const [popupWidth, setPopupWidth] = useState(500); // Chiều rộng popup (px)
  const [popupHeight, setPopupHeight] = useState(50); // Chiều cao popup (vh)

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

  // Hàm tăng kích thước popup
  const increasePopupSize = () => {
    setPopupWidth((prev) => Math.min(prev + 50, 1000)); // Tăng chiều rộng, tối đa 1000px
    setPopupHeight((prev) => Math.min(prev + 10, 90)); // Tăng chiều cao, tối đa 90vh
  };

  // Hàm giảm kích thước popup
  const decreasePopupSize = () => {
    setPopupWidth((prev) => Math.max(prev - 50, 300)); // Giảm chiều rộng, tối thiểu 300px
    setPopupHeight((prev) => Math.max(prev - 10, 30)); // Giảm chiều cao, tối thiểu 30vh
  };

  // Hàm chuyển hướng đến trang login
  const goToLogin = () => {
    router.push('/login');
  };

  const startGame = () => {
    setShowStartButton(false); // Ẩn nút bắt đầu
    setGameState('emptySlots'); // Chuyển sang trạng thái hiển thị 4 ô trống
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
        setGameState('dealt');
        // Tự động lật sau 3s
        setTimeout(() => {
          setGameState('flipping');
          flipCardsSequentially();
        }, 3000);
      }
    }, 500); // mỗi lá cách 0.5 giây
  };

  // Reset về trạng thái 4 ô trống
  const resetGame = () => {
    setGameState('emptySlots');
    setDealtCards([]);
    setFlippedCards([false, false, false, false]);
    setQuestion('');
    setShowQuestion(false);
    // Lấy lại dữ liệu mới từ API
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
  };

  // Lật bài lần lượt
  const flipCardsSequentially = async () => {
    const delay = (ms) => new Promise(resolve => setTimeout(resolve, ms));
  
    for (let index = 0; index < 4; index++) {
      setFlippedCards((prev) => {
        const newFlipped = [...prev];
        newFlipped[index] = true;
        return newFlipped;
      });
      await delay(500); // Chờ 500ms trước khi lật thẻ tiếp
    }
  
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
      setShowQuestion(true); // Kích hoạt hiệu ứng hiển thị câu hỏi
    }
  };

  // Mở popup gợi ý
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

  // Mở pop cách chơi
  const openHowToPlay = () => {
    setIsHowToPlayOpen(true);
  };

  // Đóng 
  const closeHowToPlay = () => {
    setIsHowToPlayOpen(false);
  };

  const prevSuggestion = () => {
    if (currentOutlineIndex > 0) {
      setCurrentOutlineIndex((prev) => prev - 1);
    } else {
      setCurrentOutlineIndex(0); // Giữ nguyên ở gợi ý đầu 
    }
  };

  const nextSuggestion = () => {
    if (currentOutlineIndex + 1 < outlines.length) {
      setCurrentOutlineIndex((prev) => prev + 1);
    } else {
      setIsPopupOpen(false); // Đóng pop khi hết
      setCurrentOutlineIndex(0); // Reset về bước đầu
    }
  };

  const howToPlayContent = (
    <>
      <p>
        Future Teller là một trò chơi kích thích tư duy, thảo luận nhóm để đưa ra các dự đoán về tương lai theo các câu hỏi tương ứng với 4 yếu tố gồm: Thời điểm, Ngành, Công nghệ, và Tác động.
      </p>
      <p>
        Khi chọn ‘Bắt đầu’, mỗi nhóm sẽ được phát 4 thẻ bài tương ứng với 4 yếu tố khác nhau được ghép thành câu hỏi hoàn chỉnh. Sau khi (các) nhóm có đủ câu hỏi, giáo viên/ quản trò có thể chọn nút ‘Gợi ý thảo luận’ để dẫn dắt cuộc thảo luận.
      </p>
    </>
  );

  const suggestionContent = outlines[currentOutlineIndex] ? (
    <>
      <h1 style={{ fontWeight: 'bold' }}>
        {outlines[currentOutlineIndex].step}: {outlines[currentOutlineIndex].title} ({outlines[currentOutlineIndex].time})
      </h1>
      <div style={{ textAlign: 'center', fontSize: '24px', margin: '10px 0' }}>
        {outlines[currentOutlineIndex].emoji}
      </div>
      <p>
        {outlines[currentOutlineIndex].content.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
      <p>
        {outlines[currentOutlineIndex].suggest.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
    </>
  ) : (
    <p>Không có dữ liệu gợi ý.</p>
  );

  return (
    <div className={styles.container}>
      {gameState === 'initial' && (
        <div className={styles.initialContainer}>
          <div className={styles.logo}>
            <span className={styles.logoMain}>FLASH VN</span>
            <span className={styles.logoSub}>Building Digital-ready Community</span>
          </div>
          <div className={styles.title}>
            <span className={styles.titleFuture}>FUTURE</span>
            <span className={styles.titleTeller}>TELLER</span>
          </div>
          <div className={styles.buttonContainer}>
            {showStartButton && (
              <button className={styles.startButton} onClick={startGame}>
                Bắt đầu
              </button>
            )}
            <button className={styles.howToPlayButton} onClick={openHowToPlay}>
              Cách chơi
            </button>
          </div>
          <div className={styles.footerText}>
            Bản quyền thuộc về FLASH VN & được cấp phép bởi nhóm cộng đồng.
          </div>
        </div>
      )}

      {/* Hiển thị 4 ô trống với nút */}
      {gameState === 'emptySlots' && (
        <div className={styles.cardsWrapper}>
          <div className={styles.cardsContainer}>
            {[...Array(4)].map((_, index) => (
              <div key={index} className={styles.emptySlot}></div>
            ))}
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.dealButton} onClick={dealCards}>
              Chia bài
            </button>
          </div>
        </div>
      )}

      {/* Animation phát bài */}
      {gameState === 'dealing' && (
        <div className={styles.cardsWrapper}>
          <div className={styles.cardsContainer}>
            {[...Array(4)].map((_, index) => {
              const card = dealtCards.find(c => c.position === index);
              return (
                <div key={index} className={styles.cardSlot}>
                  {card ? (
                    <div className={`${styles.cardDeal} ${styles[`cardPosition${card.position}`]}`}>
                      <div className={styles.cardInner}>
                        <div className={styles.cardBack}></div>
                        <div className={styles.cardFront}>
                          <img src={card.image} alt={card.type} />
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptySlot}></div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {/* Lật bài */}
      {(gameState === 'dealt' || gameState === 'flipping' || gameState === 'flipped') && (
        <div className={styles.cardsWrapper}>
          {showQuestion && question && (
            <div className={styles.questionContainer}>
              <p className={styles.question}>{question}</p>
            </div>
          )}
          <div className={`${styles.cardsContainer} ${showQuestion ? styles.cardsShiftDown : ''}`}>
            {cards.map((card, index) => (
              <div key={index} className={styles.cardSlot}>
                <div className={`${styles.card} ${flippedCards[index] ? styles.flipped : ''}`}>
                  <div className={styles.cardInner}>
                    <div className={styles.cardBack}></div>
                    <div className={styles.cardFront}>
                      <img src={card.image} alt={card.type} />
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
          {showQuestion && question && (
            <div className={styles.footer}>
              <button className={styles.resetButton} onClick={resetGame}>
                Tạo câu hỏi mới
              </button>
              <button className={styles.suggestionButton} onClick={openSuggestion}>
                Gợi ý thảo luận
              </button>
            </div>
          )}
        </div>
      )}

      {(gameState === 'emptySlots' || gameState === 'dealing' || gameState === 'dealt' || gameState === 'flipping' || gameState === 'flipped') && (
        <button className={styles.helpButton} onClick={openHowToPlay}>
          ?
        </button>
      )}

      {/* setting*/}
      <button className={styles.settingsButton} onClick={goToLogin}>
        <FaWrench />
      </button>

      <GamePopup
        isOpen={isPopupOpen}
        onClose={closePopup}
        title="Quy trình thảo luận"
        content={suggestionContent}
        showNavigation={true}
        onNext={nextSuggestion}
        onPrev={prevSuggestion}
        step={currentOutlineIndex + 1}
        popupWidth={popupWidth}
        popupHeight={popupHeight}
        onIncreaseSize={increasePopupSize}
        onDecreaseSize={decreasePopupSize}
      />

      {/* Popup cách chơi */}
      <GamePopup
        isOpen={isHowToPlayOpen}
        onClose={closeHowToPlay}
        title="Cách chơi"
        content={howToPlayContent}
        showNavigation={false}
        popupWidth={popupWidth}
        popupHeight={popupHeight}
        onIncreaseSize={increasePopupSize}
        onDecreaseSize={decreasePopupSize}
      />
    </div>
  );
};

export default Player;