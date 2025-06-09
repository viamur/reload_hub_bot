import {Conversation} from '@grammyjs/conversations';
import {MyContext} from '../types/types';
import {mainMenuKeyboard, shareContactKeyboard} from '../keyboards/replyKeyboards';
import {InlineKeyboard} from 'grammy';
import {unitDisplayMap} from '../data/options';
import {MaterialPrice, MaterialUnit} from '../models/MaterialPrice';
import {generateMessageMaterialList} from '../utils/generateMessage';
import {sleep} from '../utils/sleep';
require("dotenv").config();

export async function createMaterialConversation(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  while (true) {
    // NAME INPUT
    // NAME INPUT
    // NAME INPUT
    await ctx.reply("✏️ Введіть нову назву сировини:", {
      reply_markup: { remove_keyboard: true }
    });

    const newNameInput = await conversation.form.text();
    const trimmedName = newNameInput.trim();

    if (trimmedName.length < 3) {
      await ctx.reply("❗ Назва має бути не менше 3 символів. Спробуйте ще раз.");
      continue;
    }

    const existingName = await MaterialPrice.findOne({ name: trimmedName });

    if (existingName) {
      await ctx.reply("❗ Сировина з такою назвою вже існує. Спробуйте іншу назву.");
      continue;
    }

    const newMaterial = new MaterialPrice({
      name: trimmedName,
      price: 0
    });

    // PRICE INPUT
    // PRICE INPUT
    // PRICE INPUT
    await ctx.reply("💰 Введіть ціну для сировини (наприклад: 12.34):");

    while (true) {
      const priceInput = await conversation.form.text();
      const parsed = parseFloat(priceInput.trim().replace(",", "."));

      if (!isNaN(parsed) && parsed >= 0) {
        newMaterial.price = parsed;
        break;
      }

      await ctx.reply("❗ Введіть, будь ласка, коректну ціну. Наприклад: 12.34");
    }

    // UNIT SELECTION
    // UNIT SELECTION
    // UNIT SELECTION
    await ctx.reply('📦 Виберіть одиницю виміру сировини:', {
      reply_markup: InlineKeyboard.from(
        Object.entries(unitDisplayMap).map(([unit, display]) => [
          InlineKeyboard.text(display, `unit:${unit}`)
        ])
      )
    })

    const unitAction = await conversation.waitForCallbackQuery(/^unit:/, {
      otherwise: async (ctx) => {
        await ctx.reply("❗ Будь ласка, скористайтесь кнопками для вибору одиниці виміру.");
      }
    })

    await unitAction.answerCallbackQuery();
    const selectedUnit = unitAction.callbackQuery.data?.split(":")[1] as MaterialUnit;

    if (!selectedUnit || !unitDisplayMap[selectedUnit]) {
      await ctx.reply("❗ Невірна одиниця виміру. Спробуйте ще раз.");
      continue;
    }

    await unitAction.editMessageText('✅ Ви обрали одиницю виміру: ' + unitDisplayMap[selectedUnit], {
      parse_mode: "HTML"
    })

    newMaterial.unit = selectedUnit;

    // DESCRIPTION INPUT (optional)
    // DESCRIPTION INPUT (optional)
    // DESCRIPTION INPUT (optional)
    await ctx.reply("📝 Бажаєте додати опис сировини? (поки це системний опис)", {
      reply_markup: InlineKeyboard.from([
        [InlineKeyboard.text("Так", "desc_yes"), InlineKeyboard.text("Ні", "desc_no")]
      ])
    });

    const descDecision = await conversation.waitForCallbackQuery(/^desc_(yes|no)$/, {
      otherwise: async (ctx) => {
        await ctx.reply("❗ Будь ласка, скористайтесь кнопками нижче.");
      }
    });

    await descDecision.answerCallbackQuery();
    const descChoice = descDecision.callbackQuery.data;

    if (descChoice === 'desc_yes') {
      await ctx.reply("✏️ Введіть опис сировини:");
      const descriptionInput = await conversation.form.text();
      newMaterial.description = descriptionInput.trim();
    } else {
      newMaterial.description = '';
    }

    // Save the new material
    await newMaterial.save();

    await ctx.reply(
      `✅ <b>Сировина успішно створена!</b>\n\n` +
      `📦 <b>Назва:</b> ${newMaterial.name}\n` +
      `💰 <b>Ціна:</b> ${newMaterial.price.toFixed(2)} грн / ${unitDisplayMap[newMaterial.unit]}\n` +
      (newMaterial.description
        ? `📝 <b>Опис:</b> ${newMaterial.description.trim()}`
        : `📝 <i>Опис не вказано</i>`),
      {
        parse_mode: 'HTML'
      }
    );

    const materials = await MaterialPrice.find();
    await ctx.reply(generateMessageMaterialList(materials), {
      parse_mode: 'HTML'
    });

    await sleep(2000);

    break;
  }

  // Return to the main menu
  return ctx.reply("Повертаюсь у головне меню:", {
    reply_markup: mainMenuKeyboard.oneTime(),
  });
}
