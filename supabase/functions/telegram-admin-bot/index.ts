import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

const ADMIN_IDS = [5218588916];
const BOT_TOKEN = Deno.env.get('TELEGRAM_BOT_TOKEN') || '';

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
      message_id: number;
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

async function editTelegramMessage(chatId: number, messageId: number, text: string, replyMarkup?: any) {
  const url = `https://api.telegram.org/bot${BOT_TOKEN}/editMessageText`;
  await fetch(url, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
      chat_id: chatId,
      message_id: messageId,
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

function getMainMenu() {
  return {
    inline_keyboard: [
      [{ text: '📦 Управление кейсами', callback_data: 'menu_cases' }],
      [{ text: '🎁 Управление предметами', callback_data: 'menu_items' }],
      [{ text: '👥 Пользователи', callback_data: 'menu_users' }],
      [{ text: '📊 Статистика', callback_data: 'show_stats' }]
    ]
  };
}

function getCasesMenu() {
  return {
    inline_keyboard: [
      [{ text: '📋 Список кейсов', callback_data: 'list_cases' }],
      [{ text: '➕ Создать кейс', callback_data: 'create_case' }],
      [{ text: '⬅️ Назад', callback_data: 'main_menu' }]
    ]
  };
}

function getItemsMenu() {
  return {
    inline_keyboard: [
      [{ text: '📋 Список предметов', callback_data: 'list_items' }],
      [{ text: '➕ Создать предмет', callback_data: 'create_item' }],
      [{ text: '⬅️ Назад', callback_data: 'main_menu' }]
    ]
  };
}

function getUsersMenu() {
  return {
    inline_keyboard: [
      [{ text: '👥 Список пользователей', callback_data: 'list_users' }],
      [{ text: '💰 Управление балансом', callback_data: 'manage_balance' }],
      [{ text: '⬅️ Назад', callback_data: 'main_menu' }]
    ]
  };
}

async function handleCallbackQuery(callbackQuery: any, supabase: any) {
  const userId = callbackQuery.from.id;
  const chatId = callbackQuery.message.chat.id;
  const messageId = callbackQuery.message.message_id;
  const data = callbackQuery.data;

  if (data === 'main_menu') {
    await editTelegramMessage(
      chatId,
      messageId,
      '🎮 <b>Панель администратора CaseHunt</b>\n\nВыберите раздел:',
      getMainMenu()
    );
  } else if (data === 'menu_cases') {
    await editTelegramMessage(
      chatId,
      messageId,
      '📦 <b>Управление кейсами</b>\n\nВыберите действие:',
      getCasesMenu()
    );
  } else if (data === 'menu_items') {
    await editTelegramMessage(
      chatId,
      messageId,
      '🎁 <b>Управление предметами</b>\n\nВыберите действие:',
      getItemsMenu()
    );
  } else if (data === 'menu_users') {
    await editTelegramMessage(
      chatId,
      messageId,
      '👥 <b>Управление пользователями</b>\n\nВыберите действие:',
      getUsersMenu()
    );
  } else if (data === 'show_stats') {
    const { data: users } = await supabase.from('users').select('id', { count: 'exact' });
    const { data: drops } = await supabase.from('live_drops').select('id', { count: 'exact' });
    const { data: balances } = await supabase.from('user_balances').select('balance');
    const { data: items } = await supabase.from('items').select('id', { count: 'exact' });
    const { data: cases } = await supabase.from('cases').select('id', { count: 'exact' });

    const totalBalance = balances?.reduce((sum: number, b: any) => sum + parseFloat(b.balance || 0), 0) || 0;

    await editTelegramMessage(
      chatId,
      messageId,
      '📊 <b>Статистика платформы</b>\n\n' +
      `👥 Всего пользователей: ${users?.length || 0}\n` +
      `🎁 Всего дропов: ${drops?.length || 0}\n` +
      `💰 Общий баланс: ${totalBalance.toFixed(2)} Stars\n` +
      `🎮 Всего предметов: ${items?.length || 0}\n` +
      `📦 Всего кейсов: ${cases?.length || 0}\n` +
      `⏰ Обновлено: ${new Date().toLocaleString('ru-RU')}`,
      { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'main_menu' }]] }
    );
  } else if (data === 'list_cases') {
    const { data: cases } = await supabase
      .from('cases')
      .select('*')
      .order('created_at', { ascending: false });

    let response = '📦 <b>Список кейсов</b>\n\n';

    if (!cases || cases.length === 0) {
      response += 'Кейсов пока нет.';
    } else {
      cases.forEach((caseItem: any, index: number) => {
        response += `${index + 1}. <b>${caseItem.name}</b>\n`;
        response += `   💰 Цена: ${caseItem.price} TON\n`;
        response += `   ${caseItem.is_active ? '✅ Активен' : '❌ Неактивен'}\n\n`;
      });
    }

    const buttons = cases?.slice(0, 10).map((caseItem: any) => [{
      text: `${caseItem.name} (${caseItem.price} TON)`,
      callback_data: `edit_case_${caseItem.id}`
    }]) || [];

    buttons.push([{ text: '⬅️ Назад', callback_data: 'menu_cases' }]);

    await editTelegramMessage(chatId, messageId, response, { inline_keyboard: buttons });
  } else if (data === 'list_items') {
    const { data: items } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(20);

    let response = '🎁 <b>Список предметов</b>\n\n';

    if (!items || items.length === 0) {
      response += 'Предметов пока нет.';
    } else {
      items.forEach((item: any, index: number) => {
        const rarityEmoji = {
          common: '⚪',
          uncommon: '🟢',
          rare: '🔵',
          epic: '🟣',
          legendary: '🟡'
        }[item.rarity] || '⚪';

        response += `${index + 1}. ${rarityEmoji} <b>${item.name}</b>\n`;
        response += `   💰 ${item.price} TON | ${item.rarity}\n\n`;
      });
    }

    const buttons = items?.slice(0, 10).map((item: any) => [{
      text: `${item.name} (${item.price} TON)`,
      callback_data: `edit_item_${item.id}`
    }]) || [];

    buttons.push([{ text: '⬅️ Назад', callback_data: 'menu_items' }]);

    await editTelegramMessage(chatId, messageId, response, { inline_keyboard: buttons });
  } else if (data === 'list_users') {
    const { data: users } = await supabase
      .from('users')
      .select('telegram_id, first_name, username, created_at')
      .order('created_at', { ascending: false })
      .limit(10);

    let response = '👥 <b>Последние пользователи</b>\n\n';
    users?.forEach((user: any, index: number) => {
      response += `${index + 1}. ${user.first_name}${user.username ? ' (@' + user.username + ')' : ''}\n`;
      response += `   ID: ${user.telegram_id}\n`;
      response += `   📅 ${new Date(user.created_at).toLocaleDateString('ru-RU')}\n\n`;
    });

    await editTelegramMessage(
      chatId,
      messageId,
      response,
      { inline_keyboard: [[{ text: '⬅️ Назад', callback_data: 'menu_users' }]] }
    );
  } else if (data === 'create_case') {
    userSessions[userId] = { command: 'create_case', step: 'name' };
    await sendTelegramMessage(chatId, '📦 <b>Создание нового кейса</b>\n\n📝 Введите название кейса:');
  } else if (data === 'create_item') {
    userSessions[userId] = { command: 'create_item', step: 'name' };
    await sendTelegramMessage(chatId, '🎁 <b>Создание нового предмета</b>\n\n📝 Введите название предмета:');
  }
}

