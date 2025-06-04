import {MyContext} from '../types/types';

export async function commandCollaborate(ctx: MyContext) {
  await ctx.conversation.enter('collaborateConversation')
}
