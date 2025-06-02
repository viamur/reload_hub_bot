import {conversations, createConversation} from '@grammyjs/conversations';
import {Bot, GrammyError, HttpError, InlineKeyboard, InputFile, session} from 'grammy';
import { collaborateConversation } from "./conversations/collaborate";
import 'dotenv/config';
import mongoose from 'mongoose';
import type {MyContext, MySession} from './types/types';
import {commandStart, commandSupport, commandAdmin, commandMenu, commandContacts} from './commands/index.js';
import path from 'path';


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
bot.command('admin', commandAdmin);
bot.command('menu', commandMenu);
bot.command('support', commandSupport);
bot.command('contacts', commandContacts);


bot.on("edited_message", async (ctx) => {
  // Get the new, edited, text of the message.
  const editedText = ctx.msg.text;
  console.log(`editedText: ${editedText}`);
});

bot.hears('🎉 Хочу співпрацювати', async (ctx) => {
  await ctx.conversation.enter('collaborateConversation')
})

bot.hears('📍 Локація', async (ctx) => {
  const filePath = path.resolve(__dirname, './assets/reload_hub_map.jpg');

  await ctx.replyWithPhoto(new InputFile(filePath));
  await ctx.reply(
    '♻️ ReLoad Hub\n' +
    '🕐 Пн–Пт: 10:00–19:00\n' +
    '🕐 Сб: 10:00–14:00\n\n' +
    '📍 вулиця Степана Тільги, 34д, Кривий Ріг',
    {
      reply_markup: new InlineKeyboard().url(
        'Відкрити в Google Maps',
        'https://maps.app.goo.gl/39eRpcrv59hNyftx9'
      )
    }
  );
})

bot.hears('🚚 Виклик за сировиною', async (ctx) => {
  console.log('🚚 Виклик за сировиною')
})

bot.hears('🛠 Як підготувати сировину', async (ctx) => {
  console.log('🛠 Як підготувати сировину')
})

bot.hears('💰 Ціни на сировину', async (ctx) => {
  console.log('💰 Ціни на сировину')
})

bot.hears('📝 Контакти', async (ctx) => {
  await ctx.reply(
    `📍 <b>ReLoad Hub</b>\n` +
    `♻️ Пункт прийому вторсировини\n\n` +
    `🕐 <b>Графік:</b>\nПн–Пт: 10:00–19:00\nСб: 10:00–14:00\n\n` +
    `📞 <b>Телефон:</b> <a href="tel:+380686593591">068 659 3591</a>\n` +
    `📸 <b>Instagram:</b> <a href="https://instagram.com/reload_hub">@reload_hub</a>\n` +
    `🎵 <b>TikTok:</b> <a href="https://tiktok.com/@reloadhubkr">@reloadhubkr</a>\n\n` +
    `📦 <i>Надсилай Новою поштою або принось особисто!</i>`,
    {
      parse_mode: 'HTML',
      reply_markup: new InlineKeyboard().text('📍 Показати локацію', 'show_location')
    }
  );
});

bot.on('message:text', async ctx => {
  const txt = ctx.message.text;
  const isAdmin = ctx.chat.id === Number(adminId);

  try {
    if (isAdmin && ctx.msg.reply_to_message?.forward_origin?.type === 'user') {
      const replyFromId = ctx.msg.reply_to_message.forward_origin.sender_user.id;
      await ctx.api.sendMessage(replyFromId, ctx.msg.text);
      return;
    }

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
