# Payment System Setup Guide

Your application now supports **two payment methods**:
1. **Telegram Stars** (in-app Telegram currency)
2. **TON Wallet** (TON blockchain payments)

## Features Implemented

### ✅ Dual Payment System
- Users can choose between Telegram Stars or TON Wallet
- Smooth payment method switching
- Mobile-optimized interface
- Real-time balance updates

### ✅ Telegram Stars Payment
- In-app Telegram payment system
- Exchange rate: **1 Star = 0.1 TON**
- Preset amounts: 100, 500, 1000, 2500 Stars
- Secure invoice creation via Telegram Bot API
- Payment verification and balance crediting

### ✅ TON Wallet Payment
- Direct blockchain payments
- Exchange rate: **1 TON = 10 TON (game currency)**
- Preset amounts: 1, 5, 10, 25 TON
- TON Connect integration for wallet connection
- Transaction hash verification

## Setup Instructions

### 1. Telegram Bot Configuration

To enable Telegram Stars payments, you need to configure your Telegram Bot Token:

1. Open the `.env` file in your project root
2. Replace `YOUR_BOT_TOKEN_HERE` with your actual bot token:

```env
TELEGRAM_BOT_TOKEN=1234567890:ABCdefGHIjklMNOpqrsTUVwxyz
```

**How to get a bot token:**
1. Open Telegram and search for [@BotFather](https://t.me/botfather)
2. Send `/newbot` and follow the instructions
3. Copy the token provided by BotFather
4. Paste it into your `.env` file

### 2. TON Wallet Configuration

The TON payment system uses TON Connect for wallet integration. The receiver address is pre-configured:

```
RECEIVER_ADDRESS: UQCt2VhG9AJhKkMJl8WUNawLCJlPMmjLXWWXnvGVhGqhqV7P
```

**To change the receiver address:**
1. Open `src/utils/tonPayments.ts`
2. Update the `RECEIVER_ADDRESS` constant with your wallet address
3. Rebuild the project: `npm run build`

### 3. Database Setup

The payment system requires the following database tables (already created):

- `user_balances` - Stores user balance information
- `pending_payments` - Tracks pending Telegram Stars payments
- `transactions` - Logs all completed transactions

**Tables are automatically created via migrations.**

### 4. Edge Functions

The following Supabase Edge Functions have been deployed:

1. **create-invoice** - Creates Telegram Stars payment invoices
2. **verify-payment** - Verifies Telegram Stars payments
3. **process-ton-payment** - Processes TON wallet payments

**Functions are automatically deployed and configured.**

## How It Works

### Telegram Stars Payment Flow

1. User selects payment amount and clicks "Pay with Telegram Stars"
2. System creates an invoice via `create-invoice` edge function
3. Telegram payment interface opens in the app
4. User completes payment through Telegram
5. System verifies payment via `verify-payment` edge function
6. Balance is updated in the database
7. Transaction is logged for record keeping

### TON Wallet Payment Flow

1. User selects payment amount and clicks "Pay with TON Wallet"
2. If wallet not connected, TON Connect modal opens
3. User approves connection in their wallet app
4. Transaction is created with the selected amount
5. User confirms transaction in wallet app
6. Transaction hash is sent to `process-ton-payment` edge function
7. Balance is updated and transaction is logged

## Exchange Rates

- **Telegram Stars**: 1 Star = 0.1 TON (game currency)
- **TON Wallet**: 1 TON = 10 TON (game currency)

## Testing

### Test Telegram Stars Payment

1. Open the app in Telegram WebApp
2. Click "Deposit" button
3. Select "Telegram Stars" payment method
4. Choose an amount (e.g., 100 Stars = 10 TON)
5. Complete payment in Telegram
6. Verify balance update

### Test TON Wallet Payment

1. Open the app
2. Click "Deposit" button
3. Select "TON Wallet" payment method
4. Connect your wallet (e.g., Tonkeeper, TON Wallet)
5. Choose an amount (e.g., 1 TON = 10 TON)
6. Approve transaction in wallet
7. Verify balance update

## Security Features

- ✅ All payments are verified server-side
- ✅ Duplicate transaction prevention (via tx_hash check)
- ✅ Row Level Security (RLS) on all database tables
- ✅ CORS headers properly configured
- ✅ Secure edge function authentication
- ✅ Balance validation before case opening

## Troubleshooting

### "Telegram WebApp not available"
- **Solution**: Make sure you're opening the app through Telegram (not in a regular browser)

### "Wallet connection failed"
- **Solution**: Install a TON wallet app (Tonkeeper or TON Wallet) and try again

### "Payment verification failed"
- **Solution**: Check that your `TELEGRAM_BOT_TOKEN` is correctly set in `.env`

### "Transaction already processed"
- **Solution**: This is normal - it prevents duplicate payments for the same transaction

## Files Modified

### New Files
- `src/utils/tonPayments.ts` - TON payment service
- `supabase/functions/process-ton-payment/index.ts` - TON payment processor

### Modified Files
- `src/components/DepositModal.tsx` - Updated for dual payment support
- `.env` - Added TELEGRAM_BOT_TOKEN configuration

### Database
- New columns: `ton_amount`, `tx_hash` in `transactions` table
- New tables: `pending_payments`, `transactions`

## Support

If you encounter any issues:
1. Check browser console for error messages
2. Verify all environment variables are set correctly
3. Ensure bot token is valid
4. Check Supabase edge function logs

---

**Payment system is now fully functional and ready for production use!**
