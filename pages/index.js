require('dotenv').config();
import { useState, useEffect } from 'react';
import { useRouter } from 'next/router';
import { FaWrench } from 'react-icons/fa';
import styles from '../styles/Player.module.css';
import GamePopup from '../components/GamePopup';

const Player = () => {
  const router = useRouter();//khởi tạo
  const [gameState, setGameState] = useState('initial');// (initial, emptySlots, dealing, dealt, flipping, flipped)
  const [cards, setCards] = useState([]);//list 4 lá
  const [question, setQuestion] = useState('');//ghép ques
  const [outlines, setOutlines] = useState([]);//db
  const [currentOutlineIndex, setCurrentOutlineIndex] = useState(0);//chỉ số oulines hiện tại
  const [isPopupOpen, setIsPopupOpen] = useState(false);//pop
  const [isHowToPlayOpen, setIsHowToPlayOpen] = useState(false);//pop 
  const [flippedCards, setFlippedCards] = useState([false, false, false, false]);//tt lật
  const [showStartButton, setShowStartButton] = useState(true);//tt nút start
  const [dealtCards, setDealtCards] = useState([]);//list lá đã phát
  const [showQuestion, setShowQuestion] = useState(false);//kiểm soát hiển thị ques
  const [fontScale, setFontScale] = useState(1); // 1 là kích thước gốc
  const increaseFontSize = () => {
    setFontScale((prev) => Math.min(prev + 0.1, 3)); // Tăng tối đa 2 lần (giới hạn)
  };
  const decreaseFontSize = () => {
    setFontScale((prev) => Math.max(prev - 0.1, 0.5)); // Giảm tối thiểu 0.5 lần (giới hạn)
  };

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
//tăng kth pop
  const increasePopupSize = () => {
    setPopupWidth((prev) => Math.min(prev + 50, 1000));
    setPopupHeight((prev) => Math.min(prev + 10, 90));
  };
//giảm kth pop
  const decreasePopupSize = () => {
    setPopupWidth((prev) => Math.max(prev - 50, 300));
    setPopupHeight((prev) => Math.max(prev - 10, 30));
  };

  const goToLogin = () => {
    router.push('/login');
  };
//4 ô trống
  const startGame = () => {
    setShowStartButton(false);
    setGameState('emptySlots');
  };
// Phát từ trái sang phải
  const dealCards = () => {
    setGameState('dealing');
    console.log('Mảng cards:', cards);
    let index = 0;
    const interval = setInterval(() => {
      setDealtCards((prev) => {
        const newCard = { ...cards[index], position: index + 1 };
        console.log('Phát lá bài:', newCard, 'Position:', newCard.position);
        return [...prev, newCard];
      });
      index++;
      if (index === 4) {
        clearInterval(interval);
        setGameState('dealt');
        setTimeout(() => {
          console.log('dealtCards sau khi phát:', dealtCards);
          setGameState('flipping');
          flipCardsSequentially();
        }, 2000);
      }
    }, 500);
  };
// Reset về tt 4 ô trống
  const resetGame = () => {
    setGameState('emptySlots');
    setDealtCards([]);
    setFlippedCards([false, false, false, false]);
    setQuestion('');
    setShowQuestion(false);
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
//lần lượt lật
  const flipCardsSequentially = async () => {
    const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));
    for (let index = 0; index < 4; index++) {
      setFlippedCards((prev) => {
        const newFlipped = [...prev];
        newFlipped[index] = true;
        return newFlipped;
      });
      await delay(500);
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
      setShowQuestion(true);
    }
  };