async function handleMessage(message: TelegramMessage, supabase: any) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const text = message.text;

  if (text === '/start') {
    await sendTelegramMessage(
      chatId,
      '🎮 <b>Панель администратора CaseHunt</b>\n\nИспользуйте команды:\n\n' +
      '📦 /case_items - просмотр предметов в кейсе\n' +
      '🎁 /add_item - добавить предмет\n\n' +
      '🏆 /start_season - запустить сезон\n' +
      '🏁 /end_season - завершить сезон\n' +
      '📊 /season_stats - статистика сезона\n' +
      '🎁 /give_rewards - выдать награды\n\n' +
      '💳 /payments_today - платежи за день\n' +
      '❌ /failed_payments - неудачные платежи\n' +
      '💰 /user_transactions @user - история пользователя',
      getMainMenu()
    );
  }
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
      const userId = update.callback_query.from.id;

      if (!ADMIN_IDS.includes(userId)) {
        await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            callback_query_id: update.callback_query.id,
            text: '⛔️ Доступ запрещен'
          })
        });
        return new Response(JSON.stringify({ ok: true }), {
          headers: { ...corsHeaders, 'Content-Type': 'application/json' }
        });
      }

      await handleCallbackQuery(update.callback_query, supabase);

      await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/answerCallbackQuery`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ callback_query_id: update.callback_query.id })
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

    if (!ADMIN_IDS.includes(userId)) {
      await sendTelegramMessage(chatId, '⛔️ Доступ запрещен. Вы не авторизованы для использования этого бота.');
      return new Response(JSON.stringify({ ok: true }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      });
    }

    await handleMessage(message, supabase);

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