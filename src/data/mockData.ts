import { Case, Item } from '../lib/supabase';

export const mockCases: Case[] = [
  {
    id: '1',
    name: 'Starter Pack',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_cursed_Case.png',
    price: 0,
    category: 'free'
  },
  {
    id: '2',
    name: 'Gold Collection',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_newgift_500x500_2.png',
    price: 5,
    category: 'new'
  },
  {
    id: '3',
    name: 'Diamond Case',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_g63amg.webp',
    price: 10,
    category: 'high'
  },
  {
    id: '4',
    name: 'Bronze Box',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_proche911.webp',
    price: 2,
    category: 'low'
  },
  {
    id: '5',
    name: 'Silver Mystery',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_urus_2.webp',
    price: 3,
    category: 'low'
  },
  {
    id: '6',
    name: 'Platinum Elite',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_kotiki.webp',
    price: 15,
    category: 'high'
  },
  {
    id: '7',
    name: 'Crystal Vault',
    image_url: 'https://images.giftsbattle.com/case/venom.webp',
    price: 8,
    category: 'new'
  },
  {
    id: '8',
    name: 'Ruby Treasure',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_blood_night_DMWAixi.png',
    price: 12,
    category: 'high'
  }
];

export const mockItems: Record<string, Item[]> = {
  '1': [
    { id: 'i1', name: 'Надгробный камень', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Gravestone.webp', rarity: 'common', price: 1.2 },
    { id: 'i3', name: 'Бумажный самолетик', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Plane.webp', rarity: 'rare', price: 5.8 }
  ],
  '2': [
    { id: 'i4', name: 'Plush Pepe Raphael', image_url: 'https://images.giftsbattle.com/item/65349e0f3a63466e9bbc363d7fba12cc_Plush_Pepe_Raphael.webp', rarity: 'uncommon', price: 3.2 },
    { id: 'i5', name: 'REDO', image_url: 'https://images.giftsbattle.com/item/redo_new3.webp', rarity: 'uncommon', price: 2.9 },
    { id: 'i6', name: 'Epic Gold', image_url: 'https://images.pexels.com/photos/1054041/pexels-photo-1054041.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'epic', price: 12.5 }
  ],
  '3': [
    { id: 'i7', name: 'Diamond NFT', image_url: 'https://images.pexels.com/photos/1616401/pexels-photo-1616401.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'legendary', price: 29.7 },
    { id: 'i8', name: 'Crystal Gem', image_url: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'epic', price: 15.3 },
    { id: 'i9', name: 'Rare Diamond', image_url: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'rare', price: 7.4 }
  ],
  '4': [
    { id: 'i10', name: 'Bronze Medal', image_url: 'https://images.pexels.com/photos/3825517/pexels-photo-3825517.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'common', price: 0.8 },
    { id: 'i11', name: 'Bronze Star', image_url: 'https://images.pexels.com/photos/2385477/pexels-photo-2385477.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'uncommon', price: 2.5 },
    { id: 'i12', name: 'Bronze Elite', image_url: 'https://images.pexels.com/photos/1562978/pexels-photo-1562978.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'rare', price: 6.2 }
  ],
  '5': [
    { id: 'i13', name: 'Silver Coin', image_url: 'https://images.pexels.com/photos/1666073/pexels-photo-1666073.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'uncommon', price: 3.7 },
    { id: 'i14', name: 'Silver Badge', image_url: 'https://images.pexels.com/photos/210607/pexels-photo-210607.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'uncommon', price: 3.1 },
    { id: 'i15', name: 'Silver Crown', image_url: 'https://images.pexels.com/photos/1405392/pexels-photo-1405392.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'epic', price: 11.8 }
  ],
  '6': [
    { id: 'i16', name: 'Platinum Ring', image_url: 'https://images.pexels.com/photos/844928/pexels-photo-844928.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'legendary', price: 35.2 },
    { id: 'i17', name: 'Platinum Trophy', image_url: 'https://images.pexels.com/photos/1113554/pexels-photo-1113554.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'epic', price: 18.9 },
    { id: 'i18', name: 'Platinum Star', image_url: 'https://images.pexels.com/photos/952594/pexels-photo-952594.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'legendary', price: 42.5 }
  ],
  '7': [
    { id: 'i19', name: 'Crystal Shard', image_url: 'https://images.pexels.com/photos/2893685/pexels-photo-2893685.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'rare', price: 8.3 },
    { id: 'i20', name: 'Crystal Heart', image_url: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'epic', price: 14.7 },
    { id: 'i21', name: 'Crystal Crown', image_url: 'https://images.pexels.com/photos/265856/pexels-photo-265856.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'legendary', price: 31.4 }
  ],
  '8': [
    { id: 'i22', name: 'Ruby Stone', image_url: 'https://images.pexels.com/photos/1121123/pexels-photo-1121123.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'epic', price: 16.2 },
    { id: 'i23', name: 'Ruby Jewel', image_url: 'https://images.pexels.com/photos/1616403/pexels-photo-1616403.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'legendary', price: 38.6 },
    { id: 'i24', name: 'Ruby Treasure', image_url: 'https://images.pexels.com/photos/3673958/pexels-photo-3673958.jpeg?auto=compress&cs=tinysrgb&w=200', rarity: 'legendary', price: 45.9 }
  ]
};

export const getAllItems = (): Item[] => {
  return Object.values(mockItems).flat();
};
