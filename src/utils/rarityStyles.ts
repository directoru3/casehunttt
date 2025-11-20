export const rarityStyles = {
  common: {
    bg: 'bg-gradient-to-br from-gray-600 to-gray-700',
    border: 'border-gray-500',
    shadow: 'shadow-lg shadow-gray-500/50',
    glow: 'hover:shadow-xl hover:shadow-gray-400/60',
    text: 'text-gray-300'
  },
  uncommon: {
    bg: 'bg-gradient-to-br from-green-600 to-green-700',
    border: 'border-green-500',
    shadow: 'shadow-lg shadow-green-500/50',
    glow: 'hover:shadow-xl hover:shadow-green-400/60',
    text: 'text-green-300'
  },
  rare: {
    bg: 'bg-gradient-to-br from-blue-600 to-blue-700',
    border: 'border-blue-500',
    shadow: 'shadow-lg shadow-blue-500/50',
    glow: 'hover:shadow-xl hover:shadow-blue-400/60',
    text: 'text-blue-300'
  },
  epic: {
    bg: 'bg-gradient-to-br from-purple-600 to-purple-700',
    border: 'border-purple-500',
    shadow: 'shadow-lg shadow-purple-500/50',
    glow: 'hover:shadow-xl hover:shadow-purple-400/60',
    text: 'text-purple-300'
  },
  legendary: {
    bg: 'bg-gradient-to-br from-yellow-500 via-orange-500 to-yellow-600',
    border: 'border-yellow-400',
    shadow: 'shadow-lg shadow-yellow-500/50',
    glow: 'hover:shadow-xl hover:shadow-yellow-400/60 animate-pulse',
    text: 'text-yellow-300'
  }
};

export type Rarity = keyof typeof rarityStyles;

export function getRarityStyle(rarity: string) {
  const normalizedRarity = rarity.toLowerCase() as Rarity;
  return rarityStyles[normalizedRarity] || rarityStyles.common;
}
