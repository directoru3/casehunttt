import { useEffect, useState } from 'react';
import { Trophy, Medal, Award, TrendingUp, Star, Crown } from 'lucide-react';
import { supabase } from '../lib/supabase';
import { telegramAuth } from '../utils/telegramAuth';

interface PlayerStats {
  user_id: string;
  total_points: number;
  cases_opened: number;
  total_spent: string;
  total_won: string;
  rank_level: number;
  best_item_value: string;
  users?: {
    first_name: string;
    username?: string;
    photo_url?: string;
  };
}

interface Season {
  id: string;
  season_number: number;
  start_date: string;
  end_date: string;
  status: string;
  total_prize_pool: number;
}

const RANK_ICONS = ['🥚', '🐣', '🐓', '🦅', '🐉', '👑'];
const RANK_NAMES = [
  'Новичок',
  'Ученик',
  'Игрок',
  'Охотник за удачей',
  'Повелитель кейсов',
  'Король краша'
];

const RANK_RANGES = [
  { min: 0, max: 100 },
  { min: 101, max: 500 },
  { min: 501, max: 2000 },
  { min: 2001, max: 5000 },
  { min: 5001, max: 15000 },
  { min: 15001, max: Infinity }
];

export default function RatingPage() {
  const [topPlayers, setTopPlayers] = useState<PlayerStats[]>([]);
  const [currentSeason, setCurrentSeason] = useState<Season | null>(null);
  const [loading, setLoading] = useState(true);
  const [userPosition, setUserPosition] = useState<number | null>(null);
  const [userStats, setUserStats] = useState<PlayerStats | null>(null);

  useEffect(() => {
    loadRatings();
  }, []);

  const loadRatings = async () => {
    setLoading(true);
    try {
      const { data: season } = await supabase
        .from('seasons')
        .select('*')
        .eq('status', 'active')
        .maybeSingle();

      if (!season) {
        console.log('No active season');
        setLoading(false);
        return;
      }

      setCurrentSeason(season);

      const { data: players } = await supabase
        .from('player_stats')
        .select(`
          user_id,
          total_points,
          cases_opened,
          total_spent,
          total_won,
          rank_level,
          best_item_value,
          users:user_id(first_name, username, photo_url)
        `)
        .eq('season_id', season.id)
        .order('total_points', { ascending: false })
        .limit(100);

      if (players) {
        setTopPlayers(players);

        const currentUser = telegramAuth.getCurrentUser();
        if (currentUser) {
          const userIndex = players.findIndex(p => p.user_id === currentUser.id.toString());
          if (userIndex !== -1) {
            setUserPosition(userIndex + 1);
            setUserStats(players[userIndex]);
          }
        }
      }
    } catch (error) {
      console.error('Error loading ratings:', error);
    } finally {
      setLoading(false);
    }
  };

  const getDaysLeft = () => {
    if (!currentSeason) return 0;
    const end = new Date(currentSeason.end_date);
    const now = new Date();
    const diff = end.getTime() - now.getTime();
    return Math.max(0, Math.ceil(diff / (1000 * 60 * 60 * 24)));
  };

  const getMedalForPosition = (position: number) => {
    if (position === 1) return <Crown className="w-6 h-6 text-yellow-400 fill-yellow-400" />;
    if (position === 2) return <Medal className="w-6 h-6 text-gray-400 fill-gray-400" />;
    if (position === 3) return <Medal className="w-6 h-6 text-amber-600 fill-amber-600" />;
    return null;
  };

  const getPositionGradient = (position: number) => {
    if (position === 1) return 'from-yellow-500/20 to-orange-500/20 border-yellow-500/50';
    if (position === 2) return 'from-gray-400/20 to-gray-600/20 border-gray-400/50';
    if (position === 3) return 'from-amber-600/20 to-amber-800/20 border-amber-600/50';
    return 'from-gray-800/50 to-gray-900/50 border-gray-700/50';
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-block w-12 h-12 border-4 border-blue-500/30 border-t-blue-500 rounded-full animate-spin"></div>
          <p className="text-gray-400 mt-4">Загрузка рейтинга...</p>
        </div>
      </div>
    );
  }

  if (!currentSeason) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-24 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <Trophy className="w-20 h-20 text-gray-600 mx-auto mb-4" />
          <h2 className="text-2xl font-bold text-white mb-2">Нет активного сезона</h2>
          <p className="text-gray-400">Сезон скоро начнется!</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-black to-gray-900 pt-20 pb-24 px-4">
      <div className="max-w-4xl mx-auto">
        <div className="bg-gradient-to-r from-yellow-600/20 to-orange-600/20 rounded-2xl p-6 mb-6 border-2 border-yellow-500/30 backdrop-blur-sm">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-3">
              <Trophy className="w-10 h-10 text-yellow-500" />
              <div>
                <h1 className="text-2xl font-bold text-white">Сезон #{currentSeason.season_number}</h1>
                <p className="text-gray-300 text-sm">Призовой фонд: {currentSeason.total_prize_pool} TON</p>
              </div>
            </div>
            <div className="text-right">
              <div className="text-3xl font-bold text-yellow-400">{getDaysLeft()}</div>
              <div className="text-gray-300 text-sm">дней осталось</div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 mt-4 pt-4 border-t border-yellow-500/30">
            <div className="text-center">
              <div className="text-2xl font-bold text-yellow-400">500</div>
              <div className="text-gray-300 text-xs">1 место</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-gray-400">300</div>
              <div className="text-gray-300 text-xs">2 место</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-amber-600">150</div>
              <div className="text-gray-300 text-xs">3 место</div>
            </div>
          </div>
        </div>

        {userPosition && userStats && (
          <div className="bg-gradient-to-r from-blue-600/20 to-cyan-600/20 rounded-2xl p-4 mb-6 border-2 border-blue-500/50">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="bg-blue-500/20 rounded-full w-12 h-12 flex items-center justify-center">
                  <span className="text-2xl">{RANK_ICONS[Math.min(userStats.rank_level - 1, 5)]}</span>
                </div>
                <div>
                  <div className="text-white font-bold">Ваша позиция: #{userPosition}</div>
                  <div className="text-gray-300 text-sm">{RANK_NAMES[Math.min(userStats.rank_level - 1, 5)]}</div>
                </div>
              </div>
              <div className="text-right">
                <div className="text-2xl font-bold text-blue-400">{userStats.total_points}</div>
                <div className="text-gray-300 text-xs">очков</div>
              </div>
            </div>
          </div>
        )}

        <div className="bg-gray-900/50 backdrop-blur-sm rounded-2xl border border-gray-800 overflow-hidden">
          <div className="bg-gradient-to-r from-blue-600 to-cyan-600 p-4">
            <h2 className="text-xl font-bold text-white flex items-center gap-2">
              <Award className="w-6 h-6" />
              Топ-100 игроков
            </h2>
          </div>

          <div className="divide-y divide-gray-800">
            {topPlayers.length === 0 ? (
              <div className="p-8 text-center text-gray-400">
                Пока нет участников
              </div>
            ) : (
              topPlayers.map((player, index) => {
                const position = index + 1;
                const userData = Array.isArray(player.users) ? player.users[0] : player.users;
                const rankLevel = Math.min(player.rank_level - 1, 5);

                return (
                  <div
                    key={player.user_id}
                    className={`p-4 bg-gradient-to-r ${getPositionGradient(position)} border-l-4 transition-all hover:bg-gray-800/50`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-4 flex-1">
                        <div className="flex items-center gap-2 min-w-[60px]">
                          {position <= 3 ? (
                            <div className="flex items-center gap-2">
                              {getMedalForPosition(position)}
                              <span className="text-xl font-bold text-white">{position}</span>
                            </div>
                          ) : (
                            <span className="text-lg font-semibold text-gray-400 ml-2">#{position}</span>
                          )}
                        </div>

                        <div className="bg-gray-800 rounded-full w-12 h-12 flex items-center justify-center overflow-hidden">
                          {userData?.photo_url ? (
                            <img src={userData.photo_url} alt="" className="w-full h-full object-cover" />
                          ) : (
                            <span className="text-2xl">{RANK_ICONS[rankLevel]}</span>
                          )}
                        </div>

                        <div className="flex-1 min-w-0">
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-white truncate">
                              {userData?.first_name || 'Unknown'}
                            </span>
                            {position <= 10 && (
                              <Star className="w-4 h-4 text-yellow-400 fill-yellow-400 flex-shrink-0" />
                            )}
                          </div>
                          <div className="text-sm text-gray-400 flex items-center gap-2">
                            <span>{RANK_ICONS[rankLevel]}</span>
                            <span>{RANK_NAMES[rankLevel]}</span>
                          </div>
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end">
                          <TrendingUp className="w-4 h-4 text-blue-400" />
                          <span className="text-xl font-bold text-white">{player.total_points}</span>
                        </div>
                        <div className="text-xs text-gray-400">
                          {player.cases_opened} кейсов
                        </div>
                      </div>
                    </div>

                    {position <= 3 && (
                      <div className="mt-3 pt-3 border-t border-gray-700/50 grid grid-cols-3 gap-2 text-xs">
                        <div>
                          <span className="text-gray-400">Потрачено:</span>
                          <div className="text-white font-semibold">{parseFloat(player.total_spent).toFixed(1)} TON</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Выиграно:</span>
                          <div className="text-white font-semibold">{parseFloat(player.total_won).toFixed(1)} TON</div>
                        </div>
                        <div>
                          <span className="text-gray-400">Лучший дроп:</span>
                          <div className="text-white font-semibold">{parseFloat(player.best_item_value).toFixed(1)} TON</div>
                        </div>
                      </div>
                    )}
                  </div>
                );
              })
            )}
          </div>
        </div>

        <div className="mt-6 bg-gradient-to-br from-gray-800/50 to-gray-900/50 rounded-xl p-6 border border-gray-700">
          <h3 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
            <Star className="w-5 h-5 text-yellow-400" />
            Система рангов
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
            {RANK_NAMES.map((name, index) => (
              <div key={index} className="bg-gray-800/50 rounded-lg p-3 border border-gray-700">
                <div className="text-2xl mb-1">{RANK_ICONS[index]}</div>
                <div className="text-white font-semibold text-sm">{name}</div>
                <div className="text-gray-400 text-xs">
                  {RANK_RANGES[index].min}-{RANK_RANGES[index].max === Infinity ? '∞' : RANK_RANGES[index].max}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
