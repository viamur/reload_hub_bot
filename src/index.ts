import {conversations, createConversation} from '@grammyjs/conversations';
import { Bot, GrammyError, HttpError, type Context, session, type SessionFlavor } from "grammy";
import { collaborateConversation } from "./conversations/collaborate";
import {mainMenuKeyboard} from './keyboards/replyKeyboards';
import {getUserFullName} from './utils/getUserFullName';
import 'dotenv/config';
import mongoose from 'mongoose';
import type {MyContext, MySession} from './types/types';
import {commandStart} from './commands/index.js';


const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;
if (!token) {
  console.error('❌--empty BOT_TOKEN in .env');
  process.exit(1);
}

// Install session middleware, and define the initial session value.
function initial(): MySession {
  return {
    collab: {
      type: "",
      region: "",
      contact: "",
    }
  };
}

const bot = new Bot<MyContext>(token);

bot.use(conversations());
bot.use(session({ initial }))
bot.use(createConversation(collaborateConversation));

bot.api.setMyCommands([
  { command: 'start', description: '🏠 Почати спочатку' },
  { command: 'menu', description: '📍 Головне меню' },
  { command: 'support', description: '💬 Зв\'язатися з підтримкою' },
  { command: 'contacts', description: '📱 Наші контакти' },
])

bot.command('start', commandStart);

bot.command('menu', async (ctx) => {
  await ctx.reply(
    'Оберіть необхідний розділ з меню нижче 👇',
    { reply_markup: mainMenuKeyboard }
  );
});

bot.command('support', async (ctx) => {
  await ctx.reply(
    `📝 Будь ласка, опишіть ваше питання:\n\n` +
    `• Чим можемо допомогти?\n` +
    `• Вкажіть деталі проблеми\n` +
    `• Додайте скріншот, якщо потрібно\n\n` +
    `⌛ Зазвичай ми відповідаємо протягом кількох хвилин \n` +
    `✨ Дякуємо за звернення!`
  );

  ctx.session.timestampSendMessage = Date.now();

  const adminMessage =
    `🔔 Нове звернення до підтримки!\n\n` +
    `👤 Користувач: ${ctx.from?.username || ctx.from?.first_name || 'Анонім'}\n` +
    `🆔 ID: ${ctx.from?.id}\n` +
    `📅 Час: ${new Date().toLocaleString('uk-UA')}\n\n` +
    `⏳ Очікує на відповідь...`;

  await ctx.api.sendMessage(+adminId, adminMessage);
  await ctx.api.forwardMessage(+adminId, ctx.chat.id, ctx.msg.message_id);
});

bot.command('contacts', async (ctx) => {
  await ctx.reply('contacts');
});

bot.command('admin', async (ctx) => {
  if (!adminId) {
    console.error('❌--empty ADMIN_ID in .env');
    return;
  }

  if (!ctx.from) {
    console.error('❌--ctx.from is undefined');
    return;
  }

  if (adminId === String(ctx.from.id)) {
    await ctx.reply('Welcome, admin!');
  } else {
    console.log(`❌--User ${getUserFullName(ctx.from)} (${ctx.from.id} - ${ctx.from.username}) tried to access admin command.`);
    await ctx.api.sendMessage(adminId, `Користувач ${getUserFullName(ctx.from)} (${ctx.from.id} - ${ctx.from.username}) намагався отримати доступ до адміністративної команди.`);
  }
});

bot.on("edited_message", async (ctx) => {
  // Get the new, edited, text of the message.
  const editedText = ctx.msg.text;
  console.log(`editedText: ${editedText}`);
});

bot.hears('🎉 Хочу співпрацювати', async (ctx) => {
  await ctx.conversation.enter('collaborateConversation')
})

bot.on('message:text', async ctx => {
  const txt = ctx.message.text;
  const isAdmin = ctx.chat.id === Number(adminId);

  try {
    if (isAdmin && ctx.msg.reply_to_message?.forward_origin?.type === 'user') {
      const replyFromId = ctx.msg.reply_to_message.forward_origin.sender_user.id;
      await ctx.api.sendMessage(replyFromId, ctx.msg.text);
      return;
    }

    switch (txt) {
      case '📍 Де здати сировину':
        return ctx.reply('👉 Ви обрали “Де здати сировину”. Список точок…');
      case '🚚 Виклик за сировиною':
        return ctx.reply('👉 Ви обрали “Виклик за сировиною”. Питаємо адресу…');
      case '💰 Ціни на сировину':
        return ctx.reply('👉 Ви обрали “Ціни на сировину”. Отаке…');
      case '🛠 Як підготувати сировину':
        return ctx.reply('👉 Ви обрали “Як підготувати сировину”. Інструкція…');
      case '📝 Залишити заявку':
        return ctx.reply('👉 Ви обрали “Залишити заявку”. Збираємо дані…');
      case '❓ FAQ':
        return ctx.reply('👉 Ви обрали “FAQ”. Питання та відповіді…');
      case '🗣 Оператор':
        return ctx.reply('👉 Ви обрали “Оператор”. Переадресуємо…');
      default:
        if (!isAdmin) {
          await ctx.api.forwardMessage(Number(adminId), ctx.chat.id, ctx.msg.message_id);

          console.log('ctx.session?.timestampSendMessage', ctx.session?.timestampSendMessage)
          if (!ctx.session?.timestampSendMessage || ctx.session.timestampSendMessage < Date.now() - 1000 * 20) {
            ctx.session.timestampSendMessage = Date.now();
            return ctx.reply(
              `✅ Ваше повідомлення успішно відправлено!\n\n` +
              `👋 Наша команда підтримки скоро з вами зв'яжеться\n` +
              `⌛️ Зазвичай ми відповідаємо протягом кількох хвилин\n\n` +
              `🙌 Дякуємо за терпіння!`
            );

          }

        }
    }
  } catch (error) {
    console.error('❌--Error in message handler:', error);
    return ctx.reply(
      `❌ Ой, щось пішло не так...\n\n` +
      `🔄 Будь ласка, спробуйте ще раз через кілька хвилин\n` +
      `💡 Якщо проблема повториться, зв'яжіться з нами через @support_username`
    );
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const error = err.error;

  if (error instanceof GrammyError) {
    console.error('⚠️--Error in request:', error.description);
  } else if (error instanceof HttpError) {
    console.error('⚠️--Could not contact Telegram:', error);
  } else {
    console.error('⚠️--Unknown error:', error);
  }
})

async function init() {
  const MONGODB_URI = process.env.MONGODB_URI;
  if (!MONGODB_URI) {
    throw new Error('MongoDB URI doesn\'t exist');
  }

  try {
    await mongoose.connect(MONGODB_URI);
    // await googleSheets.initialize();
    bot.start();

    // await bot.api.sendMessage(+adminId, '✅ Bot started');

    console.log('✅--MongoDB connected & bot started');
  } catch (error) {
    console.error('❌--Error initializing:', error);
  }
}

init();
