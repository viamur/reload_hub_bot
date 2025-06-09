import { Document, Schema, model } from 'mongoose';

export type MaterialUnit = "kg" | "pallet" | "m3" | "piece" | "bag";
const materialEnums: MaterialUnit[] = ["kg", "pallet", "m3", "piece", "bag"];

export interface IMaterialPrice extends Document {
  name: string;
  description: string;
  unit: MaterialUnit;
  price: number;
  active: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const materialPriceSchema = new Schema<IMaterialPrice>({
  name: {
    type: String,
    required: true
  },
  description: {
    type: String,
    required: false,
    default: ''
  },
  unit: {
    type: String,
    enum: materialEnums,
    default: "kg"
  },
  price: {
    type: Number,
    required: true
  },
  active: {
    type: Boolean,
    default: true
  }
}, {
  timestamps: true
});

export const MaterialPrice = model<IMaterialPrice>('IMaterialPrice', materialPriceSchema);
