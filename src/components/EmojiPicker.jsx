import { useCallback } from "react";

const EMOJI_LIST = [
  "❤️",
  "👍",
  "👎",
  "😄",
  "😍",
  "🤔",
  "😮",
  "😢",
  "🔥",
  "⭐",
  "🎉",
  "💯",
  "👏",
  "🙌",
  "🤝",
  "💪",
  "✨",
  "🌟",
  "💖",
  "😊",
];

const EmojiPicker = ({ onSelect }) => {
  const handleEmojiClick = useCallback(
    (emoji) => {
      onSelect(emoji);
    },
    [onSelect]
  );

  return (
    <div className="bg-white border border-gray-200 rounded-lg p-3 shadow-lg">
      <div className="grid grid-cols-5 gap-2">
        {EMOJI_LIST.map((emoji) => (
          <button
            key={emoji}
            onClick={() => handleEmojiClick(emoji)}
            className="text-2xl hover:bg-gray-100 rounded p-2 transition-colors"
          >
            {emoji}
          </button>
        ))}
      </div>
    </div>
  );
};

export default EmojiPicker;
