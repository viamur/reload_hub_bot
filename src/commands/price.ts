import {MyContext} from '../types/types';
import {MaterialPrice} from '../models/MaterialPrice';
import {unitDisplayMap} from '../data/options';

export async function commandPrice(ctx: MyContext) {
  const materials = await MaterialPrice.find({ active: true}).sort({ name: 1 });

  if (!materials.length) {
    await ctx.reply('❗ Наразі немає доступних цін на сировину.');
    return;
  }

  const message =
    "📦 <b>Актуальні ціни на сировину</b>\n\n" +
    materials
      .map((m) => {
        const unit = unitDisplayMap[m.unit] ?? m.unit;
        return `🔹 <b>${m.name}</b>\n  ${m.price.toFixed(2)} грн / ${unit}`;
      })
      .join("\n\n");

  await ctx.reply(message, { parse_mode: "HTML" });
}
