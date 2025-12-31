import { useTonConnectUI } from '@tonconnect/ui-react';

export interface TonPaymentResult {
  success: boolean;
  txHash?: string;
  newBalance?: number;
  error?: string;
}

const RECEIVER_ADDRESS = 'UQCt2VhG9AJhKkMJl8WUNawLCJlPMmjLXWWXnvGVhGqhqV7P';
const TON_TO_COINS_RATE = 10;

function stringToBase64(str: string): string {
  return btoa(unescape(encodeURIComponent(str)));
}

export class TonPaymentService {
  private static instance: TonPaymentService;
  private tonConnectUI: any = null;

  private constructor() {}

  public static getInstance(): TonPaymentService {
    if (!TonPaymentService.instance) {
      TonPaymentService.instance = new TonPaymentService();
    }
    return TonPaymentService.instance;
  }

  public setTonConnectUI(ui: any) {
    this.tonConnectUI = ui;
  }

  public isAvailable(): boolean {
    return this.tonConnectUI !== null;
  }

  public isWalletConnected(): boolean {
    return this.tonConnectUI?.connected || false;
  }

  public async connectWallet(): Promise<boolean> {
    if (!this.isAvailable()) {
      console.error('[TonPayments] TonConnect UI not available');
      return false;
    }

    try {
      if (this.isWalletConnected()) {
        return true;
      }

      await this.tonConnectUI.openModal();

      return new Promise((resolve) => {
        const checkConnection = setInterval(() => {
          if (this.isWalletConnected()) {
            clearInterval(checkConnection);
            resolve(true);
          }
        }, 500);

        setTimeout(() => {
          clearInterval(checkConnection);
          resolve(false);
        }, 30000);
      });
    } catch (error) {
      console.error('[TonPayments] Error connecting wallet:', error);
      return false;
    }
  }

  public calculateCoins(tonAmount: number): number {
    return Math.round(tonAmount * TON_TO_COINS_RATE * 100) / 100;
  }

  public async sendPayment(tonAmount: number, userId: string): Promise<TonPaymentResult> {
    try {
      console.log('[TonPayments] Initiating payment:', tonAmount, 'TON');

      if (!this.isAvailable()) {
        throw new Error('TonConnect UI not available');
      }

      if (!this.isWalletConnected()) {
        const connected = await this.connectWallet();
        if (!connected) {
          throw new Error('Wallet connection failed');
        }
      }

      const nanoAmount = Math.floor(tonAmount * 1000000000);
      const payload = `deposit_${userId}_${Date.now()}`;
      const payloadBase64 = stringToBase64(payload);

      const transaction = {
        validUntil: Math.floor(Date.now() / 1000) + 600,
        messages: [
          {
            address: RECEIVER_ADDRESS,
            amount: nanoAmount.toString(),
            payload: payloadBase64,
          },
        ],
      };

      console.log('[TonPayments] Sending transaction:', transaction);

      const result = await this.tonConnectUI.sendTransaction(transaction);

      if (!result || !result.boc) {
        throw new Error('Transaction failed');
      }

      console.log('[TonPayments] Transaction sent:', result);

      await this.verifyTonPayment(userId, tonAmount, result.boc);

      const coinsReceived = this.calculateCoins(tonAmount);

      const verifyResponse = await fetch(
        `${import.meta.env.VITE_SUPABASE_URL}/functions/v1/process-ton-payment`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${import.meta.env.VITE_SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({
            userId,
            tonAmount,
            coinsAmount: coinsReceived,
            txHash: result.boc,
            payload,
          }),
        }
      );

      if (!verifyResponse.ok) {
        throw new Error('Payment verification failed');
      }

      const verifyData = await verifyResponse.json();

      return {
        success: true,
        txHash: result.boc,
        newBalance: verifyData.newBalance,
      };
    } catch (error) {
      console.error('[TonPayments] Payment error:', error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Payment failed',
      };
    }
  }

  private async verifyTonPayment(userId: string, tonAmount: number, txHash: string): Promise<void> {
    console.log('[TonPayments] Verifying payment:', { userId, tonAmount, txHash });
  }
}

export const tonPayments = TonPaymentService.getInstance();

export function useTonPayments() {
  const [tonConnectUI] = useTonConnectUI();

  if (tonConnectUI && !tonPayments.isAvailable()) {
    tonPayments.setTonConnectUI(tonConnectUI);
  }

  return tonPayments;
}
