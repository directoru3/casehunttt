import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_IDS = [5218588916];
const BOT_TOKEN = '8326473702:AAG7Ie92KSVj3n_Fw1XbJ9dpklpjfYRcIeU';

const userSessions: { [userId: number]: any } = {};

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
  photo?: Array<{
    file_id: string;
    file_size: number;
  }>;
}

interface TelegramUpdate {
  update_id: number;
  message?: TelegramMessage;
  callback_query?: {
    id: string;
    from: {
      id: number;
      username?: string;
      first_name: string;
    };
    message: {
      chat: {
        id: number;
      };
    };
    data: string;
  };
}

async function sendTelegramMessage(chatId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      text: text,
      parse_mode: 'HTML',
      reply_markup: replyMarkup
    })
  });
}

async function getFileUrl(fileId: string): Promise<string> {
  const fileInfoUrl = `https://api.telegram.org/bot${BOT_TOKEN}/getFile?file_id=${fileId}`;
  const fileInfoResponse = await fetch(fileInfoUrl);
  const fileInfo = await fileInfoResponse.json();

  if (fileInfo.ok) {
    return `https://api.telegram.org/file/bot${BOT_TOKEN}/${fileInfo.result.file_path}`;
  }
  throw new Error('Failed to get file URL');
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

    if (update.callback_query) {
      const callbackQuery = update.callback_query;
      const userId = callbackQuery.from.id;
      const chatId = callbackQuery.message.chat.id;
      const data = callbackQuery.data;

      if (data?.startsWith('rarity_')) {
        const rarity = data.replace('rarity_', '');
        if (userSessions[userId]?.command === 'add_item') {
          userSessions[userId].rarity = rarity;
          await sendTelegramMessage(chatId, `✅ Rarity set to: ${rarity}\n\n💰 Enter item price in Stars:`);
        }
      } else if (data?.startsWith('additem_')) {
        const parts = data.split('_');
        const caseId = parts[1];
        const itemId = parts[2];

        userSessions[userId] = {
          command: 'edit_case',
          caseId,
          itemId,
          action: 'set_drop_rate'
        };

        await sendTelegramMessage(chatId, '🎲 Enter drop rate for this item (0-100%):');
      }

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: callbackQuery.id })
      });

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    const message = update.message;

    if (!message) {
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

    if (userSessions[userId]?.command === 'edit_case') {
      const session = userSessions[userId];

      if (session.action === 'set_drop_rate') {
        const dropRate = parseFloat(text || '0');
        if (dropRate >= 0 && dropRate <= 100) {
          const { data: existing } = await supabase
            .from('case_items')
            .select('*')
            .eq('case_id', session.caseId)
            .eq('item_id', session.itemId)
            .maybeSingle();

          if (existing) {
            await supabase
              .from('case_items')
              .update({ drop_rate: dropRate })
              .eq('id', existing.id);

            await sendTelegramMessage(chatId, `✅ Drop rate updated to ${dropRate}%`);
          } else {
            await supabase
              .from('case_items')
              .insert({
                case_id: session.caseId,
                item_id: session.itemId,
                drop_rate: dropRate
              });

            await sendTelegramMessage(chatId, `✅ Item added to case with ${dropRate}% drop rate`);
          }

          const { data: caseItems } = await supabase
            .from('case_items')
            .select('drop_rate')
            .eq('case_id', session.caseId);

          const totalRate = caseItems?.reduce((sum: number, ci: any) => sum + parseFloat(ci.drop_rate), 0) || 0;

          await sendTelegramMessage(
            chatId,
            `📊 Total drop rate for this case: ${totalRate.toFixed(2)}%\n` +
            (totalRate !== 100 ? `⚠️ Warning: Total should be 100%` : `✅ Drop rates are balanced!`)
          );

          delete userSessions[userId];
        } else {
          await sendTelegramMessage(chatId, '❌ Invalid drop rate. Please enter a number between 0-100:');
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (userSessions[userId]?.command === 'add_item') {
      const session = userSessions[userId];

      if (!session.name) {
        session.name = text;
        await sendTelegramMessage(chatId, '📸 Now send the item image:');
      } else if (!session.image_url && message.photo) {
        const photo = message.photo[message.photo.length - 1];
        session.image_url = await getFileUrl(photo.file_id);

        await sendTelegramMessage(chatId, '🎨 Select item rarity:', {
          inline_keyboard: [
            [{ text: 'Common', callback_data: 'rarity_common' }],
            [{ text: 'Uncommon', callback_data: 'rarity_uncommon' }],
            [{ text: 'Rare', callback_data: 'rarity_rare' }],
            [{ text: 'Mythical', callback_data: 'rarity_mythical' }],
            [{ text: 'Legendary', callback_data: 'rarity_legendary' }]
          ]
        });
      } else if (!session.rarity) {
        await sendTelegramMessage(chatId, '❌ Please send an image file.');
      } else if (!session.price) {
        const price = parseFloat(text || '0');
        if (price >= 0) {
          session.price = price;
          await sendTelegramMessage(chatId, '🎲 Enter drop rate (0-100%):');
        } else {
          await sendTelegramMessage(chatId, '❌ Invalid price. Please enter a valid number:');
        }
      } else if (!session.drop_rate) {
        const dropRate = parseFloat(text || '0');
        if (dropRate >= 0 && dropRate <= 100) {
          session.drop_rate = dropRate;

          const { data: item, error } = await supabase
            .from('items')
            .insert({
              name: session.name,
              image_url: session.image_url,
              rarity: session.rarity,
              price: session.price,
              description: ''
            })
            .select()
            .single();

          if (error) {
            await sendTelegramMessage(chatId, `❌ Error creating item: ${error.message}`);
          } else {
            await sendTelegramMessage(
              chatId,
              `✅ Item created successfully!\n\n` +
              `Name: ${session.name}\n` +
              `Rarity: ${session.rarity}\n` +
              `Price: ${session.price} Stars\n` +
              `Drop Rate: ${session.drop_rate}%\n` +
              `ID: ${item.id}`
            );
          }

          delete userSessions[userId];
        } else {
          await sendTelegramMessage(chatId, '❌ Invalid drop rate. Please enter a number between 0-100:');
        }
      }

      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    if (text === '/start') {
      await sendTelegramMessage(
        chatId,
        '🎮 <b>CaseHunt Admin Panel</b>\n\n' +
        'Available commands:\n' +
        '/stats - Get platform statistics\n' +
        '/users - List recent users\n' +
        '/balance [user_id] - Check user balance\n' +
        '/addbalance [user_id] [amount] - Add balance to user\n' +
        '/drops - Recent live drops\n\n' +
        '<b>Items & Cases Management:</b>\n' +
        '/add_item - Add new item (wizard)\n' +
        '/list_items - List all items\n' +
        '/edit_case [case_id] - Edit case contents\n' +
        '/list_cases - List all cases'
      );
    } else if (text === '/stats') {
      const { data: users } = await supabase.from('users').select('id', { count: 'exact' });
      const { data: drops } = await supabase.from('live_drops').select('id', { count: 'exact' });
      const { data: balances } = await supabase.from('user_balances').select('balance');
      const { data: items } = await supabase.from('items').select('id', { count: 'exact' });
      const { data: cases } = await supabase.from('cases').select('id', { count: 'exact' });

      const totalBalance = balances?.reduce((sum: number, b: any) => sum + parseFloat(b.balance || 0), 0) || 0;

      await sendTelegramMessage(
        chatId,
        '📊 <b>Platform Statistics</b>\n\n' +
        `👥 Total Users: ${users?.length || 0}\n` +
        `🎁 Total Drops: ${drops?.length || 0}\n` +
        `💰 Total Balance: ${totalBalance.toFixed(2)} Stars\n` +
        `🎮 Total Items: ${items?.length || 0}\n` +
        `📦 Total Cases: ${cases?.length || 0}\n` +
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
    } else if (text?.startsWith('/balance ')) {
      const targetUserId = text.split(' ')[1];
      const { data: balance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (balance) {
        await sendTelegramMessage(
          chatId,
          `💰 Balance for user ${targetUserId}: ${balance.balance} Stars`
        );
      } else {
        await sendTelegramMessage(chatId, '❌ User not found');
      }
    } else if (text?.startsWith('/addbalance ')) {
      const parts = text.split(' ');
      const targetUserId = parts[1];
      const amount = parseFloat(parts[2]);

      const { data: currentBalance } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', targetUserId)
        .maybeSingle();

      if (currentBalance) {
        const newBalance = parseFloat(currentBalance.balance) + amount;
        await supabase
          .from('user_balances')
          .update({ balance: newBalance })
          .eq('user_id', targetUserId);

        await sendTelegramMessage(
          chatId,
          `✅ Added ${amount} Stars to user ${targetUserId}\nNew balance: ${newBalance} Stars`
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
    } else if (text === '/add_item') {
      userSessions[userId] = { command: 'add_item' };
      await sendTelegramMessage(chatId, '✨ Let\'s add a new item!\n\n📝 Enter item name:');
    } else if (text === '/list_items') {
      const { data: items } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);

      let response = '🎮 <b>Items List</b>\n\n';
      items?.forEach((item: any) => {
        response += `<b>${item.name}</b>\n`;
        response += `ID: ${item.id}\n`;
        response += `Rarity: ${item.rarity}\n`;
        response += `Price: ${item.price} Stars\n\n`;
      });

      await sendTelegramMessage(chatId, response);
    } else if (text === '/list_cases') {
      const { data: cases } = await supabase
        .from('cases')
        .select('*')
        .order('created_at', { ascending: false });

      let response = '📦 <b>Cases List</b>\n\n';
      cases?.forEach((caseItem: any) => {
        response += `<b>${caseItem.name}</b>\n`;
        response += `ID: ${caseItem.id}\n`;
        response += `Price: ${caseItem.price} Stars\n`;
        response += `Active: ${caseItem.is_active ? 'Yes' : 'No'}\n\n`;
      });

      await sendTelegramMessage(chatId, response);
    } else if (text?.startsWith('/edit_case ')) {
      const caseId = text.split(' ')[1];

      const { data: caseData } = await supabase
        .from('cases')
        .select('*')
        .eq('id', caseId)
        .maybeSingle();

      if (!caseData) {
        await sendTelegramMessage(chatId, '❌ Case not found');
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      const { data: caseItems } = await supabase
        .from('case_items')
        .select('*, items(*)')
        .eq('case_id', caseId);

      let response = `📦 <b>Editing: ${caseData.name}</b>\n\n`;

      if (caseItems && caseItems.length > 0) {
        response += '<b>Current Items:</b>\n';
        caseItems.forEach((ci: any) => {
          response += `• ${ci.items.name} (${ci.items.rarity}) - ${ci.drop_rate}%\n`;
        });

        const totalRate = caseItems.reduce((sum: number, ci: any) => sum + parseFloat(ci.drop_rate), 0);
        response += `\n📊 Total: ${totalRate.toFixed(2)}%\n\n`;
      } else {
        response += 'No items in this case yet.\n\n';
      }

      response += '<b>Select action:</b>\n';
      response += '• Send item ID to add/update\n';
      response += '• Use /list_items to see available items';

      await sendTelegramMessage(chatId, response);

      const { data: allItems } = await supabase
        .from('items')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(10);

      if (allItems && allItems.length > 0) {
        const buttons = allItems.map((item: any) => [{
          text: `${item.name} (${item.rarity})`,
          callback_data: `additem_${caseId}_${item.id}`
        }]);

        await sendTelegramMessage(chatId, '🎮 Quick add item:', {
          inline_keyboard: buttons
        });
      }
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