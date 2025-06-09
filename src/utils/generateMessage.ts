import {IMaterialPrice} from '../models/MaterialPrice';
import {unitDisplayMap} from '../data/options';

export const generateMessageMaterialList = (materials: IMaterialPrice[]) => {
  return "📦 <b>Список матеріалів:</b>\n\n" +
    materials
      .map((m) => {
        const unit = unitDisplayMap[m.unit] ?? m.unit;
        const priceStr = `${m.price.toFixed(2)} грн / ${unit}`;
        const status = m.active ? '✅ Активний' : '❌ Неактивний';
        const desc = m.description?.trim()
          ? ` — ${m.description.trim()}`
          : '';
        return `🔹 <b>${m.name}</b>: ${priceStr} | ${status}${desc}`;
      })
      .join("\n");
};
