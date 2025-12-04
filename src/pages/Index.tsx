import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import Icon from '@/components/ui/icon';
import GamePlay from '@/components/GamePlay';
import { useToast } from '@/hooks/use-toast';

interface Game {
  id: string;
  title: string;
  category: string;
  difficulty: number;
  icon: string;
  description: string;
  color: string;
}

interface Achievement {
  id: string;
  title: string;
  icon: string;
  unlocked: boolean;
}

interface UserProfile {
  id: string;
  name: string;
  level: number;
  points: number;
  progress: number;
  gamesPlayed: number;
  totalTime: number;
  achievements: string[];
  subjectProgress: Record<string, number>;
}

const Index = () => {
  const [activeTab, setActiveTab] = useState('games');
  const [userProfile, setUserProfile] = useState<UserProfile | null>(null);
  const [userName, setUserName] = useState('');
  const [showNameDialog, setShowNameDialog] = useState(false);
  const [activeGame, setActiveGame] = useState<Game | null>(null);
  const [allUsers, setAllUsers] = useState<UserProfile[]>([]);
  const { toast } = useToast();

  useEffect(() => {
    const userId = localStorage.getItem('school_userId');
    if (!userId) {
      const newUserId = `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
      localStorage.setItem('school_userId', newUserId);
      setShowNameDialog(true);
    } else {
      loadUserProfile(userId);
    }
    loadAllUsers();
  }, []);

  const loadUserProfile = (userId: string) => {
    const savedProfile = localStorage.getItem(`school_profile_${userId}`);
    if (savedProfile) {
      setUserProfile(JSON.parse(savedProfile));
    } else {
      setShowNameDialog(true);
    }
  };

  const loadAllUsers = () => {
    const users: UserProfile[] = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key?.startsWith('school_profile_')) {
        const profile = JSON.parse(localStorage.getItem(key)!);
        users.push(profile);
      }
    }
    setAllUsers(users.sort((a, b) => b.points - a.points));
  };

  const createUserProfile = () => {
    if (!userName.trim()) {
      toast({
        title: 'Ошибка',
        description: 'Введи своё имя!',
        variant: 'destructive'
      });
      return;
    }

    const userId = localStorage.getItem('school_userId')!;
    const newProfile: UserProfile = {
      id: userId,
      name: userName.trim(),
      level: 1,
      points: 0,
      progress: 0,
      gamesPlayed: 0,
      totalTime: 0,
      achievements: [],
      subjectProgress: {
        'Математика': 0,
        'Русский язык': 0,
        'Английский': 0,
        'География': 0,
        'Логика': 0,
        'История': 0
      }
    };

    localStorage.setItem(`school_profile_${userId}`, JSON.stringify(newProfile));
    setUserProfile(newProfile);
    setShowNameDialog(false);
    loadAllUsers();

    toast({
      title: '🎉 Добро пожаловать!',
      description: `Привет, ${userName}! Начни играть и зарабатывай очки!`
    });
  };

  const saveUserProfile = (updatedProfile: UserProfile) => {
    localStorage.setItem(`school_profile_${updatedProfile.id}`, JSON.stringify(updatedProfile));
    setUserProfile(updatedProfile);
    loadAllUsers();
  };

  const updateProgress = (points: number, category: string) => {
    if (!userProfile) return;

    const newPoints = userProfile.points + points;
    const pointsForNextLevel = userProfile.level * 500;
    const newProgress = ((newPoints % pointsForNextLevel) / pointsForNextLevel) * 100;
    let newLevel = userProfile.level;

    if (newPoints >= pointsForNextLevel) {
      newLevel = Math.floor(newPoints / 500) + 1;
      toast({
        title: '🎉 Новый уровень!',
        description: `Поздравляем! Ты достиг уровня ${newLevel}!`
      });
    }

    const categoryProgress = userProfile.subjectProgress[category] || 0;
    const newCategoryProgress = Math.min(100, categoryProgress + (points / 10));

    const updatedProfile: UserProfile = {
      ...userProfile,
      points: newPoints,
      level: newLevel,
      progress: newProgress,
      gamesPlayed: userProfile.gamesPlayed + 1,
      totalTime: userProfile.totalTime + 5,
      subjectProgress: {
        ...userProfile.subjectProgress,
        [category]: newCategoryProgress
      }
    };

    saveUserProfile(updatedProfile);
  };

  if (showNameDialog) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50 flex items-center justify-center p-4">
        <Card className="max-w-md w-full animate-scale-in shadow-2xl">
          <CardHeader className="bg-gradient-to-r from-purple-500 to-pink-600 text-white text-center">
            <div className="text-6xl mb-4">👋</div>
            <CardTitle className="text-3xl">Добро пожаловать!</CardTitle>
            <CardDescription className="text-purple-50">Введи своё имя, чтобы начать</CardDescription>
          </CardHeader>
          <CardContent className="p-6 space-y-4">
            <div>
              <label className="text-sm font-medium text-gray-700 mb-2 block">Как тебя зовут?</label>
              <input
                type="text"
                value={userName}
                onChange={(e) => setUserName(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && createUserProfile()}
                placeholder="Например: Аня или Максим"
                className="w-full px-4 py-3 rounded-xl border-2 border-purple-200 focus:border-purple-500 focus:outline-none text-lg"
                autoFocus
              />
            </div>
            <Button
              onClick={createUserProfile}
              className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white text-lg py-6"
            >
              <Icon name="Sparkles" className="mr-2" size={20} />
              Начать играть!
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (!userProfile) return null;

  const games: Game[] = [
    {
      id: '1',
      title: 'Таблица умножения',
      category: 'Математика',
      difficulty: 1,
      icon: '🔢',
      description: 'Тренируй устный счёт',
      color: 'from-purple-500 to-purple-700'
    },
    {
      id: '2',
      title: 'Словарные слова',
      category: 'Русский язык',
      difficulty: 2,
      icon: '📝',
      description: 'Запоминай правописание',
      color: 'from-orange-500 to-orange-700'
    },
    {
      id: '3',
      title: 'English Words',
      category: 'Английский',
      difficulty: 1,
      icon: '🇬🇧',
      description: 'Пополни словарный запас',
      color: 'from-blue-500 to-blue-700'
    },
    {
      id: '4',
      title: 'Столицы мира',
      category: 'География',
      difficulty: 3,
      icon: '🌍',
      description: 'Изучай страны и города',
      color: 'from-green-500 to-green-700'
    },
    {
      id: '5',
      title: 'Логические цепочки',
      category: 'Логика',
      difficulty: 2,
      icon: '🧩',
      description: 'Развивай мышление',
      color: 'from-pink-500 to-pink-700'
    },
    {
      id: '6',
      title: 'Дроби и проценты',
      category: 'Математика',
      difficulty: 3,
      icon: '➗',
      description: 'Реши сложные задачи',
      color: 'from-indigo-500 to-indigo-700'
    },
    {
      id: '7',
      title: 'Части речи',
      category: 'Русский язык',
      difficulty: 2,
      icon: '📚',
      description: 'Определяй и различай',
      color: 'from-yellow-500 to-yellow-700'
    },
    {
      id: '8',
      title: 'Grammar Quest',
      category: 'Английский',
      difficulty: 2,
      icon: '✍️',
      description: 'Практикуй грамматику',
      color: 'from-cyan-500 to-cyan-700'
    },
    {
      id: '9',
      title: 'Исторические даты',
      category: 'История',
      difficulty: 3,
      icon: '📜',
      description: 'Запоминай события',
      color: 'from-red-500 to-red-700'
    },
    {
      id: '10',
      title: 'Геометрические фигуры',
      category: 'Математика',
      difficulty: 1,
      icon: '🔺',
      description: 'Изучай свойства фигур',
      color: 'from-teal-500 to-teal-700'
    },
    {
      id: '11',
      title: 'Синонимы и антонимы',
      category: 'Русский язык',
      difficulty: 2,
      icon: '🔄',
      description: 'Расширяй лексикон',
      color: 'from-lime-500 to-lime-700'
    },
    {
      id: '12',
      title: 'Irregular Verbs',
      category: 'Английский',
      difficulty: 3,
      icon: '⚡',
      description: 'Выучи неправильные глаголы',
      color: 'from-violet-500 to-violet-700'
    }
  ];

  const achievements: Achievement[] = [
    { id: '1', title: 'Первые шаги', icon: '👣', unlocked: true },
    { id: '2', title: 'Знаток математики', icon: '🎓', unlocked: true },
    { id: '3', title: 'Полиглот', icon: '🗣️', unlocked: false },
    { id: '4', title: 'Логик', icon: '🧠', unlocked: true },
    { id: '5', title: 'Мастер', icon: '👑', unlocked: false },
    { id: '6', title: 'Чемпион', icon: '🏆', unlocked: false }
  ];

  const leaderboard = allUsers
    .map((user, index) => ({
      rank: index + 1,
      name: user.id === userProfile.id ? `${user.name} (Ты)` : user.name,
      points: user.points,
      level: user.level,
      isCurrentUser: user.id === userProfile.id
    }))
    .slice(0, 10);

  const categories = ['Все', 'Математика', 'Русский язык', 'Английский', 'География', 'Логика', 'История'];
  const [selectedCategory, setSelectedCategory] = useState('Все');

  const filteredGames = selectedCategory === 'Все' 
    ? games 
    : games.filter(game => game.category === selectedCategory);

  const getDifficultyLabel = (level: number) => {
    if (level === 1) return { text: 'Легко', color: 'bg-green-500' };
    if (level === 2) return { text: 'Средне', color: 'bg-yellow-500' };
    return { text: 'Сложно', color: 'bg-red-500' };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 via-blue-50 to-pink-50">
      <header className="bg-white/80 backdrop-blur-md border-b border-purple-100 sticky top-0 z-50">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 animate-fade-in">
              <div className="text-4xl">🎮</div>
              <div>
                <h1 className="text-2xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent">
                  Умная Перемена
                </h1>
                <p className="text-sm text-gray-600">Учись играя!</p>
              </div>
            </div>
            
            <div className="flex items-center gap-4">
              <div className="hidden md:flex items-center gap-2 bg-gradient-to-r from-purple-100 to-pink-100 px-4 py-2 rounded-full">
                <Icon name="Trophy" className="text-yellow-600" size={20} />
                <span className="font-semibold text-purple-700">{userProfile.points} очков</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-blue-100 to-cyan-100 px-4 py-2 rounded-full">
                <Icon name="Star" className="text-blue-600" size={20} />
                <span className="font-semibold text-blue-700">Уровень {userProfile.level}</span>
              </div>
              <div className="flex items-center gap-2 bg-gradient-to-r from-green-100 to-emerald-100 px-3 py-2 rounded-full">
                <span className="font-semibold text-green-700">{userProfile.name}</span>
              </div>
            </div>
          </div>
        </div>
      </header>

      <main className="container mx-auto px-4 py-8">
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full grid-cols-2 md:grid-cols-5 gap-2 bg-white/80 p-2 rounded-2xl shadow-lg">
            <TabsTrigger value="games" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-purple-500 data-[state=active]:to-purple-700 data-[state=active]:text-white rounded-xl transition-all">
              <Icon name="Gamepad2" className="mr-2" size={18} />
              Игры
            </TabsTrigger>
            <TabsTrigger value="achievements" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-orange-500 data-[state=active]:to-orange-700 data-[state=active]:text-white rounded-xl transition-all">
              <Icon name="Award" className="mr-2" size={18} />
              Достижения
            </TabsTrigger>
            <TabsTrigger value="leaderboard" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-blue-500 data-[state=active]:to-blue-700 data-[state=active]:text-white rounded-xl transition-all">
              <Icon name="BarChart3" className="mr-2" size={18} />
              Рейтинг
            </TabsTrigger>
            <TabsTrigger value="progress" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-green-500 data-[state=active]:to-green-700 data-[state=active]:text-white rounded-xl transition-all">
              <Icon name="TrendingUp" className="mr-2" size={18} />
              Прогресс
            </TabsTrigger>
            <TabsTrigger value="about" className="data-[state=active]:bg-gradient-to-r data-[state=active]:from-pink-500 data-[state=active]:to-pink-700 data-[state=active]:text-white rounded-xl transition-all">
              <Icon name="Info" className="mr-2" size={18} />
              О сайте
            </TabsTrigger>
          </TabsList>

          <TabsContent value="games" className="space-y-6 animate-fade-in">
            <div className="flex flex-wrap gap-2">
              {categories.map((cat) => (
                <Button
                  key={cat}
                  variant={selectedCategory === cat ? "default" : "outline"}
                  onClick={() => setSelectedCategory(cat)}
                  className={`rounded-full transition-all ${
                    selectedCategory === cat 
                      ? 'bg-gradient-to-r from-purple-500 to-purple-700 text-white shadow-lg scale-105' 
                      : 'hover:scale-105'
                  }`}
                >
                  {cat}
                </Button>
              ))}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredGames.map((game, index) => {
                const difficulty = getDifficultyLabel(game.difficulty);
                return (
                  <Card 
                    key={game.id} 
                    className="group hover:shadow-2xl transition-all duration-300 hover:-translate-y-2 cursor-pointer border-2 border-transparent hover:border-purple-300 animate-slide-up overflow-hidden"
                    style={{ animationDelay: `${index * 0.1}s` }}
                  >
                    <div className={`h-2 bg-gradient-to-r ${game.color}`} />
                    <CardHeader>
                      <div className="flex items-start justify-between">
                        <div className="text-5xl mb-2 group-hover:scale-110 transition-transform">{game.icon}</div>
                        <Badge className={`${difficulty.color} text-white`}>{difficulty.text}</Badge>
                      </div>
                      <CardTitle className="group-hover:text-purple-600 transition-colors">{game.title}</CardTitle>
                      <CardDescription className="flex items-center gap-2">
                        <Icon name="BookOpen" size={16} />
                        {game.category}
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-600 mb-4">{game.description}</p>
                      <Button 
                        onClick={() => setActiveGame(game)}
                        className="w-full bg-gradient-to-r from-purple-500 to-purple-700 hover:from-purple-600 hover:to-purple-800 text-white shadow-lg"
                      >
                        <Icon name="Play" className="mr-2" size={18} />
                        Начать игру
                      </Button>
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </TabsContent>

          <TabsContent value="achievements" className="animate-fade-in">
            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-r from-yellow-400 to-orange-500 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Trophy" size={28} />
                  Твои достижения
                </CardTitle>
                <CardDescription className="text-yellow-50">Собери все награды!</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="grid grid-cols-2 md:grid-cols-3 gap-6">
                  {achievements.map((achievement, index) => (
                    <div
                      key={achievement.id}
                      className={`text-center p-6 rounded-2xl transition-all duration-300 animate-scale-in ${
                        achievement.unlocked
                          ? 'bg-gradient-to-br from-yellow-100 to-orange-100 shadow-lg hover:scale-105 cursor-pointer'
                          : 'bg-gray-100 opacity-50 grayscale'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="text-6xl mb-3">{achievement.icon}</div>
                      <p className="font-semibold text-gray-800">{achievement.title}</p>
                      {achievement.unlocked && (
                        <Badge className="mt-2 bg-green-500 text-white">Получено!</Badge>
                      )}
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="leaderboard" className="animate-fade-in">
            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-r from-blue-500 to-cyan-600 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Medal" size={28} />
                  Таблица лидеров
                </CardTitle>
                <CardDescription className="text-blue-50">Топ учеников недели</CardDescription>
              </CardHeader>
              <CardContent className="p-6">
                <div className="space-y-4">
                  {leaderboard.map((player, index) => (
                    <div
                      key={player.rank}
                      className={`flex items-center justify-between p-4 rounded-xl transition-all hover:scale-102 animate-slide-up ${
                        player.isCurrentUser
                          ? 'bg-gradient-to-r from-purple-100 to-pink-100 border-2 border-purple-400 shadow-lg'
                          : 'bg-white border-2 border-gray-100 hover:border-blue-300'
                      }`}
                      style={{ animationDelay: `${index * 0.1}s` }}
                    >
                      <div className="flex items-center gap-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center font-bold text-xl ${
                          player.rank === 1 ? 'bg-gradient-to-br from-yellow-400 to-yellow-600 text-white' :
                          player.rank === 2 ? 'bg-gradient-to-br from-gray-300 to-gray-500 text-white' :
                          player.rank === 3 ? 'bg-gradient-to-br from-orange-400 to-orange-600 text-white' :
                          'bg-gradient-to-br from-blue-100 to-blue-200 text-blue-700'
                        }`}>
                          {player.rank === 1 ? '🥇' : player.rank === 2 ? '🥈' : player.rank === 3 ? '🥉' : player.rank}
                        </div>
                        <div>
                          <p className="font-semibold text-lg">{player.name}</p>
                          <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Icon name="Star" size={14} className="text-yellow-500" />
                            Уровень {player.level}
                          </p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-xl text-purple-600">{player.points}</p>
                        <p className="text-sm text-gray-500">очков</p>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="progress" className="animate-fade-in">
            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-r from-green-500 to-emerald-600 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Target" size={28} />
                  Твой прогресс
                </CardTitle>
                <CardDescription className="text-green-50">Отслеживай свои успехи</CardDescription>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="bg-gradient-to-r from-purple-100 to-pink-100 p-6 rounded-2xl">
                  <div className="flex items-center justify-between mb-3">
                    <span className="font-semibold text-lg">До следующего уровня</span>
                    <span className="text-2xl font-bold text-purple-600">{Math.round(userProfile.progress)}%</span>
                  </div>
                  <Progress value={userProfile.progress} className="h-4" />
                  <p className="text-sm text-gray-600 mt-2">Ещё {(userProfile.level * 500) - userProfile.points} очков до уровня {userProfile.level + 1}!</p>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="bg-gradient-to-br from-blue-100 to-blue-200 p-6 rounded-2xl text-center animate-bounce-in">
                    <Icon name="Flame" className="mx-auto text-orange-500 mb-2" size={36} />
                    <p className="text-3xl font-bold text-blue-700">{Math.floor(userProfile.gamesPlayed / 3) || 1}</p>
                    <p className="text-sm text-gray-700">дней подряд</p>
                  </div>
                  <div className="bg-gradient-to-br from-green-100 to-green-200 p-6 rounded-2xl text-center animate-bounce-in" style={{ animationDelay: '0.1s' }}>
                    <Icon name="CheckCircle2" className="mx-auto text-green-600 mb-2" size={36} />
                    <p className="text-3xl font-bold text-green-700">{userProfile.gamesPlayed}</p>
                    <p className="text-sm text-gray-700">игры пройдено</p>
                  </div>
                  <div className="bg-gradient-to-br from-purple-100 to-purple-200 p-6 rounded-2xl text-center animate-bounce-in" style={{ animationDelay: '0.2s' }}>
                    <Icon name="Clock" className="mx-auto text-purple-600 mb-2" size={36} />
                    <p className="text-3xl font-bold text-purple-700">{Math.floor(userProfile.totalTime / 60)}ч</p>
                    <p className="text-sm text-gray-700">время обучения</p>
                  </div>
                </div>

                <div className="space-y-3">
                  <h3 className="font-semibold text-lg mb-4">Прогресс по предметам</h3>
                  {Object.entries(userProfile.subjectProgress).map(([subject, progress], index) => (
                    <div key={subject} className="animate-slide-up" style={{ animationDelay: `${index * 0.1}s` }}>
                      <div className="flex justify-between mb-2">
                        <span className="font-medium">{subject}</span>
                        <span className="text-sm text-gray-600">{Math.round(progress)}%</span>
                      </div>
                      <Progress value={progress} className="h-3" />
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="about" className="animate-fade-in">
            <Card className="shadow-xl border-2">
              <CardHeader className="bg-gradient-to-r from-pink-500 to-rose-600 text-white">
                <CardTitle className="flex items-center gap-2 text-2xl">
                  <Icon name="Sparkles" size={28} />
                  О проекте «Умная Перемена»
                </CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-6">
                <div className="prose max-w-none">
                  <p className="text-lg text-gray-700 leading-relaxed">
                    <strong>«Умная Перемена»</strong> — это образовательная платформа, которая превращает обучение в увлекательное приключение! 
                    Здесь дети могут развивать свои знания по разным предметам, играя в интересные игры.
                  </p>

                  <div className="grid md:grid-cols-2 gap-6 my-8">
                    <div className="bg-gradient-to-br from-purple-50 to-purple-100 p-6 rounded-2xl">
                      <div className="text-4xl mb-3">🎯</div>
                      <h3 className="font-bold text-lg mb-2 text-purple-800">Для учеников</h3>
                      <p className="text-gray-700">Учись в своём темпе, получай награды за успехи, соревнуйся с друзьями и открывай новые уровни сложности!</p>
                    </div>
                    <div className="bg-gradient-to-br from-blue-50 to-blue-100 p-6 rounded-2xl">
                      <div className="text-4xl mb-3">👨‍🏫</div>
                      <h3 className="font-bold text-lg mb-2 text-blue-800">Для учителей</h3>
                      <p className="text-gray-700">Отслеживайте прогресс учеников, мотивируйте их через систему достижений и делайте обучение интересным!</p>
                    </div>
                    <div className="bg-gradient-to-br from-green-50 to-green-100 p-6 rounded-2xl">
                      <div className="text-4xl mb-3">👪</div>
                      <h3 className="font-bold text-lg mb-2 text-green-800">Для родителей</h3>
                      <p className="text-gray-700">Следите за успехами ребёнка, помогайте ему развиваться и радуйтесь его достижениям вместе!</p>
                    </div>
                    <div className="bg-gradient-to-br from-orange-50 to-orange-100 p-6 rounded-2xl">
                      <div className="text-4xl mb-3">🎮</div>
                      <h3 className="font-bold text-lg mb-2 text-orange-800">Геймификация</h3>
                      <p className="text-gray-700">Система уровней, рейтингов и достижений делает обучение таким же захватывающим, как любимые игры!</p>
                    </div>
                  </div>

                  <div className="bg-gradient-to-r from-yellow-100 to-orange-100 p-6 rounded-2xl border-2 border-yellow-300">
                    <h3 className="font-bold text-xl mb-3 flex items-center gap-2">
                      <Icon name="Lightbulb" className="text-yellow-600" size={24} />
                      Преимущества платформы
                    </h3>
                    <ul className="space-y-2 text-gray-700">
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="text-green-600 mt-1 flex-shrink-0" size={20} />
                        <span>12+ образовательных игр по основным школьным предметам</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="text-green-600 mt-1 flex-shrink-0" size={20} />
                        <span>Система прогрессии с 3 уровнями сложности для постепенного развития</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="text-green-600 mt-1 flex-shrink-0" size={20} />
                        <span>Таблица лидеров для здоровой конкуренции между учениками</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="text-green-600 mt-1 flex-shrink-0" size={20} />
                        <span>Система достижений и наград за успехи в обучении</span>
                      </li>
                      <li className="flex items-start gap-2">
                        <Icon name="Check" className="text-green-600 mt-1 flex-shrink-0" size={20} />
                        <span>Яркий дизайн и анимации, которые нравятся детям</span>
                      </li>
                    </ul>
                  </div>
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>

      <footer className="mt-12 bg-white/80 backdrop-blur-md border-t border-purple-100 py-6">
        <div className="container mx-auto px-4 text-center text-gray-600">
          <p className="text-sm">© 2024 Умная Перемена — Учись играя! 🚀</p>
        </div>
      </footer>

      {activeGame && (
        <GamePlay
          gameId={activeGame.id}
          gameTitle={activeGame.title}
          gameIcon={activeGame.icon}
          difficulty={activeGame.difficulty}
          onClose={() => setActiveGame(null)}
          onComplete={(points) => {
            updateProgress(points, activeGame.category);
            toast({
              title: "Отлично!",
              description: `+${points} очков! Так держать!`,
            });
            setActiveGame(null);
          }}
        />
      )}
    </div>
  );
};

export default Index;