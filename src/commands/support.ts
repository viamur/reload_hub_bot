import {MyContext} from '../types/types';
import {CommandContext} from 'grammy';

export async function commandSupport(ctx: CommandContext<MyContext>) {
  ctx.session.timestampSendMessage = Date.now();

  const adminMessage =
    `🔔 Нове звернення до підтримки!\n\n` +
    `👤 Користувач: ${ctx.from?.username || ctx.from?.first_name || 'Анонім'}\n` +
    `🆔 ID: ${ctx.from?.id}\n` +
    `📅 Час: ${new Date().toLocaleString('uk-UA')}\n\n` +
    `⏳ Очікує на відповідь...`;

  await ctx.api.sendMessage(+process.env.ADMIN_ID, adminMessage);
  await ctx.api.forwardMessage(+process.env.ADMIN_ID, ctx.chat.id, ctx.msg.message_id);

  await ctx.reply(
    `📝 Будь ласка, опишіть ваше питання:\n\n` +
    `• Чим можемо допомогти?\n` +
    `• Вкажіть деталі проблеми\n` +
    `• Додайте скріншот, якщо потрібно\n\n` +
    `⌛ Зазвичай ми відповідаємо протягом кількох хвилин \n` +
    `✨ Дякуємо за звернення!`
  );
}
