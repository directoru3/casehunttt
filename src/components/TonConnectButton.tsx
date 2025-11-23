import { useTonConnectUI, useTonAddress } from '@tonconnect/ui-react';
import { Wallet } from 'lucide-react';

export default function TonConnectButton() {
  const [tonConnectUI] = useTonConnectUI();
  const userFriendlyAddress = useTonAddress();

  const handleConnect = () => {
    tonConnectUI.openModal();
  };

  const handleDisconnect = () => {
    tonConnectUI.disconnect();
  };

  return (
    <div>
      {userFriendlyAddress ? (
        <button
          onClick={handleDisconnect}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all font-semibold"
        >
          <Wallet size={18} />
          <span>{userFriendlyAddress.slice(0, 4)}...{userFriendlyAddress.slice(-4)}</span>
        </button>
      ) : (
        <button
          onClick={handleConnect}
          className="flex items-center gap-2 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white px-4 py-2 rounded-lg transition-all font-semibold"
        >
          <Wallet size={18} />
          <span>Подключить кошелек</span>
        </button>
      )}
    </div>
  );
}
