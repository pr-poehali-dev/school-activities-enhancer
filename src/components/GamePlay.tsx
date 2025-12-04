import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import Icon from '@/components/ui/icon';
import { Badge } from '@/components/ui/badge';

interface Question {
  question: string;
  options: string[];
  correctAnswer: number;
}

interface GamePlayProps {
  gameId: string;
  gameTitle: string;
  gameIcon: string;
  difficulty: number;
  onClose: () => void;
  onComplete: (points: number) => void;
}

const GamePlay = ({ gameId, gameTitle, gameIcon, difficulty, onClose, onComplete }: GamePlayProps) => {
  const [currentQuestion, setCurrentQuestion] = useState(0);
  const [score, setScore] = useState(0);
  const [showResult, setShowResult] = useState(false);
  const [selectedAnswer, setSelectedAnswer] = useState<number | null>(null);
  const [isCorrect, setIsCorrect] = useState<boolean | null>(null);
  const [timeLeft, setTimeLeft] = useState(30);

  const generateQuestions = (): Question[] => {
    switch (gameId) {
      case '1':
        return Array.from({ length: 10 }, () => {
          const a = Math.floor(Math.random() * 10) + 1;
          const b = Math.floor(Math.random() * 10) + 1;
          const correct = a * b;
          const wrong1 = correct + Math.floor(Math.random() * 5) + 1;
          const wrong2 = correct - Math.floor(Math.random() * 5) - 1;
          const wrong3 = correct + Math.floor(Math.random() * 10) + 5;
          const options = [correct, wrong1, wrong2, wrong3].sort(() => Math.random() - 0.5);
          return {
            question: `${a} × ${b} = ?`,
            options: options.map(String),
            correctAnswer: options.indexOf(correct)
          };
        });

      case '2':
        const words = [
          { word: 'к_рова', correct: 'о', options: ['а', 'о', 'е', 'и'] },
          { word: 'с_бака', correct: 'о', options: ['а', 'о', 'е', 'и'] },
          { word: 'м_локо', correct: 'о', options: ['а', 'о', 'е', 'и'] },
          { word: 'яг_да', correct: 'о', options: ['а', 'о', 'е', 'и'] },
          { word: 'п_нал', correct: 'е', options: ['а', 'о', 'е', 'и'] },
          { word: 'т_традь', correct: 'е', options: ['а', 'о', 'е', 'и'] },
          { word: 'к_рандаш', correct: 'а', options: ['а', 'о', 'е', 'и'] },
          { word: 'в_рона', correct: 'о', options: ['а', 'о', 'е', 'и'] },
          { word: 'з_мля', correct: 'е', options: ['а', 'о', 'е', 'и'] },
          { word: 'д_ревня', correct: 'е', options: ['а', 'о', 'е', 'и'] }
        ];
        return words.map(w => ({
          question: `Какая буква пропущена в слове: ${w.word}?`,
          options: w.options,
          correctAnswer: w.options.indexOf(w.correct)
        }));

      case '3':
        const englishWords = [
          { word: 'cat', translation: 'кошка', wrong: ['собака', 'мышь', 'птица'] },
          { word: 'dog', translation: 'собака', wrong: ['кошка', 'лошадь', 'корова'] },
          { word: 'book', translation: 'книга', wrong: ['тетрадь', 'ручка', 'карандаш'] },
          { word: 'apple', translation: 'яблоко', wrong: ['груша', 'банан', 'апельсин'] },
          { word: 'house', translation: 'дом', wrong: ['школа', 'магазин', 'парк'] },
          { word: 'water', translation: 'вода', wrong: ['молоко', 'сок', 'чай'] },
          { word: 'sun', translation: 'солнце', wrong: ['луна', 'звезда', 'небо'] },
          { word: 'tree', translation: 'дерево', wrong: ['цветок', 'трава', 'куст'] },
          { word: 'friend', translation: 'друг', wrong: ['враг', 'учитель', 'родитель'] },
          { word: 'school', translation: 'школа', wrong: ['дом', 'парк', 'магазин'] }
        ];
        return englishWords.map(w => {
          const options = [w.translation, ...w.wrong].sort(() => Math.random() - 0.5);
          return {
            question: `Переведи слово: ${w.word}`,
            options,
            correctAnswer: options.indexOf(w.translation)
          };
        });

      case '4':
        const capitals = [
          { country: 'Франция', capital: 'Париж', wrong: ['Лондон', 'Берлин', 'Рим'] },
          { country: 'Италия', capital: 'Рим', wrong: ['Париж', 'Мадрид', 'Афины'] },
          { country: 'Германия', capital: 'Берлин', wrong: ['Вена', 'Прага', 'Варшава'] },
          { country: 'Испания', capital: 'Мадрид', wrong: ['Барселона', 'Лиссабон', 'Рим'] },
          { country: 'Англия', capital: 'Лондон', wrong: ['Эдинбург', 'Дублин', 'Париж'] },
          { country: 'Япония', capital: 'Токио', wrong: ['Пекин', 'Сеул', 'Бангкок'] },
          { country: 'Китай', capital: 'Пекин', wrong: ['Токио', 'Сеул', 'Шанхай'] },
          { country: 'Египет', capital: 'Каир', wrong: ['Александрия', 'Дубай', 'Багдад'] },
          { country: 'Бразилия', capital: 'Бразилиа', wrong: ['Рио-де-Жанейро', 'Сан-Паулу', 'Буэнос-Айрес'] },
          { country: 'Австралия', capital: 'Канберра', wrong: ['Сидней', 'Мельбурн', 'Перт'] }
        ];
        return capitals.map(c => {
          const options = [c.capital, ...c.wrong].sort(() => Math.random() - 0.5);
          return {
            question: `Столица ${c.country}?`,
            options,
            correctAnswer: options.indexOf(c.capital)
          };
        });

      case '5':
        const sequences = [
          { seq: '2, 4, 6, 8, ?', answer: '10', wrong: ['9', '11', '12'] },
          { seq: '1, 3, 5, 7, ?', answer: '9', wrong: ['8', '10', '11'] },
          { seq: '10, 20, 30, 40, ?', answer: '50', wrong: ['45', '55', '60'] },
          { seq: '3, 6, 9, 12, ?', answer: '15', wrong: ['13', '14', '18'] },
          { seq: '5, 10, 15, 20, ?', answer: '25', wrong: ['22', '30', '24'] },
          { seq: '1, 4, 9, 16, ?', answer: '25', wrong: ['20', '24', '30'] },
          { seq: '2, 6, 18, 54, ?', answer: '162', wrong: ['108', '216', '324'] },
          { seq: '100, 90, 80, 70, ?', answer: '60', wrong: ['65', '55', '50'] },
          { seq: '1, 2, 4, 8, ?', answer: '16', wrong: ['12', '14', '18'] },
          { seq: '7, 14, 21, 28, ?', answer: '35', wrong: ['32', '33', '36'] }
        ];
        return sequences.map(s => {
          const options = [s.answer, ...s.wrong].sort(() => Math.random() - 0.5);
          return {
            question: `Продолжи последовательность: ${s.seq}`,
            options,
            correctAnswer: options.indexOf(s.answer)
          };
        });

      case '6':
        const fractions = [
          { q: '1/2 + 1/4 = ?', a: '3/4', w: ['1/3', '2/3', '1/4'] },
          { q: '50% от 100 = ?', a: '50', w: ['25', '75', '100'] },
          { q: '1/3 от 30 = ?', a: '10', w: ['5', '15', '20'] },
          { q: '25% от 80 = ?', a: '20', w: ['15', '25', '30'] },
          { q: '3/4 от 20 = ?', a: '15', w: ['10', '12', '18'] },
          { q: '10% от 200 = ?', a: '20', w: ['10', '30', '40'] },
          { q: '1/2 от 50 = ?', a: '25', w: ['20', '30', '35'] },
          { q: '2/3 от 60 = ?', a: '40', w: ['30', '45', '50'] },
          { q: '75% от 40 = ?', a: '30', w: ['25', '35', '20'] },
          { q: '1/5 от 100 = ?', a: '20', w: ['10', '25', '30'] }
        ];
        return fractions.map(f => {
          const options = [f.a, ...f.w].sort(() => Math.random() - 0.5);
          return {
            question: f.q,
            options,
            correctAnswer: options.indexOf(f.a)
          };
        });

      default:
        return [
          {
            question: 'Начни играть!',
            options: ['OK', 'Вперёд!', 'Играть', 'Старт'],
            correctAnswer: 0
          }
        ];
    }
  };

  const [questions] = useState<Question[]>(generateQuestions());

  useEffect(() => {
    if (showResult || selectedAnswer !== null) return;

    const timer = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev <= 1) {
          handleTimeout();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [currentQuestion, showResult, selectedAnswer]);

  const handleTimeout = () => {
    setIsCorrect(false);
    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(30);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleAnswer = (index: number) => {
    if (selectedAnswer !== null) return;

    setSelectedAnswer(index);
    const correct = index === questions[currentQuestion].correctAnswer;
    setIsCorrect(correct);

    if (correct) {
      const points = difficulty === 1 ? 10 : difficulty === 2 ? 20 : 30;
      setScore(score + points);
    }

    setTimeout(() => {
      if (currentQuestion < questions.length - 1) {
        setCurrentQuestion(currentQuestion + 1);
        setSelectedAnswer(null);
        setIsCorrect(null);
        setTimeLeft(30);
      } else {
        setShowResult(true);
      }
    }, 1500);
  };

  const handleFinish = () => {
    onComplete(score);
    onClose();
  };

  const progress = ((currentQuestion + 1) / questions.length) * 100;

  if (showResult) {
    return (
      <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
        <Card className="max-w-md w-full animate-bounce-in shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white text-center">
            <div className="text-6xl mb-4">{score >= 150 ? '🏆' : score >= 100 ? '🎉' : '👍'}</div>
            <CardTitle className="text-3xl">Игра завершена!</CardTitle>
          </CardHeader>
          <CardContent className="p-6 text-center space-y-4">
            <div className="bg-gradient-to-br from-purple-100 to-pink-100 p-6 rounded-2xl">
              <p className="text-5xl font-bold text-purple-600 mb-2">{score}</p>
              <p className="text-gray-600">очков заработано</p>
            </div>
            <div className="flex gap-2 justify-center">
              <Badge className="bg-blue-500 text-white">
                {currentQuestion + 1} вопросов
              </Badge>
              <Badge className="bg-green-500 text-white">
                {Math.round((score / ((currentQuestion + 1) * (difficulty === 1 ? 10 : difficulty === 2 ? 20 : 30))) * 100)}% точность
              </Badge>
            </div>
            <Button 
              onClick={handleFinish}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white text-lg py-6"
            >
              Отлично! Вернуться
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center z-50 p-4 animate-fade-in">
      <Card className="max-w-2xl w-full animate-scale-in shadow-2xl">
        <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-4xl">{gameIcon}</span>
              <CardTitle className="text-2xl">{gameTitle}</CardTitle>
            </div>
            <Button 
              variant="ghost" 
              size="icon" 
              onClick={onClose}
              className="text-white hover:bg-white/20"
            >
              <Icon name="X" size={24} />
            </Button>
          </div>
          <div className="mt-4 space-y-2">
            <div className="flex justify-between text-sm">
              <span>Вопрос {currentQuestion + 1} из {questions.length}</span>
              <span className="flex items-center gap-1">
                <Icon name="Clock" size={16} />
                {timeLeft}с
              </span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="p-6">
          <div className="space-y-6">
            <div className="bg-gradient-to-br from-blue-50 to-purple-50 p-6 rounded-2xl text-center">
              <p className="text-2xl font-semibold text-gray-800">
                {questions[currentQuestion].question}
              </p>
            </div>

            <div className="grid grid-cols-1 gap-3">
              {questions[currentQuestion].options.map((option, index) => {
                const isSelected = selectedAnswer === index;
                const isCorrectAnswer = index === questions[currentQuestion].correctAnswer;
                const showCorrect = selectedAnswer !== null && isCorrectAnswer;
                const showWrong = isSelected && !isCorrectAnswer;

                return (
                  <Button
                    key={index}
                    onClick={() => handleAnswer(index)}
                    disabled={selectedAnswer !== null}
                    className={`h-auto py-4 text-lg transition-all ${
                      showCorrect
                        ? 'bg-green-500 hover:bg-green-600 text-white'
                        : showWrong
                        ? 'bg-red-500 hover:bg-red-600 text-white'
                        : 'bg-white hover:bg-purple-50 text-gray-800 border-2 border-purple-200 hover:border-purple-400'
                    }`}
                  >
                    <div className="flex items-center justify-between w-full">
                      <span>{option}</span>
                      {showCorrect && <Icon name="Check" size={24} className="text-white" />}
                      {showWrong && <Icon name="X" size={24} className="text-white" />}
                    </div>
                  </Button>
                );
              })}
            </div>

            <div className="flex items-center justify-between text-sm text-gray-600 bg-purple-50 p-4 rounded-xl">
              <div className="flex items-center gap-2">
                <Icon name="Star" className="text-yellow-500" size={20} />
                <span className="font-semibold">Счёт: {score}</span>
              </div>
              {isCorrect !== null && (
                <Badge className={isCorrect ? 'bg-green-500 text-white' : 'bg-red-500 text-white'}>
                  {isCorrect ? '+' + (difficulty === 1 ? 10 : difficulty === 2 ? 20 : 30) + ' очков' : 'Неверно'}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default GamePlay;
