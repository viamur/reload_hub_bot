import type {Context, SessionFlavor} from 'grammy';
import type {ConversationFlavor} from '@grammyjs/conversations';

export type MySession = {
  collab: { type: string; region: string; contact: string };
  pickup: {
    phone: string;
    weight: number;
    photoFileId: string;
    region: string;
    materialId: string;
    materialName: string,
    materialPrice?: number;
    amount?: number;
  };
  timestampSendMessage?: number;
}

type Session = Context & SessionFlavor<MySession>;

export type MyContext = ConversationFlavor<Session>;
