const SUPABASE_URL = import.meta.env.VITE_SUPABASE_URL;
const SUPABASE_ANON_KEY = import.meta.env.VITE_SUPABASE_ANON_KEY;

export interface BalanceResult {
  success: boolean;
  balance: number;
  error?: string;
}

export const balanceManager = {
  async getBalance(userId: string): Promise<BalanceResult> {
    try {
      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/get-user-balance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ userId }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to fetch balance');
      }

      const data = await response.json();
      return {
        success: true,
        balance: data.balance || 0,
      };
    } catch (error) {
      console.error('Error fetching balance:', error);
      return {
        success: false,
        balance: 0,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async updateBalance(
    userId: string,
    balance: number,
    operation?: string
  ): Promise<BalanceResult> {
    try {
      if (balance < 0) {
        throw new Error('Balance cannot be negative');
      }

      const response = await fetch(
        `${SUPABASE_URL}/functions/v1/update-user-balance`,
        {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${SUPABASE_ANON_KEY}`,
          },
          body: JSON.stringify({ userId, balance, operation }),
        }
      );

      if (!response.ok) {
        throw new Error('Failed to update balance');
      }

      const data = await response.json();

      if (!data.success) {
        throw new Error(data.error || 'Failed to update balance');
      }

      return {
        success: true,
        balance: data.balance,
      };
    } catch (error) {
      console.error('Error updating balance:', error);
      return {
        success: false,
        balance: balance,
        error: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  },

  async addToBalance(userId: string, amount: number): Promise<BalanceResult> {
    const currentBalance = await this.getBalance(userId);
    if (!currentBalance.success) {
      return currentBalance;
    }

    const newBalance = currentBalance.balance + amount;
    return this.updateBalance(userId, newBalance, 'add');
  },

  async subtractFromBalance(userId: string, amount: number): Promise<BalanceResult> {
    const currentBalance = await this.getBalance(userId);
    if (!currentBalance.success) {
      return currentBalance;
    }

    if (currentBalance.balance < amount) {
      return {
        success: false,
        balance: currentBalance.balance,
        error: 'Insufficient balance',
      };
    }

    const newBalance = currentBalance.balance - amount;
    return this.updateBalance(userId, newBalance, 'subtract');
  },
};
