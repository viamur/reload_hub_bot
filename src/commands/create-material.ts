import {MyContext} from '../types/types';
import {CallbackQueryContext} from 'grammy';

export async function commandCreateMaterial(ctx: CallbackQueryContext<MyContext>) {
  await ctx.answerCallbackQuery();
  await ctx.conversation.enter('createMaterialConversation')
}
