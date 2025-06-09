import {MyContext} from '../types/types';
import {CallbackQueryContext, InlineKeyboard} from 'grammy';

export async function commandChangePrices(ctx: CallbackQueryContext<MyContext>) {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('updateMaterialConversation')
}
