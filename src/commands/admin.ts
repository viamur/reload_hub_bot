import {MyContext} from '../types/types';
import {CommandContext} from 'grammy';
import {getUserFullName} from '../utils/getUserFullName';

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

  if (adminId === String(ctx.from.id)) {
    await ctx.reply('Welcome, admin!');
  } else {
    console.log(`❌--User ${getUserFullName(ctx.from)} (${ctx.from.id} - ${ctx.from.username}) tried to access admin command.`);
    await ctx.api.sendMessage(adminId, `Користувач ${getUserFullName(ctx.from)} (${ctx.from.id} - ${ctx.from.username}) намагався отримати доступ до адміністративної команди.`);
  }
}
