import { Document, model, Schema } from 'mongoose';

export interface IUser extends Document {
  telegramId: number;
  firstName: string;
  username: string;
  phone: string;
  comment: string;
  startBotAttempts: number;
  createdAt: Date;
}

const userSchema = new Schema<IUser>({
  telegramId: {
    type: Number,
    required: [true, 'Telegram ID is required'],
    unique: true,
  },
  firstName: {
    type: String
  },
  username: {
    type: String
  },
  phone: {
    type: String
  },
  comment: {
    type: String
  },
  startBotAttempts: {
    type: Number,
    default: 0
  }
}, {
  timestamps: true
})

export const User = model<IUser>('User', userSchema);
