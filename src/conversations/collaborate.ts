// src/conversations/collaborate.ts
import { Conversation } from "@grammyjs/conversations";
import { Keyboard } from "grammy";
import { mainMenuKeyboard, MyContext } from "../index";

// Главное имя экспорта – совпадает с createConversation(...)
export async function collaborateConversation(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  // Гарантируем, что в сессии есть объект collab
  if (!ctx.session) {
    ctx.session = {collab: { type: "", region: "", contact: "" }};
  }

  // 1) Спрашиваем название компании (раньше был «тип»)
  const typeKb = new Keyboard()
    .text("Ресторан").text("Магазин").row()
    .text("Виробництво").text("ОСББ").text("Інше").resized().oneTime()
  await ctx.reply("🎉 Оберіть, будь ласка, тип вашого бізнесу:", { reply_markup: typeKb });
  const nameMsg = await conversation.waitFor("message:text");
  // Сохраняем временно в поле type (или создайте новое, если хотите)
  ctx.session.collab.type = nameMsg.message.text;

  // 2) Спрашиваем район со списком кнопок
  const districtKb = new Keyboard()
    .text("Центрально-Міський район").row()
    .text("Тернівський район").row()
    .text("Інгулецький район").row()
    .text("Покровський район").row()
    .text("Довгинцівський район").row()
    .text("Металургійний район").row();
  await ctx.reply("📍 Оберіть ваш район:", { reply_markup: districtKb });
  const districtMsg = await conversation.waitFor("message:text");
  ctx.session.collab.region = districtMsg.message.text;

  // 3) Спрашиваем только телефон и просим через «Поделиться контактом»
  const contactKb = new Keyboard().requestContact("📞 Поділитися номером").row();
  await ctx.reply(
    "Будь ласка, поділіться вашим номером телефону:",
    { reply_markup: contactKb }
  );
  const contactUpdate = await conversation.waitFor("message:contact");
  ctx.session.collab.contact = contactUpdate.message.contact.phone_number;

  // TODO: здесь sheetService.addCollaboration(ctx.session.collab)

  // Подтверждение пользователю
  await ctx.reply(
    `✅ *Дякуємо! Ось дані вашої компанії:* \n` +
    `🏢 *Назва:* ${ctx.session.collab.type}\n` +
    `📍 *Район:* ${ctx.session.collab.region}\n` +
    `📞 *Телефон:* +${ctx.session.collab.contact}`,
    { parse_mode: "Markdown" }
  );

  // Очищаем сессию
  ctx.session.collab.type = "";
  ctx.session.collab.region = "";
  ctx.session.collab.contact = "";

  // Возвращаем в главное меню
  await ctx.reply("Повертаюсь у головне меню:", {
    reply_markup: mainMenuKeyboard,
  });
}
