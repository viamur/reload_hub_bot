import type {Context, SessionFlavor} from 'grammy';
import type {ConversationFlavor} from '@grammyjs/conversations';

export type MySession = {
  collab: { type: string; region: string; contact: string };
}

type Session = Context & SessionFlavor<MySession>;

export type MyContext = ConversationFlavor<Session>;
