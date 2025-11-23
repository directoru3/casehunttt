import { X } from 'lucide-react';
import { Item } from '../lib/supabase';
import { getRarityStyle } from '../utils/rarityStyles';
import TonIcon from './TonIcon';

interface ItemActionModalProps {
  item: Item;
  onClose: () => void;
  onSell: () => void;
  onWithdraw: () => void;
}

export default function ItemActionModal({ item, onClose, onSell, onWithdraw }: ItemActionModalProps) {
  const rarityStyle = getRarityStyle(item.rarity);

  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-gradient-to-br from-gray-900 to-black rounded-2xl max-w-md w-full p-6 relative border border-gray-800">
        <button
          onClick={onClose}
          className="absolute top-4 right-4 text-gray-400 hover:text-white transition-colors"
        >
          <X size={24} />
        </button>

        <div className="text-center mb-6">
          <div className={`${rarityStyle.bg} rounded-2xl p-6 border-2 ${rarityStyle.border} ${rarityStyle.shadow} mb-4`}>
            <img
              src={item.image_url}
              alt={item.name}
              className="w-32 h-32 mx-auto object-cover rounded-lg mb-4"
            />
            <h2 className="text-2xl font-bold text-white mb-2">{item.name}</h2>
            <p className={`${rarityStyle.text} text-sm font-semibold capitalize mb-3`}>
              {item.rarity} Rarity
            </p>
            <div className="flex items-center justify-center gap-2 bg-black/30 px-4 py-2 rounded-lg inline-flex">
              <TonIcon className="w-6 h-6" />
              <span className="text-blue-300 text-xl font-bold">{item.price}</span>
            </div>
          </div>
        </div>

        <div className="space-y-3">
          <button
            onClick={onSell}
            className="w-full bg-gradient-to-r from-green-600 to-green-700 hover:from-green-700 hover:to-green-800 text-white font-bold py-4 rounded-lg transition-all flex items-center justify-center gap-2"
          >
            <span>Продать</span>
            <span className="text-green-200">+ {item.price * 0.94}</span>
            <TonIcon className="w-5 h-5" />
          </button>

          <button
            onClick={onWithdraw}
            className="w-full bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-bold py-4 rounded-lg transition-all"
          >
            Вывести
          </button>

          <button
            onClick={onClose}
            className="w-full bg-gray-800 hover:bg-gray-700 text-gray-300 font-bold py-4 rounded-lg transition-all"
          >
            Отмена
          </button>
        </div>
      </div>
    </div>
  );
}
