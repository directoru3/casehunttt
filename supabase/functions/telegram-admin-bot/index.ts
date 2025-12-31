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
  } else if (data.startsWith('edit_case_')) {
    const caseId = data.replace('edit_case_', '');

    const { data: caseData } = await supabase
      .from('cases')
      .select('*')
      .eq('id', caseId)
      .maybeSingle();

    if (!caseData) {
      await sendTelegramMessage(chatId, '❌ Кейс не найден');
      return;
    }

    const { data: caseItems } = await supabase
      .from('case_items')
      .select('*, items(*)')
      .eq('case_id', caseId);

    let response = `📦 <b>${caseData.name}</b>\n\n`;
    response += `💰 Цена: ${caseData.price} TON\n`;
    response += `${caseData.is_active ? '✅ Активен' : '❌ Неактивен'}\n\n`;

    if (caseItems && caseItems.length > 0) {
      response += '<b>Содержимое кейса:</b>\n';
      caseItems.forEach((ci: any) => {
        const rarityEmoji = {
          common: '⚪',
          uncommon: '🟢',
          rare: '🔵',
          epic: '🟣',
          legendary: '🟡'
        }[ci.items.rarity] || '⚪';
        response += `${rarityEmoji} ${ci.items.name} - ${ci.drop_rate}%\n`;
      });

      const totalRate = caseItems.reduce((sum: number, ci: any) => sum + parseFloat(ci.drop_rate), 0);
      response += `\n📊 Итого: ${totalRate.toFixed(2)}%`;
      if (totalRate !== 100) {
        response += ' ⚠️';
      }
    } else {
      response += '⚠️ В кейсе нет предметов';
    }

    const buttons = [
      [{ text: '✏️ Изменить название', callback_data: `caseedit_name_${caseId}` }],
      [{ text: '🖼 Изменить изображение', callback_data: `caseedit_image_${caseId}` }],
      [{ text: '💰 Изменить цену', callback_data: `caseedit_price_${caseId}` }],
      [{ text: caseData.is_active ? '❌ Деактивировать' : '✅ Активировать', callback_data: `caseedit_toggle_${caseId}` }],
      [{ text: '➕ Добавить предмет', callback_data: `caseadd_item_${caseId}` }],
      [{ text: '🗑 Удалить кейс', callback_data: `casedelete_${caseId}` }],
      [{ text: '⬅️ Назад', callback_data: 'list_cases' }]
    ];

    await editTelegramMessage(chatId, messageId, response, { inline_keyboard: buttons });
  } else if (data.startsWith('edit_item_')) {
    const itemId = data.replace('edit_item_', '');

    const { data: item } = await supabase
      .from('items')
      .select('*')
      .eq('id', itemId)
      .maybeSingle();

    if (!item) {
      await sendTelegramMessage(chatId, '❌ Предмет не найден');
      return;
    }

    const rarityEmoji = {
      common: '⚪',
      uncommon: '🟢',
      rare: '🔵',
      epic: '🟣',
      legendary: '🟡'
    }[item.rarity] || '⚪';

    let response = `🎁 <b>${item.name}</b>\n\n`;
    response += `${rarityEmoji} Редкость: ${item.rarity}\n`;
    response += `💰 Цена: ${item.price} TON\n`;
    if (item.description) {
      response += `📝 ${item.description}\n`;
    }

    const buttons = [
      [{ text: '✏️ Изменить название', callback_data: `itemedit_name_${itemId}` }],
      [{ text: '🖼 Изменить изображение', callback_data: `itemedit_image_${itemId}` }],
      [{ text: '🎨 Изменить редкость', callback_data: `itemedit_rarity_${itemId}` }],
      [{ text: '💰 Изменить цену', callback_data: `itemedit_price_${itemId}` }],
      [{ text: '🗑 Удалить предмет', callback_data: `itemdelete_${itemId}` }],
      [{ text: '⬅️ Назад', callback_data: 'list_items' }]
    ];

    await editTelegramMessage(chatId, messageId, response, { inline_keyboard: buttons });
  } else if (data.startsWith('caseedit_name_')) {
    const caseId = data.replace('caseedit_name_', '');
    userSessions[userId] = { command: 'edit_case_name', caseId };
    await sendTelegramMessage(chatId, '📝 Введите новое название кейса:');
  } else if (data.startsWith('caseedit_image_')) {
    const caseId = data.replace('caseedit_image_', '');
    userSessions[userId] = { command: 'edit_case_image', caseId };
    await sendTelegramMessage(chatId, '🖼 Отправьте новое изображение для кейса:');
  } else if (data.startsWith('caseedit_price_')) {
    const caseId = data.replace('caseedit_price_', '');
    userSessions[userId] = { command: 'edit_case_price', caseId };
    await sendTelegramMessage(chatId, '💰 Введите новую цену кейса (в TON):');
  } else if (data.startsWith('caseedit_toggle_')) {
    const caseId = data.replace('caseedit_toggle_', '');
    const { data: caseData } = await supabase
      .from('cases')
      .select('is_active')
      .eq('id', caseId)
      .maybeSingle();

    if (caseData) {
      await supabase
        .from('cases')
        .update({ is_active: !caseData.is_active })
        .eq('id', caseId);

      await sendTelegramMessage(chatId, `✅ Кейс ${caseData.is_active ? 'деактивирован' : 'активирован'}`);

      await handleCallbackQuery({
        ...callbackQuery,
        data: `edit_case_${caseId}`
      }, supabase);
    }
  } else if (data.startsWith('caseadd_item_')) {
    const caseId = data.replace('caseadd_item_', '');

    const { data: items } = await supabase
      .from('items')
      .select('*')
      .order('created_at', { ascending: false })
      .limit(15);

    if (!items || items.length === 0) {
      await sendTelegramMessage(chatId, '❌ Нет доступных предметов. Сначала создайте предметы.');
      return;
    }

    let response = '🎁 <b>Выберите предмет для добавления:</b>\n\n';

    const buttons = items.map((item: any) => {
      const rarityEmoji = {
        common: '⚪',
        uncommon: '🟢',
        rare: '🔵',
        epic: '🟣',
        legendary: '🟡'
      }[item.rarity] || '⚪';

      return [{
        text: `${rarityEmoji} ${item.name} (${item.price} TON)`,
        callback_data: `addtocase_${caseId}_${item.id}`
      }];
    });

    buttons.push([{ text: '⬅️ Назад', callback_data: `edit_case_${caseId}` }]);

    await sendTelegramMessage(chatId, response, { inline_keyboard: buttons });
  } else if (data.startsWith('addtocase_')) {
    const parts = data.split('_');
    const caseId = parts[1];
    const itemId = parts[2];

    userSessions[userId] = {
      command: 'add_item_to_case',
      caseId,
      itemId
    };

    await sendTelegramMessage(chatId, '🎲 Введите шанс выпадения для этого предмета (0-100%):');
  } else if (data.startsWith('casedelete_')) {
    const caseId = data.replace('casedelete_', '');
    userSessions[userId] = { command: 'confirm_delete_case', caseId };

    await sendTelegramMessage(chatId, '⚠️ Вы уверены, что хотите удалить этот кейс?\n\nНапишите "УДАЛИТЬ" для подтверждения:');
  } else if (data.startsWith('itemedit_name_')) {
    const itemId = data.replace('itemedit_name_', '');
    userSessions[userId] = { command: 'edit_item_name', itemId };
    await sendTelegramMessage(chatId, '📝 Введите новое название предмета:');
  } else if (data.startsWith('itemedit_image_')) {
    const itemId = data.replace('itemedit_image_', '');
    userSessions[userId] = { command: 'edit_item_image', itemId };
    await sendTelegramMessage(chatId, '🖼 Отправьте новое изображение для предмета:');
  } else if (data.startsWith('itemedit_rarity_')) {
    const itemId = data.replace('itemedit_rarity_', '');

    await sendTelegramMessage(chatId, '🎨 Выберите редкость:', {
      inline_keyboard: [
        [{ text: '⚪ Common', callback_data: `setrarity_${itemId}_common` }],
        [{ text: '🟢 Uncommon', callback_data: `setrarity_${itemId}_uncommon` }],
        [{ text: '🔵 Rare', callback_data: `setrarity_${itemId}_rare` }],
        [{ text: '🟣 Epic', callback_data: `setrarity_${itemId}_epic` }],
        [{ text: '🟡 Legendary', callback_data: `setrarity_${itemId}_legendary` }]
      ]
    });
  } else if (data.startsWith('setrarity_')) {
    const parts = data.split('_');
    const itemId = parts[1];
    const rarity = parts[2];

    await supabase
      .from('items')
      .update({ rarity, updated_at: new Date().toISOString() })
      .eq('id', itemId);

    await sendTelegramMessage(chatId, `✅ Редкость изменена на ${rarity}`);
  } else if (data.startsWith('itemedit_price_')) {
    const itemId = data.replace('itemedit_price_', '');
    userSessions[userId] = { command: 'edit_item_price', itemId };
    await sendTelegramMessage(chatId, '💰 Введите новую цену предмета (в TON):');
  } else if (data.startsWith('itemdelete_')) {
    const itemId = data.replace('itemdelete_', '');
    userSessions[userId] = { command: 'confirm_delete_item', itemId };

    await sendTelegramMessage(chatId, '⚠️ Вы уверены, что хотите удалить этот предмет?\n\nНапишите "УДАЛИТЬ" для подтверждения:');
  }
}

