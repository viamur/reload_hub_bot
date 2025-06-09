import {MyContext} from '../types/types';
import {CallbackQueryContext} from 'grammy';

export async function commandUpdateMaterial(ctx: CallbackQueryContext<MyContext>) {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('updateMaterialConversation')
}
