import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { TonConnectUIProvider } from '@tonconnect/ui-react';
import App from './App.tsx';
import './index.css';

const manifestUrl = window.location.origin + '/tonconnect-manifest.json';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <TonConnectUIProvider
      manifestUrl={manifestUrl}
      actionsConfiguration={{
        twaReturnUrl: 'https://t.me/nft_gifts_bot'
      }}
    >
      <App />
    </TonConnectUIProvider>
  </StrictMode>
);
