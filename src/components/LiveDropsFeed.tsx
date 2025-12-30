import { useState, useEffect } from 'react';
import { supabase } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';
import { Sparkles } from 'lucide-react';

interface LiveDrop {
  id: string;
  user_id: number;
  username: string;
  item_name: string;
  item_rarity: string;
  case_name: string;
  user_photo_url: string | null;
  created_at: string;
}

export default function LiveDropsFeed() {
  const [drops, setDrops] = useState<LiveDrop[]>([]);

  useEffect(() => {
    loadInitialDrops();
    subscribeToDrops();
  }, []);

  const loadInitialDrops = async () => {
    try {
      const { data, error } = await supabase
        .from('live_drops')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(15);

      if (error) {
        console.error('Error loading drops:', error);
        return;
      }

      if (data) {
        setDrops(data);
      }
    } catch (error) {
      console.error('Error loading initial drops:', error);
    }
  };

  const subscribeToDrops = () => {
    const channel = supabase
      .channel('live-drops')
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'live_drops'
        },
        (payload) => {
          const newDrop = payload.new as LiveDrop;
          setDrops((prevDrops) => {
            const updated = [newDrop, ...prevDrops];
            return updated.slice(0, 15);
          });
        }
      )
      .subscribe();

    return () => {
      channel.unsubscribe();
    };
  };

  if (drops.length === 0) {
    return null;
  }

  return (
    <div className="bg-gray-900/50 border border-gray-800 rounded-xl overflow-hidden mb-6">
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 px-4 py-2 flex items-center gap-2">
        <Sparkles size={18} className="text-white animate-pulse" />
        <h3 className="text-white font-bold text-sm md:text-base">Live Drops</h3>
      </div>
      <div className="p-3 max-h-[200px] overflow-y-auto custom-scrollbar">
        <div className="space-y-2">
          {drops.map((drop, index) => {
            const rarityStyle = getRarityStyle(drop.item_rarity);
            return (
              <div
                key={drop.id}
                className={`flex items-center gap-3 p-2 rounded-lg bg-gray-800/50 border ${rarityStyle.border} animate-fade-in`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                <div className="w-8 h-8 rounded-full overflow-hidden bg-gray-700 flex-shrink-0">
                  {drop.user_photo_url ? (
                    <img
                      src={drop.user_photo_url}
                      alt={drop.username}
                      className="w-full h-full object-cover"
                      onError={(e) => {
                        const target = e.target as HTMLImageElement;
                        const firstLetter = drop.username.charAt(0).toUpperCase();
                        target.src = `https://ui-avatars.com/api/?name=${firstLetter}&background=0D8ABC&color=fff&size=64`;
                      }}
                    />
                  ) : (
                    <div className="w-full h-full flex items-center justify-center text-white text-xs font-bold">
                      {drop.username.charAt(0).toUpperCase()}
                    </div>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-white text-xs md:text-sm truncate">
                    <span className="font-semibold">{drop.username}</span>
                    <span className="text-gray-400"> won </span>
                    <span className={`font-semibold ${rarityStyle.text}`}>{drop.item_name}</span>
                  </p>
                  <p className="text-gray-500 text-xs truncate">
                    from {drop.case_name}
                  </p>
                </div>
                <div className={`w-2 h-2 rounded-full ${rarityStyle.bg} animate-pulse flex-shrink-0`}></div>
              </div>
            );
          })}
        </div>
      </div>
      <style>{`
        @keyframes fade-in {
          from { opacity: 0; transform: translateY(-10px); }
          to { opacity: 1; transform: translateY(0); }
        }
        .animate-fade-in {
          animation: fade-in 0.3s ease-out;
        }
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(0, 0, 0, 0.2);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(59, 130, 246, 0.5);
          border-radius: 3px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(59, 130, 246, 0.7);
        }
      `}</style>
    </div>
  );
}
