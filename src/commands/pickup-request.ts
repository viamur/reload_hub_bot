import {MyContext} from '../types/types';

export async function commandPickupRequest(ctx: MyContext) {
  await ctx.conversation.enter('pickupRequestConversation')
}
