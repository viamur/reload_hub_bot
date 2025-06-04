import path from 'path';
import {InlineKeyboard, InputFile} from 'grammy';
import {MyContext} from '../types/types';

export async function commandLocation(ctx: MyContext) {
  const filePath = path.resolve(__dirname, '../assets/reload_hub_map.jpg');

  await ctx.replyWithPhoto(new InputFile(filePath));
  await ctx.reply(
    '♻️ ReLoad Hub\n' +
    '🕐 Пн–Пт: 10:00–19:00\n' +
    '🕐 Сб: 10:00–14:00\n\n' +
    '📍 вулиця Степана Тільги, 34д',
    {
      reply_markup: new InlineKeyboard().url(
        'Відкрити в Google Maps',
        'https://maps.app.goo.gl/39eRpcrv59hNyftx9'
      )
    }
  );
}
