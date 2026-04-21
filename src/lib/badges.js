export const BADGES = [
  { id: 'starter',    emoji: '🌱', labelKey: 'badgeStarter',   descKey: 'badgeStarterDesc' },
  { id: 'streak3',    emoji: '🔥', labelKey: 'badgeStreak3',   descKey: 'badgeStreak3Desc' },
  { id: 'streak7',    emoji: '⚡', labelKey: 'badgeStreak7',   descKey: 'badgeStreak7Desc' },
  { id: 'streak30',   emoji: '💎', labelKey: 'badgeStreak30',  descKey: 'badgeStreak30Desc' },
  { id: 'entries10',  emoji: '🦉', labelKey: 'badgeEntries10', descKey: 'badgeEntries10Desc' },
  { id: 'entries50',  emoji: '🌟', labelKey: 'badgeEntries50', descKey: 'badgeEntries50Desc' },
  { id: 'entries100', emoji: '🏆', labelKey: 'badgeEntries100',descKey: 'badgeEntries100Desc' },
]

export function computeBadges({ streak, count }) {
  return BADGES.map(b => ({
    ...b,
    unlocked:
      b.id === 'starter'     ? true :
      b.id === 'streak3'     ? streak >= 3 :
      b.id === 'streak7'     ? streak >= 7 :
      b.id === 'streak30'    ? streak >= 30 :
      b.id === 'entries10'   ? count >= 10 :
      b.id === 'entries50'   ? count >= 50 :
      b.id === 'entries100'  ? count >= 100 :
      false,
  }))
}

export function getAvatar(avatarId) {
  return BADGES.find(b => b.id === avatarId)?.emoji ?? '🌱'
}
