import { Document, Schema, model, Types } from 'mongoose';

export interface IPickupRequest extends Document {
  user: Types.ObjectId;
  material?: Types.ObjectId;
  phone: string;
  photoFileId?: string;
  amount: number;
  weight: number;
  region: string;
  status: 'new' | 'in_progress' | 'done';
  comment?: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const pickupRequestSchema = new Schema<IPickupRequest>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  material: {
    type: Schema.Types.ObjectId,
    ref: 'MaterialPrice',
    required: false,
  },
  photoFileId: {
    type: String,
    required: false,
  },
  amount: {
    type: Number,
    required: false,
    default: 0,
  },
  phone: {
    type: String,
    required: true,
  },
  weight: {
    type: Number,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  status: {
    type: String,
    enum: ['new', 'in_progress', 'done'],
    default: 'new',
  },
  comment: String,
  code: {
    type: String,
    unique: true,
    required: true,
  },
}, {
  timestamps: true
});

export const PickupRequest = model<IPickupRequest>('PickupRequest', pickupRequestSchema);
