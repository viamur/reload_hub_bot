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

export const generateAdminStatsMessage = (params: {
  periodLabel: string; // напр. '09.06.2025' или 'Червень 2025'
  pickupCount: number;
  collaborateCount: number;
  newUsersCount: number;
  totalWeightKg: number;
  totalAmount: number;
  topDistricts: { name: string; count: number }[];
}) => {
  const {
    periodLabel,
    pickupCount,
    collaborateCount,
    newUsersCount,
    totalWeightKg,
    totalAmount,
    topDistricts
  } = params;

  const districtsText =
    topDistricts.length > 0
      ? topDistricts
        .map((d, i) => `${i + 1}. ${d.name} (${d.count})`)
        .join("\n")
      : "—";

  return (
    `📊 <b>Статистика за ${periodLabel}</b>\n\n` +
    `🚚 Запити на <i>виклик за сировиною</i>: <b>${pickupCount}</b>\n` +
    `🤝 Запити на <i>співпрацю</i>: <b>${collaborateCount}</b>\n` +
    `👤 Нові користувачі: <b>${newUsersCount}</b>\n\n` +
    `⚖️ Загальна вага: <b>${totalWeightKg.toFixed(1)} кг</b>\n` +
    `💰 Загальна сума: <b>${totalAmount.toFixed(2)} грн</b>\n\n` +
    `📍 <b>ТОП райони:</b>\n${districtsText}`
  );
};
