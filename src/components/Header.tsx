import { Sparkles, User } from 'lucide-react';
import { useEffect, useState } from 'react';
import TonIcon from './TonIcon';
import { telegramAuth } from '../utils/telegramAuth';

interface HeaderProps {
  balance?: number;
}

interface TelegramUser {
  id: number;
  first_name?: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
}

export default function Header({ balance = 0 }: HeaderProps) {
  const [telegramUser, setTelegramUser] = useState<TelegramUser | null>(null);
  const [avatarUrl, setAvatarUrl] = useState<string | null>(null);

  useEffect(() => {
    const updateUserInfo = () => {
      const user = telegramAuth.getCurrentUser();
      console.log('[Header] Current user:', user);

      if (user) {
        setTelegramUser(user);
        const url = telegramAuth.getAvatarUrl();
        console.log('[Header] Avatar URL:', url);
        setAvatarUrl(url);
      }
    };

    updateUserInfo();

    telegramAuth.onPhotoUpdate(updateUserInfo);

    return () => {
      telegramAuth.offPhotoUpdate(updateUserInfo);
    };
  }, []);

  const displayName = telegramUser
    ? telegramAuth.getDisplayName()
    : 'Guest';

  return (
    <header className="bg-black/95 backdrop-blur-md border-b border-gray-800/80 px-3 md:px-4 py-2.5 md:py-3 fixed top-0 left-0 right-0 z-50 shadow-lg shadow-black/50">
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="bg-gradient-to-br from-blue-600 to-cyan-500 p-1.5 md:p-2 rounded-xl shadow-lg shadow-blue-500/30">
            <Sparkles size={18} className="text-white md:w-5 md:h-5" />
          </div>
          <div>
            <h1 className="text-white font-bold text-sm md:text-lg leading-tight">CaseHunt</h1>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {telegramUser && (
            <div className="flex items-center gap-2 bg-gray-800/50 px-2 md:px-3 py-1.5 md:py-2 rounded-xl border border-gray-700">
              {avatarUrl ? (
                <img
                  src={avatarUrl}
                  alt={displayName}
                  className="w-6 h-6 md:w-8 md:h-8 rounded-full border-2 border-blue-500"
                />
              ) : (
                <div className="w-6 h-6 md:w-8 md:h-8 rounded-full bg-gradient-to-br from-blue-600 to-cyan-500 flex items-center justify-center border-2 border-blue-500">
                  <User size={14} className="text-white md:w-4 md:h-4" />
                </div>
              )}
              <span className="text-white font-medium text-xs md:text-sm max-w-[80px] md:max-w-[120px] truncate">
                {displayName}
              </span>
            </div>
          )}

          <div className="flex items-center gap-1.5 md:gap-2 bg-gradient-to-r from-blue-600/20 to-cyan-600/20 px-2.5 md:px-4 py-1.5 md:py-2 rounded-xl border border-blue-500/50 shadow-lg shadow-blue-500/20">
            <TonIcon className="w-4 h-4 md:w-5 md:h-5" />
            <span className="text-white font-bold text-sm md:text-base">{balance.toFixed(2)}</span>
          </div>
        </div>
      </div>
    </header>
  );
}
