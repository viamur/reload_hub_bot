import {Keyboard} from 'grammy';

export const mainMenuKeyboard = new Keyboard()
  .text('🎉 Хочу співпрацювати').text('📍 Локація').row()
  .text('🚚 Виклик за сировиною').row()
  .text('🛠 Як підготувати сировину').row()
  .text('💰 Ціни на сировину').text('📝 Контакти').resized()

export const shareContactKeyboard = new Keyboard().requestContact("📞 Поділитися номером").row().resized();
