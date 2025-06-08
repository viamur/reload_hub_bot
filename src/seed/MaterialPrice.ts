import {MaterialPrice} from '../models/MaterialPrice';

const initialMaterials = [
  {
    name: 'Картон',
    price: 3,
    active: true
  },
  {
    name: 'Бумага',
    price: 3,
    active: true
  },
  {
    name: 'Стрейч',
    price: 8,
    active: true
  },
  {
    name: 'Пэт',
    price: 4,
    active: true
  }
];

export async function initMaterialPrices() {
  const count = await MaterialPrice.countDocuments()
  if (count > 0) {
    console.log('🟡 Material prices already initialized');
    return;
  }

  await MaterialPrice.insertMany(initialMaterials);

  console.log('✅ Material prices initialized');
}
