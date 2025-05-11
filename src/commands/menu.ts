import {MyContext} from '../types/types';
import {CommandContext} from 'grammy';
import {mainMenuKeyboard} from '../keyboards/replyKeyboards';

export async function commandMenu(ctx: CommandContext<MyContext>) {
  await ctx.reply(
    'Оберіть необхідний розділ з меню нижче 👇',
    { reply_markup: mainMenuKeyboard }
  );
}
