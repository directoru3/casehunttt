import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_IDS = [5218588916];
const BOT_TOKEN = '8326473702:AAG7Ie92KSVj3n_Fw1XbJ9dpklpjfYRcIeU';

interface TelegramMessage {
  message_id: number;
  from: {
    id: number;
    username?: string;
    first_name: string;
  };
  chat: {
    id: number;
  };
  text?: string;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
}

async function sendTelegramMessage(chatId: number, text: string) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML'
    })
  });
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const update: TelegramUpdate = await req.json();
    const message = update.message;

    if (!message || !message.text) {
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const userId = message.from.id;
    const chatId = message.chat.id;
    const text = message.text;

    if (!ADMIN_IDS.includes(userId)) {
      await sendTelegramMessage(chatId, '⛔️ Access denied. You are not authorized to use this bot.');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        '🎮 <b>NFT Gifts Admin Bot</b>\n\n' +
        'Available commands:\n' +
        '/stats - Get platform statistics\n' +
        '/users - List recent users\n' +
        '/balance [user_id] - Check user balance\n' +
        '/addbalance [user_id] [amount] - Add balance to user\n' +
        '/removebalance [user_id] [amount] - Remove balance from user\n' +
        '/drops - Recent live drops\n' +
        '/broadcast [message] - Send message to all users'
      );
    } else if (text === '/stats') {
      const { data: users } = await supabase.from('users').select('id', { count: 'exact' });
      const { data: drops } = await supabase.from('live_drops').select('id', { count: 'exact' });
      const { data: balances } = await supabase.from('user_balances').select('balance');
      
      const totalBalance = balances?.reduce((sum: number, b: any) => sum + parseFloat(b.balance || 0), 0) || 0;
      
      await sendTelegramMessage(
        chatId,
        '📊 <b>Platform Statistics</b>\n\n' +
        `👥 Total Users: ${users?.length || 0}\n` +
        `🎁 Total Drops: ${drops?.length || 0}\n` +
        `💰 Total Balance: ${totalBalance.toFixed(2)} Stars\n` +
        `⏰ Updated: ${new Date().toISOString()}`
      );
    } else if (text === '/users') {
      const { data: users } = await supabase
        .from('users')
        .select('telegram_id, first_name, username, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      let response = '👥 <b>Recent Users</b>\n\n';
      users?.forEach((user: any) => {
        response += `ID: ${user.telegram_id}\n`;
        response += `Name: ${user.first_name}${user.username ? ' (@' + user.username + ')' : ''}\n`;
        response += `Joined: ${new Date(user.created_at).toLocaleDateString()}\n\n`;
      });
      
      await sendTelegramMessage(chatId, response);
    } else if (text.startsWith('/balance ')) {
      const userId = text.split(' ')[1];
      const { data: balance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (balance) {
        await sendTelegramMessage(
          chatId,
          `💰 Balance for user ${userId}: ${balance.balance} Stars`
        );
      } else {
        await sendTelegramMessage(chatId, '❌ User not found');
      }
    } else if (text.startsWith('/addbalance ')) {
      const parts = text.split(' ');
      const userId = parts[1];
      const amount = parseFloat(parts[2]);
      
      const { data: currentBalance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();
      
      if (currentBalance) {
        const newBalance = parseFloat(currentBalance.balance) + amount;
        await supabase
          .from('user_balances')
          .update({ balance: newBalance })
          .eq('user_id', userId);
        
        await sendTelegramMessage(
          chatId,
          `✅ Added ${amount} Stars to user ${userId}\nNew balance: ${newBalance} Stars`
        );
      } else {
        await sendTelegramMessage(chatId, '❌ User not found');
      }
    } else if (text === '/drops') {
      const { data: drops } = await supabase
        .from('live_drops')
        .select('username, item_name, item_rarity, created_at')
        .order('created_at', { ascending: false })
        .limit(10);
      
      let response = '🎁 <b>Recent Drops</b>\n\n';
      drops?.forEach((drop: any) => {
        response += `${drop.username} won ${drop.item_name} (${drop.item_rarity})\n`;
      });
      
      await sendTelegramMessage(chatId, response);
    } else {
      await sendTelegramMessage(chatId, '❌ Unknown command. Use /start to see available commands.');
    }

    return new Response(JSON.stringify({ ok: true }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' }
    });
  } catch (error) {
    console.error('Error:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});