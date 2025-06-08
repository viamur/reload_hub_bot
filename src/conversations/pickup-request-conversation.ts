import {Conversation} from '@grammyjs/conversations';
import {MyContext} from '../types/types';
import {mainMenuKeyboard, shareContactKeyboard} from '../keyboards/replyKeyboards';
import {InlineKeyboard} from 'grammy';
import {district_options} from '../data/options';
import {generateSessionState} from '../session/generateSessionState';
import {MaterialPrice} from '../models/MaterialPrice';
import {User} from '../models/User';
import {PickupRequest} from '../models/PickupRequest';
import {generateCode} from '../utils/generateCode';

require("dotenv").config();

export async function pickupRequestConversation(
  conversation: Conversation<MyContext, MyContext>,
  ctx: MyContext
) {
  if (!ctx.session) {
    ctx.session = generateSessionState()
  }

  // CONTACT
  await ctx.reply("📞 Будь ласка, поділіться вашим номером телефону:", {
    reply_markup: shareContactKeyboard.oneTime(),
  });

  const contactUpdate = await conversation.waitFor("message:contact", {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Надішліть номер через кнопку «Поділитись контактом».");
    },
  });

  ctx.session.pickup.phone = contactUpdate.message.contact.phone_number;

  await ctx.reply("✅ Контакт отримано!", {
    reply_markup: { remove_keyboard: true }
  });

  // MATERIAL TYPE
  const materials = await MaterialPrice.find({ active: true}).sort({ name: 1 });
  const keyboard = InlineKeyboard.from([
    ...materials.map((m) => [InlineKeyboard.text(m.name, `pickup_material:${m._id}`)]),
    [InlineKeyboard.text('♻️ Мікс', 'pickup_material:mix')]
  ]);

  await ctx.reply("📦 *Оберіть тип сировини*:", {
    parse_mode: "Markdown",
    reply_markup: keyboard
  });

  const selectedMaterial = await conversation.waitForCallbackQuery(/^pickup_material:/, {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Будь ласка, скористайтесь кнопками для вибору.");
    }
  });

  await selectedMaterial.answerCallbackQuery();
  const materialId = selectedMaterial.callbackQuery.data?.split(":")[1] || 'mix';

  if (materialId === 'mix') {
    ctx.session.pickup.materialName = 'Мікс сировини';
    await selectedMaterial.editMessageText('✅ *Ви обрали мікс сировини.*', {
      parse_mode: "Markdown"
    })
  } else {
    const selectedMaterialData = await MaterialPrice.findById(materialId);
    if (!selectedMaterialData) {
      await ctx.reply("❗ Невірний вибір сировини. Спробуйте ще раз.");
      return;
    }
    ctx.session.pickup.materialId = materialId;
    ctx.session.pickup.materialName = selectedMaterialData.name;
    ctx.session.pickup.materialPrice = selectedMaterialData.price;
    await selectedMaterial.editMessageText(`✅ *Ви обрали сировину:* ${selectedMaterialData.name}`, {
      parse_mode: "Markdown"
    });
  }

  // WEIGHT
  await ctx.reply("⚖️ Вкажіть орієнтовну масу сировини в кг (наприклад: 5.5):");

  while (true) {
    const weightInput = await conversation.form.text();
    const parsed = parseFloat(weightInput.trim().replace(",", "."));

    if (!isNaN(parsed) && parsed > 0) {
      ctx.session.pickup.weight = parsed;

      if (ctx.session.pickup.materialPrice) {
        ctx.session.pickup.amount = +(parsed * ctx.session.pickup.materialPrice).toFixed(2);
      }

      break;
    }

    await ctx.reply("❗ Введіть, будь ласка, число. Наприклад: 3 або 7.5");
  }

  // PHOTO
  await ctx.reply("📷 Хочете прикріпити фотографію сировини?", {
    reply_markup: new InlineKeyboard()
      .text('Так, надіслати фото', 'add_photo').row()
      .text('Ні, пропустити фото', 'skip_photo')
  });

  const photoOption = await conversation.waitForCallbackQuery(/^add_photo$|^skip_photo$/);
  await photoOption.answerCallbackQuery();

  if (photoOption.callbackQuery.data === 'skip_photo') {
    ctx.session.pickup.photoFileId = "";
    await photoOption.editMessageText('📷❌ Фотографія пропущена.');
  } else if (photoOption.callbackQuery.data === 'add_photo') {
    await photoOption.editMessageText('📷 Будь ласка, надішліть фотографію сировини:');
    const photoUpdate = await conversation.waitFor("message:photo", {
      otherwise: async (ctx) => {
        await ctx.reply("❗ Надішліть саме фото, будь ласка.");
      },
    });

    const largestPhoto = photoUpdate.message.photo?.at(-1);
    ctx.session.pickup.photoFileId = largestPhoto?.file_id || ""

    await ctx.reply('✅ Фотографія отримана!')
  }

  // DISTRICT
  await ctx.reply("📍 *Оберіть район:*", {
    parse_mode: "Markdown",
    reply_markup: InlineKeyboard.from(
      district_options.map((btn) => [InlineKeyboard.text(btn, `pickup_district:${btn}`)])
    ),
  });

  const districtOption = await conversation.waitForCallbackQuery(/^pickup_district:/, {
    otherwise: async (ctx) => {
      await ctx.reply("❗ Будь ласка, скористайтесь кнопками.");
    },
  });

  const selectedDistrict = districtOption.callbackQuery.data?.split(":")[1];
  ctx.session.pickup.region = selectedDistrict || "";

  await districtOption.answerCallbackQuery();
  await districtOption.editMessageText(`✅ *Район:* ${ctx.session.pickup.region}`, {
    parse_mode: "Markdown",
  });

  // SUMMARY
  await ctx.reply(
    `✅ *Ваш запит:*\n\n` +
    `📞 Телефон: +${ctx.session.pickup.phone}\n` +
    '📦 Тип сировини: ' + ctx.session.pickup.materialName + '\n' +
    `⚖️ Маса: ${ctx.session.pickup.weight}кг\n` +
    `📍 Район: ${ctx.session.pickup.region}`,
    { parse_mode: "Markdown" }
  );

  if (ctx.from) {
    const user = await User.findOne({ telegramId: ctx.from.id });
    if (user) {
      if (!user.phone) {
        user.phone = ctx.session.pickup.phone;
        await user.save();
      }

      const counts = await PickupRequest.countDocuments();
      const newPickupRequest = new PickupRequest({
        user: user._id,
        material: ctx.session.pickup.materialId || undefined,
        photoFileId: ctx.session.pickup.photoFileId || undefined,
        amount: ctx.session.pickup.amount,
        phone: ctx.session.pickup.phone,
        weight: ctx.session.pickup.weight,
        region: ctx.session.pickup.region,
        comment: `Тип сировини: ${ctx.session.pickup.materialName}`,
        code: generateCode('PKU', counts + 1),
      })

      await newPickupRequest.save();

      const messageForAdmin =
        `📦 *Новий запит на виклик:*\n\n` +
        `👤 *Ім’я:* ${ctx.from.first_name || "-"}\n` +
        `🔗 *Telegram:* @${ctx.from.username || "-"}\n` +
        `🆔 *User ID:* ${ctx.from.id}\n\n` +
        `📞 Телефон: +${ctx.session.pickup.phone}\n` +
        '📦 Тип сировини: ' + ctx.session.pickup.materialName + '\n' +
        `💰 Сума: ${ctx.session.pickup.amount || 0}грн\n` +
        `⚖️ Маса: ${ctx.session.pickup.weight}кг\n` +
        `📍 Район: ${ctx.session.pickup.region}\n\n` +
        `🕓 *Дата:* ${new Date().toLocaleString("uk-UA", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
          hour: "2-digit",
          minute: "2-digit",
        })}`;

      if (ctx.session.pickup.photoFileId) {
        await ctx.api.sendPhoto(+process.env.ADMIN_ID, ctx.session.pickup.photoFileId, {
          caption: messageForAdmin,
          parse_mode: "Markdown",
        });
      } else {
        await ctx.api.sendMessage(+process.env.ADMIN_ID, messageForAdmin, {
          parse_mode: "Markdown",
        });
      }

      if (ctx.chat) {
        await ctx.api.forwardMessage(+process.env.ADMIN_ID, ctx.chat.id, contactUpdate.message.message_id);
      }
    }
  }

  await ctx.reply("✅ *Дякуємо! Ми зв’яжемося з вами найближчим часом.*", {
    parse_mode: "Markdown",
  });

  return ctx.reply("Повертаюсь у головне меню:", {
    reply_markup: mainMenuKeyboard.oneTime(),
  });
}