async function handleMessage(message: TelegramMessage, supabase: any) {
  const userId = message.from.id;
  const chatId = message.chat.id;
  const text = message.text;
  const photo = message.photo;

  const session = userSessions[userId];

  if (session?.command === 'create_case') {
    if (session.step === 'name') {
      session.name = text;
      session.step = 'image';
      await sendTelegramMessage(chatId, '🖼 Отправьте изображение для кейса:');
    } else if (session.step === 'image' && photo) {
      const photoFile = photo[photo.length - 1];
      session.image_url = await getFileUrl(photoFile.file_id);
      session.step = 'price';
      await sendTelegramMessage(chatId, '💰 Введите цену кейса (в TON):');
    } else if (session.step === 'price') {
      const price = parseFloat(text || '0');
      if (price >= 0) {
        const { data: newCase, error } = await supabase
          .from('cases')
          .insert({
            name: session.name,
            image_url: session.image_url,
            price: price,
            is_active: true
          })
          .select()
          .single();

        if (error) {
          await sendTelegramMessage(chatId, `❌ Ошибка при создании кейса: ${error.message}`);
        } else {
          await sendTelegramMessage(
            chatId,
            `✅ Кейс создан успешно!\n\n` +
            `Название: ${session.name}\n` +
            `Цена: ${price} TON\n` +
            `ID: ${newCase.id}`
          );
        }
        delete userSessions[userId];
      } else {
        await sendTelegramMessage(chatId, '❌ Неверная цена. Введите число >= 0:');
      }
    }
  } else if (session?.command === 'create_item') {
    if (session.step === 'name') {
      session.name = text;
      session.step = 'image';
      await sendTelegramMessage(chatId, '🖼 Отправьте изображение для предмета:');
    } else if (session.step === 'image' && photo) {
      const photoFile = photo[photo.length - 1];
      session.image_url = await getFileUrl(photoFile.file_id);
      session.step = 'rarity';
      await sendTelegramMessage(chatId, '🎨 Выберите редкость:', {
        inline_keyboard: [
          [{ text: '⚪ Common', callback_data: 'newitem_rarity_common' }],
          [{ text: '🟢 Uncommon', callback_data: 'newitem_rarity_uncommon' }],
          [{ text: '🔵 Rare', callback_data: 'newitem_rarity_rare' }],
          [{ text: '🟣 Epic', callback_data: 'newitem_rarity_epic' }],
          [{ text: '🟡 Legendary', callback_data: 'newitem_rarity_legendary' }]
        ]
      });
    } else if (session.step === 'price') {
      const price = parseFloat(text || '0');
      if (price >= 0) {
        const { data: newItem, error } = await supabase
          .from('items')
          .insert({
            name: session.name,
            image_url: session.image_url,
            rarity: session.rarity,
            price: price,
            description: ''
          })
          .select()
          .single();

        if (error) {
          await sendTelegramMessage(chatId, `❌ Ошибка при создании предмета: ${error.message}`);
        } else {
          await sendTelegramMessage(
            chatId,
            `✅ Предмет создан успешно!\n\n` +
            `Название: ${session.name}\n` +
            `Редкость: ${session.rarity}\n` +
            `Цена: ${price} TON\n` +
            `ID: ${newItem.id}`
          );
        }
        delete userSessions[userId];
      } else {
        await sendTelegramMessage(chatId, '❌ Неверная цена. Введите число >= 0:');
      }
    }
  } else if (session?.command === 'add_item_to_case') {
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
        await sendTelegramMessage(chatId, `✅ Шанс выпадения обновлен на ${dropRate}%`);
      } else {
        await supabase
          .from('case_items')
          .insert({
            case_id: session.caseId,
            item_id: session.itemId,
            drop_rate: dropRate
          });
        await sendTelegramMessage(chatId, `✅ Предмет добавлен в кейс с шансом ${dropRate}%`);
      }

      delete userSessions[userId];
    } else {
      await sendTelegramMessage(chatId, '❌ Неверный шанс. Введите число от 0 до 100:');
    }
  } else if (session?.command === 'edit_case_name') {
    await supabase
      .from('cases')
      .update({ name: text, updated_at: new Date().toISOString() })
      .eq('id', session.caseId);

    await sendTelegramMessage(chatId, `✅ Название изменено на "${text}"`);
    delete userSessions[userId];
  } else if (session?.command === 'edit_case_image' && photo) {
    const photoFile = photo[photo.length - 1];
    const imageUrl = await getFileUrl(photoFile.file_id);

    await supabase
      .from('cases')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', session.caseId);

    await sendTelegramMessage(chatId, '✅ Изображение обновлено');
    delete userSessions[userId];
  } else if (session?.command === 'edit_case_price') {
    const price = parseFloat(text || '0');
    if (price >= 0) {
      await supabase
        .from('cases')
        .update({ price, updated_at: new Date().toISOString() })
        .eq('id', session.caseId);

      await sendTelegramMessage(chatId, `✅ Цена изменена на ${price} TON`);
      delete userSessions[userId];
    } else {
      await sendTelegramMessage(chatId, '❌ Неверная цена. Введите число >= 0:');
    }
  } else if (session?.command === 'confirm_delete_case' && text === 'УДАЛИТЬ') {
    await supabase.from('case_items').delete().eq('case_id', session.caseId);
    await supabase.from('cases').delete().eq('id', session.caseId);

    await sendTelegramMessage(chatId, '✅ Кейс удален');
    delete userSessions[userId];
  } else if (session?.command === 'edit_item_name') {
    await supabase
      .from('items')
      .update({ name: text, updated_at: new Date().toISOString() })
      .eq('id', session.itemId);

    await sendTelegramMessage(chatId, `✅ Название изменено на "${text}"`);
    delete userSessions[userId];
  } else if (session?.command === 'edit_item_image' && photo) {
    const photoFile = photo[photo.length - 1];
    const imageUrl = await getFileUrl(photoFile.file_id);

    await supabase
      .from('items')
      .update({ image_url: imageUrl, updated_at: new Date().toISOString() })
      .eq('id', session.itemId);

    await sendTelegramMessage(chatId, '✅ Изображение обновлено');
    delete userSessions[userId];
  } else if (session?.command === 'edit_item_price') {
    const price = parseFloat(text || '0');
    if (price >= 0) {
      await supabase
        .from('items')
        .update({ price, updated_at: new Date().toISOString() })
        .eq('id', session.itemId);

      await sendTelegramMessage(chatId, `✅ Цена изменена на ${price} TON`);
      delete userSessions[userId];
    } else {
      await sendTelegramMessage(chatId, '❌ Неверная цена. Введите число >= 0:');
    }
  } else if (session?.command === 'confirm_delete_item' && text === 'УДАЛИТЬ') {
    await supabase.from('case_items').delete().eq('item_id', session.itemId);
    await supabase.from('items').delete().eq('id', session.itemId);

    await sendTelegramMessage(chatId, '✅ Предмет удален');
    delete userSessions[userId];
  } else if (text === '/start') {
    await sendTelegramMessage(
      chatId,
      '🎮 <b>Панель администратора CaseHunt</b>\n\nВыберите раздел:',
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

      if (update.callback_query.data?.startsWith('newitem_rarity_')) {
        const userId = update.callback_query.from.id;
        const rarity = update.callback_query.data.replace('newitem_rarity_', '');
        const session = userSessions[userId];

        if (session?.command === 'create_item') {
          session.rarity = rarity;
          session.step = 'price';
          await sendTelegramMessage(
            update.callback_query.message.chat.id,
            `✅ Редкость: ${rarity}\n\n💰 Введите цену предмета (в TON):`
          );
        }
      } else {
        await handleCallbackQuery(update.callback_query, supabase);
      }

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
