import {Keyboard} from 'grammy';

export const mainMenuKeyboard = new Keyboard()
  .text('🎉 Хочу співпрацювати').row()
  .text('📍 Де здати сировину').row()
  .text('🚚 Виклик за сировиною').row()
  .text('🛠 Як підготувати сировину').row()
  .text('💰 Ціни на сировину').text('📝 Залишити заявку').row()
  .text('❓ FAQ').text('🗣 Оператор').resized()

export const districtMenuKeyboard = new Keyboard()
  .text("Центрально-Міський район").row()
  .text("Тернівський район").row()
  .text("Інгулецький район").row()
  .text("Покровський район").row()
  .text("Довгинцівський район").row()
  .text("Металургійний район").row().resized()

export const businessTypeKeyboard = new Keyboard()
  .text("Ресторан").text("Магазин").row()
  .text("Виробництво").text("ОСББ").text("Інше").resized()

export const shareContactKeyboard = new Keyboard().requestContact("📞 Поділитися номером").row();
