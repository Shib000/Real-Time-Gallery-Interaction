import { Heart, MessageCircle } from "lucide-react";

const ImageCard = ({ image, onClick, reactionCount = 0, commentCount = 0 }) => {
  if (!image?.id) return null;

  return (
    <div
      className="relative group cursor-pointer rounded-lg overflow-hidden shadow-md hover:shadow-xl transition-shadow"
      onClick={onClick}
    >
      <img
        src={image.thumbUrl}
        alt={image.description || "image"}
        className="w-full h-64 object-cover"
        loading="lazy"
      />

      <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-all duration-200" />

      <div className="absolute bottom-0 left-0 right-0 p-3 bg-gradient-to-t from-black/60 to-transparent opacity-0 group-hover:opacity-100 transition-opacity">
        <p className="text-white text-sm font-medium truncate">
          {image.description}
        </p>

        <div className="flex items-center gap-4 mt-2 text-white text-xs">
          <div className="flex items-center gap-1">
            <Heart className="w-4 h-4" />
            <span>{reactionCount}</span>
          </div>
          <div className="flex items-center gap-1">
            <MessageCircle className="w-4 h-4" />
            <span>{commentCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageCard;
