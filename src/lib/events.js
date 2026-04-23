export const LIFE_EVENTS = [
  { id: 'celebration', emoji: '🎉', fr: 'Célébration',     en: 'Celebration' },
  { id: 'goodnews',    emoji: '🎊', fr: 'Bonne nouvelle',  en: 'Good news' },
  { id: 'achievement', emoji: '🏆', fr: 'Réussite',        en: 'Achievement' },
  { id: 'love',        emoji: '💕', fr: 'Rencontre',       en: 'New love' },
  { id: 'trip',        emoji: '✈️', fr: 'Voyage',          en: 'Travel' },
  { id: 'exam',        emoji: '📝', fr: 'Examen',          en: 'Exam' },
  { id: 'work',        emoji: '💼', fr: 'Stress travail',  en: 'Work stress' },
  { id: 'argument',    emoji: '😤', fr: 'Dispute',         en: 'Argument' },
  { id: 'illness',     emoji: '🤒', fr: 'Maladie',         en: 'Illness' },
  { id: 'breakup',     emoji: '💔', fr: 'Rupture',         en: 'Breakup' },
  { id: 'loss',        emoji: '🕯️', fr: 'Deuil',           en: 'Loss' },
  { id: 'family',      emoji: '👨‍👩‍👧', fr: 'Famille',      en: 'Family' },
  { id: 'money',       emoji: '💰', fr: 'Souci financier', en: 'Money trouble' },
  { id: 'move',        emoji: '🏠', fr: 'Déménagement',    en: 'Moving' },
]

export function getEventById(id) {
  return LIFE_EVENTS.find(e => e.id === id) ?? null
}
