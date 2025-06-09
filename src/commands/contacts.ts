import {MyContext} from '../types/types';
import {InlineKeyboard} from 'grammy';

export async function commandContacts(ctx: MyContext) {
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
}