//mở pop
  const openSuggestion = () => {
    if (outlines.length > 0) {
      setIsPopupOpen(true);
    }
  };

  const closePopup = () => {
    setIsPopupOpen(false);
    setCurrentOutlineIndex(0);
  };

  const openHowToPlay = () => {
    setIsHowToPlayOpen(true);
  };

  const closeHowToPlay = () => {
    setIsHowToPlayOpen(false);
  };

  const prevSuggestion = () => {
    if (currentOutlineIndex > 0) {
      setCurrentOutlineIndex((prev) => prev - 1);
    } else {
      setCurrentOutlineIndex(0);
    }
  };

  const nextSuggestion = () => {
    if (currentOutlineIndex + 1 < outlines.length) {
      setCurrentOutlineIndex((prev) => prev + 1);
    } else {
      setIsPopupOpen(false);
      setCurrentOutlineIndex(0);
    }
  };

  const howToPlayContent = (
    <>
      <p style={{ fontSize: `${25 * fontScale}px` }}>
        Future Teller là một trò chơi kích thích tư duy, thảo luận nhóm để đưa ra các dự đoán về tương lai theo các câu hỏi tương ứng với 4 yếu tố gồm: Thời điểm, Ngành, Công nghệ, và Tác động.
      </p>
      <p style={{ fontSize: `${25 * fontScale}px` }}>
        Khi chọn ‘Bắt đầu’, mỗi nhóm sẽ được phát 4 thẻ bài tương ứng với 4 yếu tố khác nhau được ghép thành câu hỏi hoàn chỉnh. Sau khi (các) nhóm có đủ câu hỏi, giáo viên/ quản trò có thể chọn nút ‘Gợi ý thảo luận’ để dẫn dắt cuộc thảo luận.
      </p>
    </>
  );

  const suggestionContent = outlines[currentOutlineIndex] ? (
    <>
      <h1 style={{ fontWeight: 'bold', fontSize: `${25 * fontScale}px` }}>
        {outlines[currentOutlineIndex].step}: {outlines[currentOutlineIndex].title} ({outlines[currentOutlineIndex].time})
      </h1>
      <div style={{ textAlign: 'center', fontSize: `${45 * fontScale}px`, margin: '10px 0' }}>
        {outlines[currentOutlineIndex].emoji}
      </div>
      <p style={{ fontSize: `${25 * fontScale}px` }}>
        {outlines[currentOutlineIndex].content.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
      <p style={{ fontSize: `${25 * fontScale}px` }}>
        {outlines[currentOutlineIndex].suggest.split('\n').map((line, index) => (
          <span key={index}>
            {line}
            <br />
          </span>
        ))}
      </p>
    </>
  ) : (
    <p style={{ fontSize: `${25 * fontScale}px` }}>Không có dữ liệu gợi ý.</p>
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

      {gameState === 'emptySlots' && (
        <div className={styles.cardsWrapper}>
          <div className={styles.questionContainer} style={{marginBottom: '40px'}}>
      <p className={styles.question}>Bạn đã sẵn sàng cho câu hỏi chưa nào?</p>
    </div>
          <div className={styles.cardsContainer}>
            {[...Array(4)].map((_, index) => (
              <div key={index} className={styles.emptySlot}>
                <div className={styles.slotQuestionMark}>?</div>
              </div>
            ))}
          </div>
          <div className={styles.buttonContainer}>
            <button className={styles.dealButton} onClick={dealCards}>
              Chia bài
            </button>
          </div>
        </div>
      )}

      {gameState === 'dealing' && (
        <div className={styles.cardsWrapper}>
          <div className={styles.cardsContainer}>
            {[...Array(4)].map((_, index) => {
              const card = dealtCards[index]; // Lấy trực tiếp theo thứ tự thêm vào
              return (
                <div key={index} className={styles.cardSlot} data-position={index + 1}>
                  {card ? (
                    <div className={styles.cardDeal}>
                      <div className={styles.cardInner}>
                        <div className={styles.cardBack}></div>
                        <div className={styles.cardFront}>
                          <img src={card.image} alt={card.type} />
                          <span className={styles.debugLabel}>{card.type}</span> {/* Debug */}
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className={styles.emptySlot}>
                    <div className={styles.slotQuestionMark}>?</div>
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      )}

      {(gameState === 'dealt' || gameState === 'flipping' || gameState === 'flipped') && (
        <div className={styles.cardsWrapper}>
          {showQuestion && question && (
            <div className={styles.questionContainer}>
              <p className={styles.question}>{question}</p>
            </div>
          )}
          <div className={`${styles.cardsContainer} ${showQuestion ? styles.cardsShiftDown : ''}`}>
            {cards.map((card, index) => (
              <div key={index} className={styles.cardSlot} data-position={index + 1}>
                <div className={`${styles.card} ${flippedCards[index] ? styles.flipped : ''}`}>
                  <div className={styles.cardInner}>
                    <div className={styles.cardBack}></div>
                    <div className={styles.cardFront}>
                      <img src={card.image} alt={card.type} />
                      {/* <span className={styles.debugLabel}>{card.type}</span> */}
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
  fontScale={fontScale}
  onIncreaseSize={increaseFontSize}
  onDecreaseSize={decreaseFontSize}
/>

<GamePopup
  isOpen={isHowToPlayOpen}
  onClose={closeHowToPlay}
  title="Cách chơi"
  content={howToPlayContent}
  showNavigation={false}
  fontScale={fontScale}
  onIncreaseSize={increaseFontSize}
  onDecreaseSize={decreaseFontSize}
/>
    </div>
  );
};

export default Player;