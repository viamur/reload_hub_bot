import {MaterialUnit} from '../models/MaterialPrice';

export const business_options = [
  "Ресторан",
  "Магазин",
  "Виробництво",
  "ОСББ",
  "Інше"
];

export const district_options = [
  "Центрально-Міський район",
  "Тернівський район",
  "Інгулецький район",
  "Покровський район",
  "Довгинцівський район",
  "Металургійний район",
];

export const unitDisplayMap: Record<MaterialUnit, string> = {
  kg: "кг",
  pallet: "палета",
  m3: "м³",
  piece: "шт.",
  bag: "мішок"
};
