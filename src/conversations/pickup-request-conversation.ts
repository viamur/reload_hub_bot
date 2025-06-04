import {Conversation} from '@grammyjs/conversations';
import {MyContext} from '../types/types';
import {mainMenuKeyboard, shareContactKeyboard} from '../keyboards/replyKeyboards';
import {InlineKeyboard} from 'grammy';
import {district_options} from '../data/options';
import {generateSessionState} from '../session/generateSessionState';

require("dotenv").config();

export async function pickupRequestConversation(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  if (!ctx.session) {
    ctx.session = generateSessionState()
  }

  // CONTACT
  await ctx.reply("📞 Будь ласка, поділіться вашим номером телефону:", {
    reply_markup: shareContactKeyboard.oneTime(),
  });

  const contactUpdate = await conversation.waitFor("message:contact", {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Надішліть номер через кнопку «Поділитись контактом».");
    },
  });

  ctx.session.pickup.phone = contactUpdate.message.contact.phone_number;

  await ctx.reply("✅ Контакт отримано!", {
    reply_markup: { remove_keyboard: true }
  });

  // WEIGHT
  await ctx.reply("⚖️ Вкажіть орієнтовну масу сировини в кг (наприклад: 5.5):");

  while (true) {
    const weightInput = await conversation.form.text();
    const parsed = parseFloat(weightInput.trim().replace(",", "."));

    if (!isNaN(parsed) && parsed > 0) {
      ctx.session.pickup.weight = parsed;
      break;
    }

    await ctx.reply("❗ Введіть, будь ласка, число. Наприклад: 3 або 7.5");
  }

  // PHOTO
  await ctx.reply("📷 Хочете прикріпити фотографію сировини?", {
    reply_markup: new InlineKeyboard()
      .text('Так, надіслати фото', 'add_photo').row()
      .text('Ні, пропустити фото', 'skip_photo')
  });

  const photoOption = await conversation.waitForCallbackQuery(/^add_photo$|^skip_photo$/);
  await photoOption.answerCallbackQuery();

  if (photoOption.callbackQuery.data === 'skip_photo') {
    ctx.session.pickup.photoFileId = "";
    await photoOption.editMessageText('📷❌ Фотографія пропущена.');
  } else if (photoOption.callbackQuery.data === 'add_photo') {
    await photoOption.editMessageText('📷 Будь ласка, надішліть фотографію сировини:');
    const photoUpdate = await conversation.waitFor("message:photo", {
      otherwise: async (ctx) => {
        await ctx.reply("❗ Надішліть саме фото, будь ласка.");
      },
    });

    const largestPhoto = photoUpdate.message.photo?.at(-1);
    ctx.session.pickup.photoFileId = largestPhoto?.file_id || ""

    await ctx.reply('✅ Фотографія отримана!')
  }

  // DISTRICT
  await ctx.reply("📍 *Оберіть район:*", {
    parse_mode: "Markdown",
    reply_markup: InlineKeyboard.from(
      district_options.map((btn) => [InlineKeyboard.text(btn, `pickup_district:${btn}`)])
    ),
  });

  const districtOption = await conversation.waitForCallbackQuery(/^pickup_district:/, {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Будь ласка, скористайтесь кнопками.");
    },
  });

  const selectedDistrict = districtOption.callbackQuery.data?.split(":")[1];
  ctx.session.pickup.region = selectedDistrict || "";

  await districtOption.answerCallbackQuery();
  await districtOption.editMessageText(`✅ *Район:* ${ctx.session.pickup.region}`, {
    parse_mode: "Markdown",
  });

  // SUMMARY
  await ctx.reply(
    `✅ *Ваш запит:*\n\n` +
    `📞 Телефон: +${ctx.session.pickup.phone}\n` +
    `⚖️ Маса: ${ctx.session.pickup.weight}кг\n` +
    `📍 Район: ${ctx.session.pickup.region}`,
    { parse_mode: "Markdown" }
  );

  if (ctx.from) {
    await ctx.api.sendPhoto(+process.env.ADMIN_ID, ctx.session.pickup.photoFileId, {
      caption:
        `📦 *Новий запит на виклик:*\n\n` +
        `👤 *Ім’я:* ${ctx.from.first_name || "-"}\n` +
        `🔗 *Telegram:* @${ctx.from.username || "-"}\n` +
        `🆔 *User ID:* ${ctx.from.id}\n\n` +
        `📞 Телефон: +${ctx.session.pickup.phone}\n` +
        `⚖️ Маса: ${ctx.session.pickup.weight}кг\n` +
        `📍 Район: ${ctx.session.pickup.region}\n\n` +
        `🕓 *Дата:* ${new Date().toLocaleString("uk-UA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}`,
      parse_mode: "Markdown",
    });
  }

  await ctx.reply("✅ *Дякуємо! Ми зв’яжемося з вами найближчим часом.*", {
    parse_mode: "Markdown",
  });

  return ctx.reply("Повертаюсь у головне меню:", {
    reply_markup: mainMenuKeyboard.oneTime(),
  });
}
