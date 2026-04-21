const EMOJIS = ['😭', '😔', '😕', '😐', '🙂', '😊', '😄']

export default function EmojiPicker({ selected, onSelect }) {
  return (
    <div className="flex flex-col items-center gap-3 py-6">
      <div className="flex justify-center gap-4">
        {EMOJIS.slice(0, 4).map((emoji, i) => {
          const isSelected = selected === i + 1
          return (
            <button key={i} onClick={() => onSelect(i + 1, emoji)}
              className="border-none bg-transparent cursor-pointer transition-all duration-250 leading-none"
              style={{
                fontSize: isSelected ? '52px' : '40px',
                transform: isSelected ? 'translateY(-8px)' : 'translateY(0)',
                filter: isSelected ? 'drop-shadow(0 8px 20px rgba(255,200,60,0.6))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))',
              }}>
              {emoji}
            </button>
          )
        })}
      </div>
      <div className="flex justify-center gap-4">
        {EMOJIS.slice(4).map((emoji, i) => {
          const idx = i + 4
          const isSelected = selected === idx + 1
          return (
            <button key={idx} onClick={() => onSelect(idx + 1, emoji)}
              className="border-none bg-transparent cursor-pointer transition-all duration-250 leading-none"
              style={{
                fontSize: isSelected ? '52px' : '40px',
                transform: isSelected ? 'translateY(-8px)' : 'translateY(0)',
                filter: isSelected ? 'drop-shadow(0 8px 20px rgba(255,200,60,0.6))' : 'drop-shadow(0 3px 8px rgba(0,0,0,0.15))',
              }}>
              {emoji}
            </button>
          )
        })}
      </div>
    </div>
  )
}
