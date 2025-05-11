import { Document, Schema, model, Types } from 'mongoose';

export interface ICollaboration extends Document {
  user: Types.ObjectId;
  businessType: string;
  region: string;
  contact: string;
  status: 'new' | 'in_progress' | 'done';
  comment?: string;
  code: string;
  createdAt: Date;
  updatedAt: Date;
}

const collaborationSchema = new Schema<ICollaboration>({
  user: {
    type: Schema.Types.ObjectId,
    ref: 'User',
    required: true,
  },
  businessType: {
    type: String,
    required: true,
  },
  region: {
    type: String,
    required: true,
  },
  contact: {
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

export const Collaboration = model<ICollaboration>('Collaboration', collaborationSchema);
