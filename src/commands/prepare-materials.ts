import {MyContext} from '../types/types';

export async function commandPrepareMaterials(ctx: MyContext) {
  await ctx.reply(
    '🛠 <b>Як підготувати сировину перед здачею?</b>\n\n' +
    '✅ <b>1. Картон</b> — складений у стопку або зв’язаний. Без залишків їжі чи жирних плям.\n\n' +
    '✅ <b>2. Папір</b> — чистий, без металевих пружин, файлів та пластикових обкладинок.\n\n' +
    '✅ <b>3. ПЕТ пляшки</b> — <u>сплющити</u> та зняти кришечки. Без залишків рідини.\n\n' +
    '✅ <b>4. Жерстяні банки</b> — сполоснути водою, зняти етикетку (якщо можливо).\n\n' +
    '✅ <b>5. Скло</b> — чисте, без кришок. Упакуйте, щоб не розбилось під час транспортування.\n\n' +
    '♻️ Пам’ятай, що <b>чиста сировина = якісна переробка</b>. Дякуємо за свідомість 💚💚💚',
    { parse_mode: 'HTML' }
  );
}
