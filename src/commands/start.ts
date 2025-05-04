import {MyContext} from '../types/types';
import {User} from '../models/User';
import {mainMenuKeyboard} from '../keyboards/replyKeyboards';

export async function commandStart(ctx: MyContext) {
  if (!ctx.from) {
    return ctx.reply('User info is not available');
  }

  const {id, first_name, username} = ctx.from;

  try {
    const user = await User.findOne({ telegramId: id });
    if (!user) {
      const newUser = new User({
        telegramId: id,
        firstName: first_name,
        startBotAttempts: 1,
        username,
      })
      await newUser.save();
      await ctx.reply('Ласкаво просимо до бота з прийому вторсировини!');
    } else {
      user.startBotAttempts += 1;
      await user.save();
      await ctx.reply('Вітаємо знову у боті з прийому вторсировини!');
    }

    await ctx.reply(
      'Оберіть необхідний розділ з меню нижче 👇',
      { reply_markup: mainMenuKeyboard }
    );
  } catch (error) {
    console.error('❌--Error while saving user:', error);
    return ctx.reply('Виникла помилка під час збереження вашої інформації. Спробуйте ще раз пізніше.');
  }
}
