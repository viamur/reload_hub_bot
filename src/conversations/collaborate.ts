import { Conversation } from "@grammyjs/conversations";
import { MyContext } from "../index";
import {
  businessTypeKeyboard,
  districtMenuKeyboard,
  mainMenuKeyboard,
  shareContactKeyboard
} from '../keyboards/keyBoards';
const adminId = process.env.ADMIN_ID;

export async function collaborateConversation(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  if (!ctx.session) {
    ctx.session = {collab: { type: "", region: "", contact: "" }};
  }

  await ctx.reply("🎉 Оберіть, будь ласка, тип вашого бізнесу:", { reply_markup: businessTypeKeyboard.oneTime() });
  const nameMsg = await conversation.waitFor("message:text");
  ctx.session.collab.type = nameMsg.message.text;

  await ctx.reply("📍 Оберіть ваш район:", { reply_markup: districtMenuKeyboard.oneTime() });
  const districtMsg = await conversation.waitFor("message:text");
  ctx.session.collab.region = districtMsg.message.text;

  await ctx.reply(
    "Будь ласка, поділіться вашим номером телефону:",
    { reply_markup: shareContactKeyboard }
  );
  const contactUpdate = await conversation.waitFor("message:contact");
  ctx.session.collab.contact = contactUpdate.message.contact.phone_number;

  // TODO: здесь sheetService.addCollaboration(ctx.session.collab)

  await ctx.reply(
    `✅ *Дякуємо! Ось дані вашої компанії:* \n` +
    `🏢 *Тип:* ${ctx.session.collab.type}\n` +
    `📍 *Район:* ${ctx.session.collab.region}\n` +
    `📞 *Телефон:* +${ctx.session.collab.contact}`,
    { parse_mode: "Markdown" }
  );

  if (adminId) {
    await ctx.api.sendMessage(adminId,
    `✅*Заявка на співпрацю:*\n` +
    `*Тип:* ${ctx.session.collab.type}\n` +
    `*Район:* ${ctx.session.collab.region}\n` +
    `*Телефон:* +${ctx.session.collab.contact}\n\n` +
    `*USER_NAME:* ${ctx.from?.username || ''}\n` +
    `*FULL_NAME:* ${ctx.from?.first_name} ${ctx.from?.last_name || ''}\n` +
    `*ID:* ${ctx.from?.id}\n` +
    `*DATE:* ${new Date().toLocaleDateString('uk-UA', {
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
      hour: '2-digit',
      minute: '2-digit',
    })}`,
      { parse_mode: "Markdown" });
  }


  ctx.session.collab.type = "";
  ctx.session.collab.region = "";
  ctx.session.collab.contact = "";


  await ctx.reply("Повертаюсь у головне меню:", {
    reply_markup: mainMenuKeyboard,
  });
}
