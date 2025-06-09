import {MyContext} from '../types/types';
import {CommandContext, InlineKeyboard} from 'grammy';

export async function commandAdmin(ctx: CommandContext<MyContext>) {
  const adminId = process.env.ADMIN_ID;

  if (!adminId) {
    console.error('❌--empty ADMIN_ID in .env');
    return;
  }

  if (!ctx.from) {
    console.error('❌--ctx.from is undefined');
    return;
  }

  if (+adminId === ctx.from.id) {
    await ctx.reply('Привіт, Адмін!', {
      reply_markup: new InlineKeyboard()
        .text('➕ Додати Сировину', 'create_material').row()
        .text('🛠 Редагування Сировини', 'update_material').row()
        .text('📊 Статистика за день', 'daily_stats').row()
        .text('📅 Статистика за місяць', 'monthly_stats').row()
    });
  } else {
    console.log(`❌--User ${ctx.from.first_name} (${ctx.from.id} - ${ctx.from.username}) tried to access admin command.`);
    await ctx.api.sendMessage(adminId, `Користувач ${ctx.from.first_name} (${ctx.from.id} - ${ctx.from.username}) намагався отримати доступ до адміністративної команди.`);
  }
}
