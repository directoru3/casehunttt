import { Case, Item } from '../lib/supabase';

export const mockCases: Case[] = [
  {
    id: 'free-gift',
    name: 'Free Gift',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_cursed_Case.png',
    price: 0,
    category: 'free'
  },
  {
    id: '1',
    name: 'Starter Pack',
    image_url: 'https://images.giftsbattle.com/case/giftsbattle_newgift_500x500_2.png',
    price: 1,
    category: 'low'
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
  'free-gift': [
    { id: 'fg1', name: 'Бронзовая монета', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenStar.webp', rarity: 'common', price: 0.1 },
    { id: 'fg2', name: 'Старый ключ', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedStar.webp', rarity: 'common', price: 0.15 },
    { id: 'fg3', name: 'Деревянный амулет', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Delicious_Cake.webp', rarity: 'common', price: 0.2 },
    { id: 'fg4', name: 'Простой камень', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueStar.webp', rarity: 'common', price: 0.25 },
    { id: 'fg5', name: 'Потертая карта', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TelegramPremiumStar.webp', rarity: 'common', price: 0.3 },
    { id: 'fg6', name: 'Серебряный шарик', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PinkHeart.webp', rarity: 'uncommon', price: 0.4 },
    { id: 'fg7', name: 'Магическая свеча', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedHeart.webp', rarity: 'uncommon', price: 0.5 },
    { id: 'fg8', name: 'Lucky Charm', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/CongratulationsCake.webp', rarity: 'uncommon', price: 0.6 },
    { id: 'fg9', name: 'Золотая нить', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/OrangeHeart.webp', rarity: 'uncommon', price: 0.7 },
    { id: 'fg10', name: 'Древний свиток', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenHeart.webp', rarity: 'rare', price: 0.9 },
    { id: 'fg11', name: 'Кристальная слеза', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueHeart.webp', rarity: 'rare', price: 1.1 },
    { id: 'fg12', name: 'Сияющий осколок', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Jackpot.webp', rarity: 'rare', price: 1.3 },
    { id: 'fg13', name: 'Магическое перо', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Macaron.webp', rarity: 'epic', price: 2.0 },
    { id: 'fg14', name: 'Звездный камень', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pinata.webp', rarity: 'epic', price: 2.5 },
    { id: 'fg15', name: 'Легендарный талисман', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SlotMachine.webp', rarity: 'legendary', price: 4.0 }
  ],
  '1': [
    { id: 's1', name: 'Деревянная шкатулка', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Gravestone.webp', rarity: 'common', price: 0.5 },
    { id: 's2', name: 'Медная подкова', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Plane.webp', rarity: 'common', price: 0.7 },
    { id: 's3', name: 'Железный щит', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/WatermelonSeed.webp', rarity: 'common', price: 0.8 },
    { id: 's4', name: 'Стеклянный шар', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Champagne.webp', rarity: 'common', price: 0.9 },
    { id: 's5', name: 'Бронзовый меч', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Ghost.webp', rarity: 'common', price: 1.0 },
    { id: 's6', name: 'Серебряная цепь', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TeddyBear.webp', rarity: 'uncommon', price: 1.3 },
    { id: 's7', name: 'Золотая монета', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PizzaSlice.webp', rarity: 'uncommon', price: 1.5 },
    { id: 's8', name: 'Рунный камень', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Firecracker.webp', rarity: 'uncommon', price: 1.8 },
    { id: 's9', name: 'Волшебное кольцо', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pumpkin.webp', rarity: 'uncommon', price: 2.0 },
    { id: 's10', name: 'Изумрудная брошь', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChristmasTree.webp', rarity: 'rare', price: 2.8 },
    { id: 's11', name: 'Сапфировый кулон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Snowman.webp', rarity: 'rare', price: 3.5 },
    { id: 's12', name: 'Рубиновая корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SantaClaus.webp', rarity: 'rare', price: 4.0 },
    { id: 's13', name: 'Алмазная звезда', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/FireworksDisplay.webp', rarity: 'epic', price: 6.0 },
    { id: 's14', name: 'Платиновый трофей', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChampagneParty.webp', rarity: 'epic', price: 7.5 },
    { id: 's15', name: 'Королевский скипетр', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GoldenPremiumStar.webp', rarity: 'legendary', price: 12.0 }
  ],
  '2': [
    { id: 'g1', name: 'Золотой слиток', image_url: 'https://images.giftsbattle.com/item/65349e0f3a63466e9bbc363d7fba12cc_Plush_Pepe_Raphael.webp', rarity: 'common', price: 2.0 },
    { id: 'g2', name: 'Янтарная фигурка', image_url: 'https://images.giftsbattle.com/item/redo_new3.webp', rarity: 'common', price: 2.3 },
    { id: 'g3', name: 'Медная статуэтка', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/WatermelonSeed.webp', rarity: 'common', price: 2.6 },
    { id: 'g4', name: 'Серебряный кубок', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Champagne.webp', rarity: 'common', price: 2.9 },
    { id: 'g5', name: 'Золотой браслет', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Ghost.webp', rarity: 'uncommon', price: 4.0 },
    { id: 'g6', name: 'Жемчужное ожерелье', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TeddyBear.webp', rarity: 'uncommon', price: 4.5 },
    { id: 'g7', name: 'Топазовый перстень', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PizzaSlice.webp', rarity: 'uncommon', price: 5.0 },
    { id: 'g8', name: 'Аметистовая диадема', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Firecracker.webp', rarity: 'uncommon', price: 5.8 },
    { id: 'g9', name: 'Платиновая печать', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pumpkin.webp', rarity: 'rare', price: 7.5 },
    { id: 'g10', name: 'Нефритовый дракон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChristmasTree.webp', rarity: 'rare', price: 8.5 },
    { id: 'g11', name: 'Опаловый талисман', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Snowman.webp', rarity: 'rare', price: 9.5 },
    { id: 'g12', name: 'Бриллиантовый перстень', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SantaClaus.webp', rarity: 'epic', price: 13.0 },
    { id: 'g13', name: 'Сапфировая тиара', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/FireworksDisplay.webp', rarity: 'epic', price: 16.0 },
    { id: 'g14', name: 'Изумрудная корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChampagneParty.webp', rarity: 'epic', price: 18.0 },
    { id: 'g15', name: 'Императорская регалия', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GoldenPremiumStar.webp', rarity: 'legendary', price: 28.0 }
  ],
  '3': [
    { id: 'd1', name: 'Алмазная пыль', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenStar.webp', rarity: 'common', price: 5.0 },
    { id: 'd2', name: 'Кристальный осколок', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedStar.webp', rarity: 'common', price: 6.0 },
    { id: 'd3', name: 'Бриллиантовая крошка', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Delicious_Cake.webp', rarity: 'common', price: 7.0 },
    { id: 'd4', name: 'Лунный камень', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueStar.webp', rarity: 'common', price: 8.0 },
    { id: 'd5', name: 'Звездная пыль', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TelegramPremiumStar.webp', rarity: 'uncommon', price: 11.0 },
    { id: 'd6', name: 'Метеоритный фрагмент', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PinkHeart.webp', rarity: 'uncommon', price: 13.0 },
    { id: 'd7', name: 'Космический кристалл', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedHeart.webp', rarity: 'uncommon', price: 14.5 },
    { id: 'd8', name: 'Небесное сердце', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/CongratulationsCake.webp', rarity: 'uncommon', price: 15.0 },
    { id: 'd9', name: 'Алмазная звезда', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/OrangeHeart.webp', rarity: 'rare', price: 20.0 },
    { id: 'd10', name: 'Кристальное сердце', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenHeart.webp', rarity: 'rare', price: 23.0 },
    { id: 'd11', name: 'Радужный бриллиант', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueHeart.webp', rarity: 'rare', price: 25.0 },
    { id: 'd12', name: 'Вечный кристалл', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Jackpot.webp', rarity: 'epic', price: 32.0 },
    { id: 'd13', name: 'Божественный алмаз', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Macaron.webp', rarity: 'epic', price: 38.0 },
    { id: 'd14', name: 'Космическая корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pinata.webp', rarity: 'epic', price: 42.0 },
    { id: 'd15', name: 'Трон бесконечности', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SlotMachine.webp', rarity: 'legendary', price: 62.0 }
  ],
  '4': [
    { id: 'b1', name: 'Бронзовая руда', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Gravestone.webp', rarity: 'common', price: 1.0 },
    { id: 'b2', name: 'Старая подкова', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Plane.webp', rarity: 'common', price: 1.2 },
    { id: 'b3', name: 'Медная пластина', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/WatermelonSeed.webp', rarity: 'common', price: 1.3 },
    { id: 'b4', name: 'Железный гвоздь', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Champagne.webp', rarity: 'common', price: 1.4 },
    { id: 'b5', name: 'Бронзовый щит', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Ghost.webp', rarity: 'common', price: 1.5 },
    { id: 'b6', name: 'Медная монета', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TeddyBear.webp', rarity: 'uncommon', price: 2.2 },
    { id: 'b7', name: 'Бронзовый шлем', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PizzaSlice.webp', rarity: 'uncommon', price: 2.5 },
    { id: 'b8', name: 'Железная кольчуга', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Firecracker.webp', rarity: 'uncommon', price: 2.8 },
    { id: 'b9', name: 'Медный меч', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pumpkin.webp', rarity: 'uncommon', price: 3.0 },
    { id: 'b10', name: 'Бронзовая корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChristmasTree.webp', rarity: 'rare', price: 4.5 },
    { id: 'b11', name: 'Железный трон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Snowman.webp', rarity: 'rare', price: 5.5 },
    { id: 'b12', name: 'Медная звезда', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SantaClaus.webp', rarity: 'rare', price: 6.0 },
    { id: 'b13', name: 'Бронзовый скипетр', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/FireworksDisplay.webp', rarity: 'epic', price: 8.0 },
    { id: 'b14', name: 'Железная регалия', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChampagneParty.webp', rarity: 'epic', price: 9.5 },
    { id: 'b15', name: 'Легендарный молот', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GoldenPremiumStar.webp', rarity: 'legendary', price: 16.0 }
  ],
  '5': [
    { id: 'si1', name: 'Серебряная пыль', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenStar.webp', rarity: 'common', price: 1.5 },
    { id: 'si2', name: 'Лунный осколок', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedStar.webp', rarity: 'common', price: 1.8 },
    { id: 'si3', name: 'Серебряная нить', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Delicious_Cake.webp', rarity: 'common', price: 2.0 },
    { id: 'si4', name: 'Стальной клинок', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueStar.webp', rarity: 'common', price: 2.3 },
    { id: 'si5', name: 'Серебряный амулет', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TelegramPremiumStar.webp', rarity: 'common', price: 2.5 },
    { id: 'si6', name: 'Лунный кулон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PinkHeart.webp', rarity: 'uncommon', price: 3.3 },
    { id: 'si7', name: 'Серебряная диадема', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedHeart.webp', rarity: 'uncommon', price: 3.8 },
    { id: 'si8', name: 'Стальная корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/CongratulationsCake.webp', rarity: 'uncommon', price: 4.2 },
    { id: 'si9', name: 'Серебряный трофей', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/OrangeHeart.webp', rarity: 'uncommon', price: 4.5 },
    { id: 'si10', name: 'Лунная звезда', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenHeart.webp', rarity: 'rare', price: 6.0 },
    { id: 'si11', name: 'Серебряное сердце', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueHeart.webp', rarity: 'rare', price: 7.0 },
    { id: 'si12', name: 'Стальной скипетр', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Jackpot.webp', rarity: 'rare', price: 8.0 },
    { id: 'si13', name: 'Серебряная регалия', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Macaron.webp', rarity: 'epic', price: 11.0 },
    { id: 'si14', name: 'Лунный трон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pinata.webp', rarity: 'epic', price: 14.0 },
    { id: 'si15', name: 'Императорское серебро', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SlotMachine.webp', rarity: 'legendary', price: 22.0 }
  ],
  '6': [
    { id: 'p1', name: 'Платиновая крошка', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Gravestone.webp', rarity: 'common', price: 8.0 },
    { id: 'p2', name: 'Белое золото', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Plane.webp', rarity: 'common', price: 9.5 },
    { id: 'p3', name: 'Платиновая нить', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/WatermelonSeed.webp', rarity: 'common', price: 10.5 },
    { id: 'p4', name: 'Звездное серебро', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Champagne.webp', rarity: 'common', price: 12.0 },
    { id: 'p5', name: 'Платиновый слиток', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Ghost.webp', rarity: 'uncommon', price: 16.0 },
    { id: 'p6', name: 'Небесный кристалл', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TeddyBear.webp', rarity: 'uncommon', price: 18.0 },
    { id: 'p7', name: 'Платиновая цепь', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PizzaSlice.webp', rarity: 'uncommon', price: 20.0 },
    { id: 'p8', name: 'Белая корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Firecracker.webp', rarity: 'uncommon', price: 22.0 },
    { id: 'p9', name: 'Платиновый меч', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pumpkin.webp', rarity: 'rare', price: 27.0 },
    { id: 'p10', name: 'Звездный скипетр', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChristmasTree.webp', rarity: 'rare', price: 32.0 },
    { id: 'p11', name: 'Платиновая тиара', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Snowman.webp', rarity: 'rare', price: 35.0 },
    { id: 'p12', name: 'Небесная регалия', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SantaClaus.webp', rarity: 'epic', price: 43.0 },
    { id: 'p13', name: 'Платиновый трон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/FireworksDisplay.webp', rarity: 'epic', price: 50.0 },
    { id: 'p14', name: 'Звездная империя', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChampagneParty.webp', rarity: 'epic', price: 55.0 },
    { id: 'p15', name: 'Божественная платина', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GoldenPremiumStar.webp', rarity: 'legendary', price: 80.0 }
  ],
  '7': [
    { id: 'c1', name: 'Ледяной осколок', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenStar.webp', rarity: 'common', price: 4.0 },
    { id: 'c2', name: 'Морозный кристалл', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedStar.webp', rarity: 'common', price: 5.0 },
    { id: 'c3', name: 'Снежная пыль', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Delicious_Cake.webp', rarity: 'common', price: 5.8 },
    { id: 'c4', name: 'Ледяная игла', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueStar.webp', rarity: 'common', price: 6.5 },
    { id: 'c5', name: 'Кристальный сталагмит', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TelegramPremiumStar.webp', rarity: 'common', price: 7.0 },
    { id: 'c6', name: 'Ледяное сердце', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PinkHeart.webp', rarity: 'uncommon', price: 9.0 },
    { id: 'c7', name: 'Морозная корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/RedHeart.webp', rarity: 'uncommon', price: 10.5 },
    { id: 'c8', name: 'Снежная звезда', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/CongratulationsCake.webp', rarity: 'uncommon', price: 11.5 },
    { id: 'c9', name: 'Ледяной трон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/OrangeHeart.webp', rarity: 'uncommon', price: 12.0 },
    { id: 'c10', name: 'Кристальная тиара', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GreenHeart.webp', rarity: 'rare', price: 16.0 },
    { id: 'c11', name: 'Морозный скипетр', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/BlueHeart.webp', rarity: 'rare', price: 19.0 },
    { id: 'c12', name: 'Снежная регалия', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Jackpot.webp', rarity: 'rare', price: 22.0 },
    { id: 'c13', name: 'Ледяная империя', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Macaron.webp', rarity: 'epic', price: 28.0 },
    { id: 'c14', name: 'Кристальное царство', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pinata.webp', rarity: 'epic', price: 33.0 },
    { id: 'c15', name: 'Вечная зима', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SlotMachine.webp', rarity: 'legendary', price: 52.0 }
  ],
  '8': [
    { id: 'r1', name: 'Рубиновая крошка', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Gravestone.webp', rarity: 'common', price: 6.0 },
    { id: 'r2', name: 'Красный гранат', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Plane.webp', rarity: 'common', price: 7.5 },
    { id: 'r3', name: 'Огненный опал', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/WatermelonSeed.webp', rarity: 'common', price: 8.5 },
    { id: 'r4', name: 'Кровавый алмаз', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Champagne.webp', rarity: 'common', price: 9.5 },
    { id: 'r5', name: 'Рубиновая нить', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Ghost.webp', rarity: 'common', price: 10.0 },
    { id: 'r6', name: 'Красный кристалл', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/TeddyBear.webp', rarity: 'uncommon', price: 13.0 },
    { id: 'r7', name: 'Огненное сердце', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/PizzaSlice.webp', rarity: 'uncommon', price: 15.5 },
    { id: 'r8', name: 'Рубиновая звезда', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Firecracker.webp', rarity: 'uncommon', price: 17.0 },
    { id: 'r9', name: 'Кровавая корона', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Pumpkin.webp', rarity: 'uncommon', price: 18.0 },
    { id: 'r10', name: 'Огненный трон', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChristmasTree.webp', rarity: 'rare', price: 22.0 },
    { id: 'r11', name: 'Рубиновая тиара', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/Snowman.webp', rarity: 'rare', price: 27.0 },
    { id: 'r12', name: 'Красный скипетр', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/SantaClaus.webp', rarity: 'rare', price: 30.0 },
    { id: 'r13', name: 'Огненная регалия', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/FireworksDisplay.webp', rarity: 'epic', price: 38.0 },
    { id: 'r14', name: 'Рубиновая империя', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/ChampagneParty.webp', rarity: 'epic', price: 48.0 },
    { id: 'r15', name: 'Вечное пламя', image_url: 'https://telegifter.ru/wp-content/themes/gifts/assets/img/gifts/aa/GoldenPremiumStar.webp', rarity: 'legendary', price: 72.0 }
  ]
};

export const getAllItems = (): Item[] => {
  return Object.values(mockItems).flat();
};
