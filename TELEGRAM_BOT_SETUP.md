# Telegram Admin Bot Setup Guide

This guide explains how to set up and use the Telegram Admin Bot for managing your NFT Gifts platform.

## Features

The bot provides the following administrative features:

- **Platform Statistics** - View total users, drops, and balance
- **User Management** - List recent users and check balances
- **Balance Management** - Add or remove balance from users
- **Live Drops** - View recent item drops
- **Broadcasting** - Send messages to all users

## Setup Instructions

### 1. Create Your Telegram Bot

1. Open Telegram and search for [@BotFather](https://t.me/BotFather)
2. Send `/newbot` command
3. Choose a name for your bot (e.g., "NFT Gifts Admin")
4. Choose a username for your bot (e.g., "nft_gifts_admin_bot")
5. Copy the bot token provided by BotFather

### 2. Configure the Webhook

Set up the webhook URL to point to your Supabase Edge Function:

```bash
curl -X POST "https://api.telegram.org/bot<YOUR_BOT_TOKEN>/setWebhook" \
  -H "Content-Type: application/json" \
  -d '{"url": "<YOUR_SUPABASE_URL>/functions/v1/telegram-admin-bot"}'
```

Replace:
- `<YOUR_BOT_TOKEN>` with your actual bot token
- `<YOUR_SUPABASE_URL>` with your Supabase project URL

### 3. Add Admin Users

Edit the `ADMIN_IDS` array in the bot's code to include Telegram user IDs of administrators:

```typescript
const ADMIN_IDS = [123456789, 987654321]; // Add your Telegram user IDs here
```

To find your Telegram user ID:
1. Message [@userinfobot](https://t.me/userinfobot) on Telegram
2. It will reply with your user ID

## Available Commands

### `/start`
Shows welcome message and list of available commands.

### `/stats`
Displays platform statistics:
- Total number of users
- Total number of drops
- Total platform balance
- Current timestamp

Example output:
```
📊 Platform Statistics

👥 Total Users: 1,234
🎁 Total Drops: 5,678
💰 Total Balance: 12,345.67 Stars
⏰ Updated: 2025-12-30T12:00:00.000Z
```

### `/users`
Shows the 10 most recent registered users with:
- Telegram ID
- Name and username
- Registration date

### `/balance [user_id]`
Check the balance of a specific user.

Example:
```
/balance 123456789
```

Output:
```
💰 Balance for user 123456789: 100.50 Stars
```

### `/addbalance [user_id] [amount]`
Add balance to a user's account.

Example:
```
/addbalance 123456789 50
```

Output:
```
✅ Added 50 Stars to user 123456789
New balance: 150.50 Stars
```

### `/removebalance [user_id] [amount]`
Remove balance from a user's account (implementation similar to addbalance but with negative amount).

### `/drops`
View the 10 most recent item drops with:
- Username
- Item name
- Item rarity

Example output:
```
🎁 Recent Drops

John won Legendary Sword (legendary)
Alice won Rare Shield (rare)
Bob won Common Potion (common)
```

### `/broadcast [message]`
Send a message to all users (implementation note: requires frontend notification system).

## Security Notes

1. **Keep your bot token secret** - Never share it publicly
2. **Limit admin access** - Only add trusted user IDs to ADMIN_IDS
3. **Monitor bot activity** - Regularly check logs for unauthorized access attempts
4. **Use HTTPS** - Ensure your webhook URL uses HTTPS

## Troubleshooting

### Bot doesn't respond
- Check if webhook is set correctly
- Verify bot token is correct
- Check Supabase Edge Function logs

### "Access denied" message
- Ensure your Telegram user ID is in the ADMIN_IDS array
- Verify you're using the correct bot

### Commands not working
- Make sure the command format is correct
- Check for typos in user IDs or amounts
- Review Edge Function logs for errors

## Logging Events

The bot automatically logs the following events to the database:
- Case openings (via live_drops table)
- User registrations (via users table)
- Balance changes (via user_balances table)

All events are timestamped and can be queried through the bot commands.

## Future Enhancements

Planned features for future updates:
- User banning/unbanning
- Detailed analytics and charts
- Automated alerts for suspicious activity
- Custom notification rules
- Export functionality for reports
