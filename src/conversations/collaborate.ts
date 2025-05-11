import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../types/types";
import {
  mainMenuKeyboard,
  shareContactKeyboard
} from '../keyboards/replyKeyboards';
import {getUserFullName} from '../utils/getUserFullName';
import {InlineKeyboard} from 'grammy';
import {business_options, district_options} from '../data/options';
require('dotenv').config();

export async function collaborateConversation(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  if (!ctx.session) {
    ctx.session = {collab: { type: "", region: "", contact: "" }};
  }

  // BUSINESS TYPE
  // BUSINESS TYPE
  // BUSINESS TYPE
  await ctx.reply("🏢 *Оберіть тип вашого бізнесу:*", { parse_mode: "Markdown" });
  await ctx.reply("Виберіть один з варіантів:", {
    reply_markup: InlineKeyboard.from(
      business_options.map((btn) => [InlineKeyboard.text(btn, `businessType:${btn}`)])
    ),
  });

  const selectedBusinessTypeOption = await conversation.waitForCallbackQuery(/^businessType:/, {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Будь ласка, використовуйте кнопки для вибору.");
    },
  });

  const selectedType = selectedBusinessTypeOption.callbackQuery.data?.split(":")[1];
  ctx.session.collab.type = selectedType ?? "";
  await selectedBusinessTypeOption.answerCallbackQuery();
  await selectedBusinessTypeOption.editMessageText(`✅ *Тип бізнесу:* ${ctx.session.collab.type}`, { parse_mode: "Markdown" });

  // DISTRICT
  // DISTRICT
  // DISTRICT
  await ctx.reply("📍 *Оберіть район:*", { parse_mode: "Markdown" });
  await ctx.reply("Виберіть один з варіантів:", {
    reply_markup: InlineKeyboard.from(
      district_options.map((btn) => [InlineKeyboard.text(btn, `district:${btn}`)])
    ),
  });

  const districtOption = await conversation.waitForCallbackQuery(/^district:/, {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Будь ласка, використовуйте кнопки для вибору.");
    },
  });
  const selectedDistrict = districtOption.callbackQuery.data?.split(":")[1];
  ctx.session.collab.region = selectedDistrict ?? "";
  await districtOption.answerCallbackQuery();
  await districtOption.editMessageText(`✅ *Район:* ${ctx.session.collab.region}`, { parse_mode: "Markdown" });

  // CONTACT
  // CONTACT
  // CONTACT
  await ctx.reply(
    "Будь ласка, поділіться вашим номером телефону:",
    { reply_markup: shareContactKeyboard.oneTime() }
  );

  const contactUpdate = await conversation.waitFor("message:contact", {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Будь ласка, надішліть номер телефону, натиснувши кнопку поділитись.");
    },
  });

  ctx.session.collab.contact = contactUpdate.message.contact.phone_number;
  await contactUpdate.reply("✅ Дякую! Ваш номер телефону отримано.");

  await ctx.reply(
    `✅ *Дякуємо! Ось дані вашої компанії:* \n` +
    `🏢 *Тип:* ${ctx.session.collab.type} \n` +
    `📍 *Район:* ${ctx.session.collab.region} \n` +
    `📞 *Телефон:* +${ctx.session.collab.contact}`,
    { parse_mode: "Markdown" }
  );

  const data = {
    type: ctx.session.collab.type,
    region: ctx.session.collab.region,
    contact: ctx.session.collab.contact,
    user_name: ctx.from?.username || '',
    full_name: getUserFullName(ctx.from),
    user_id: ctx.from?.id || '-',
    date: new Date().toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    }),
  }

  await ctx.api.sendMessage(+process.env.ADMIN_ID, JSON.stringify(data));


  ctx.session.collab.type = "";
  ctx.session.collab.region = "";
  ctx.session.collab.contact = "";


  return await ctx.reply("Повертаюсь у головне меню:", {
    reply_markup: mainMenuKeyboard,
  });
}
