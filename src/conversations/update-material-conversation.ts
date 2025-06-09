import {Conversation} from '@grammyjs/conversations';
import {MyContext} from '../types/types';
import {mainMenuKeyboard, shareContactKeyboard} from '../keyboards/replyKeyboards';
import {InlineKeyboard} from 'grammy';
import {unitDisplayMap} from '../data/options';
import {MaterialPrice} from '../models/MaterialPrice';
import {generateMessageMaterialList} from '../utils/generateMessage';
require("dotenv").config();

export async function updateMaterialConversation(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  const count = await MaterialPrice.countDocuments();
  if (count === 0) {
    await ctx.reply("❗ Немає жодної сировини для оновлення. Будь ласка, спочатку створіть сировину.");
    return;
  }

  while (true) {
    const materials = await MaterialPrice.find().lean();

    await ctx.reply(generateMessageMaterialList(materials), { parse_mode: "HTML" });

    const keyboard = InlineKeyboard.from(materials.map((m) => [InlineKeyboard.text(m.name, `material:${m._id}`)]));

    await ctx.reply("📦 *Оберіть тип сировини*:", {
      parse_mode: "Markdown",
      reply_markup: keyboard
    });

    const selectedMaterial = await conversation.waitForCallbackQuery(/^material:/, {
      otherwise: async (ctx) => {
        await ctx.reply("❗ Будь ласка, скористайтесь кнопками для вибору.");
      }
    });

    await selectedMaterial.answerCallbackQuery();
    const materialId = selectedMaterial.callbackQuery.data?.split(":")[1];

    const selectedMaterialData = await MaterialPrice.findById(materialId);
    if (!selectedMaterialData) {
      await ctx.reply("❗ Невірний вибір сировини. Спробуйте ще раз.");
      return;
    }

    await selectedMaterial.editMessageText(`✅ *Ви обрали сировину:* ${selectedMaterialData.name}`, {
      parse_mode: "Markdown"
    });

    await ctx.reply('Які зміни ви хочете внести?', {
      reply_markup: InlineKeyboard.from([
        [InlineKeyboard.text('✏️ Змінити назву', `change_name:${materialId}`)],
        [InlineKeyboard.text('💰 Змінити ціну', `change_price:${materialId}`)],
        [InlineKeyboard.text('🔄 Змінити активність', `change_active:${materialId}`)],
        [InlineKeyboard.text('🔙 Повернутись до списку', `back_to_list:${materialId}`)]
      ])
    })

    const action = await conversation.waitForCallbackQuery(/^(change_price|change_active|back_to_list|change_name):/, {
      otherwise: async (ctx) => {
        await ctx.reply("❗ Будь ласка, скористайтесь кнопками для вибору.");
      }
    });

    await action.answerCallbackQuery();
    const actionType = action.callbackQuery.data?.split(":")[0];

    if (actionType === 'back_to_list') {
      continue;
    }

    switch (actionType) {
      case 'change_name':
        await action.editMessageText('Ви обрали зміну назви для сировини: ' + selectedMaterialData.name);
        await ctx.reply("✏️ Введіть нову назву сировини:");

        const newNameInput = await conversation.form.text();
        const trimmedName = newNameInput.trim();

        if (trimmedName.length < 3) {
          await ctx.reply("❗ Назва має бути не менше 3 символів. Спробуйте ще раз.");
          continue;
        }

        const materialToUpdate = await MaterialPrice.findById(selectedMaterialData._id);
        if (!materialToUpdate) {
          await ctx.reply("❗ Помилка при оновленні сировини. Спробуйте ще раз.");
          return;
        }

        // Update the name
        materialToUpdate.name = trimmedName;
        await materialToUpdate.save();
        await ctx.reply(`✅ Назва сировини оновлена "${selectedMaterialData.name}" => "${trimmedName}`);
        break;
      case 'change_price':
        await action.editMessageText('Ви обрали зміну ціни для сировини: ' + selectedMaterialData.name)
        await ctx.reply("💰 Введіть нову ціну для сировини (наприклад: 12.34):");

        while (true) {
          const priceInput = await conversation.form.text();
          const parsed = parseFloat(priceInput.trim().replace(",", "."));

          if (!isNaN(parsed) && parsed >= 0) {
            const material = await MaterialPrice.findById(selectedMaterialData._id);
            if (!material) {
              await ctx.reply("❗ Помилка при оновленні сировини. Спробуйте ще раз.");
              return;
            }
            // Update the price
            material.price = parsed;
            await material.save();
            await ctx.reply(`✅ Ціна для сировину "${material.name}" оновлена на ${parsed.toFixed(2)} грн.`);
            break;
          }

          await ctx.reply("❗ Введіть, будь ласка, коректну ціну. Наприклад: 12.34");
        }
        break;
      case 'change_active':
        await action.editMessageText('Ви обрали зміну активності для сировини: ' + selectedMaterialData.name);
        await ctx.reply('Виберіть стан сировини:', {
          reply_markup: InlineKeyboard.from([
            [InlineKeyboard.text('✅ Активний', `toggle_active:true`)],
            [InlineKeyboard.text('❌ Неактивний', `toggle_active:false`)],
          ])
        })

        const activeAction = await conversation.waitForCallbackQuery(/^(change_price|toggle_active|back_to_list):/, {
          otherwise: async(ctx) => {
            return ctx.reply("❗ Будь ласка, скористайтесь кнопками для вибору.");
          }
        })

        await activeAction.answerCallbackQuery();
        const activeState = activeAction.callbackQuery.data?.split(":")[1] === 'true';
        const material = await MaterialPrice.findByIdAndUpdate(selectedMaterialData._id, {active: activeState});
        if (!material) {
          await ctx.reply("❗ Помилка при оновленні сировини. Спробуйте ще раз.");
          return;
        }
        await activeAction.editMessageText(`✅ Стан сировини "${material.name}" оновлено на ${activeState ? 'активний' : 'неактивний'}.`)
        break;
      default:
        break;
    }

    await ctx.reply('Хочете внести зміни до іншої сировини?', {
      reply_markup: InlineKeyboard.from([
        [InlineKeyboard.text('Так', 'change_prices')],
        [InlineKeyboard.text('Ні, повернутись до головного меню', 'back_to_menu')]
      ])
    })

    const nextAction = await conversation.waitForCallbackQuery(/^(change_prices|back_to_menu)$/, {
      otherwise: async (ctx) => {
        await ctx.reply("❗ Будь ласка, скористайтесь кнопками для вибору.");
      }
    });

    await nextAction.answerCallbackQuery();
    const nextActionType = nextAction.callbackQuery.data?.split(":")[0];

    if (nextActionType === 'change_prices') {
      await nextAction.editMessageText('Ви обрали зміну цін на сировину. Повертаюсь до списку сировини...');
      continue;
    }

    await nextAction.editMessageText('Дякую за внесені зміни!');
    break;
  }

  // Return to the main menu
  return ctx.reply("Повертаюсь у головне меню:", {
    reply_markup: mainMenuKeyboard.oneTime(),
  });
}
