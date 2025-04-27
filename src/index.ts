// src/index.ts
import {Conversation, type ConversationFlavor, conversations, createConversation} from '@grammyjs/conversations';
require('dotenv').config();
import { Bot, GrammyError, HttpError, Keyboard, type Context, session, type SessionFlavor } from "grammy";
import { collaborateConversation } from "./conversations/collaborate";


const token = process.env.BOT_TOKEN;
const adminId = process.env.ADMIN_ID;
if (!token) {
  console.error('❌ empty BOT_TOKEN in .env');
  process.exit(1);
}

interface MySession {
  collab: { type: string; region: string; contact: string };
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

type Session = Context & SessionFlavor<MySession>;

export type MyContext = ConversationFlavor<Session>;

const bot = new Bot<MyContext>(token);

bot.use(conversations());
bot.use(session({ initial }))
bot.use(createConversation(collaborateConversation));

bot.command("enter", async (ctx) => {
  // Enter the function "hello" you declared.
  await ctx.conversation.enter("hello");
});

export const mainMenuKeyboard = new Keyboard()
  .text('🎉 Хочу співпрацювати').row()
  .text('📍 Де здати сировину').row()
  .text('🚚 Виклик за сировиною').row()
  .text('🛠 Як підготувати сировину').row()
  .text('💰 Ціни на сировину').text('📝 Залишити заявку').row()
  .text('❓ FAQ').text('🗣 Оператор').resized()

bot.api.setMyCommands([
  { command: 'main_menu', description: 'Головне Меню 📍' },
  { command: 'help',  description: 'Допомога ❓' },
])

bot.hears('ID', async (ctx) => {
  await ctx.reply('ID: ' + ctx.from?.id);
})

bot.command('start', async (ctx) => {
  await ctx.reply(
    'Ласкаво просимо до бота з прийому вторсировини! Оберіть, що вас цікавить:',
    { reply_markup: mainMenuKeyboard }
  );
});

bot.command('main_menu', async (ctx) => {
  await ctx.reply(
    'Оберіть необхідний розділ з меню нижче 👇',
    { reply_markup: mainMenuKeyboard }
  );
});

bot.command('help', async (ctx) => {
  await ctx.reply('help');
});

// bot.hears('ping', async (ctx) => {
//   await ctx.reply('pong', {
//     reply_parameters: {
//       message_id: ctx.msg?.message_id
//     }
//   });
// })

bot.on("edited_message", async (ctx) => {
  // Get the new, edited, text of the message.
  const editedText = ctx.msg.text;
  console.log(`editedText: ${editedText}`);
});


bot.on('message:text', async ctx => {
  const txt = ctx.message.text;
  switch (txt) {
    case '🎉 Хочу співпрацювати':
      await ctx.conversation.enter('collaborateConversation')
      break;
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
      if (adminId) {
        const fullName = `${ctx.from?.first_name || ''} ${ctx.from?.last_name || ''}`.trim();
        await ctx.api.sendMessage(adminId, `Новое сообщение от ${fullName}: ${ctx.message.text}`);
      }
      return;
  }
});

bot.catch((err) => {
  const ctx = err.ctx;
  console.error(`Error while handling update ${ctx.update.update_id}:`);
  const error = err.error;

  if (error instanceof GrammyError) {
    console.error('⚠️ Error in request:', error.description);
  } else if (error instanceof HttpError) {
    console.error('⚠️ Could not contact Telegram:', error);
  } else {
    console.error('⚠️ Unknown error:', error);
  }
})

// Запуск бота
bot.start()
  .then(() => console.log('✅ Бот запущен'))
  .catch(err => console.error('Ошибка при запуске бота:', err));
