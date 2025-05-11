import {MyContext} from '../types/types';
import {CommandContext} from 'grammy';
import {getUserFullName} from '../utils/getUserFullName';

export async function commandContacts(ctx: CommandContext<MyContext>) {
  await ctx.reply('contacts');
}
