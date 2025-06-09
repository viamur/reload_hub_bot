import {MiddlewareFn} from 'grammy';
import type {MyContext} from '../types/types';

export const exitConversationOnCommand: MiddlewareFn<MyContext> = async (ctx, next) => {
  if (ctx.message?.text?.startsWith("/")) {
    if ("conversation" in ctx) {
      await ctx.conversation.exit('pickupRequestConversation');
      await ctx.conversation.exit('updateMaterialConversation');
      await ctx.conversation.exit('collaborateConversation');
      await ctx.conversation.exit('createMaterialConversation');
    }
  }
  await next();
};
