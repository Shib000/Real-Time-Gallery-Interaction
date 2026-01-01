import { useMemo } from "react";
import { useQuery, db, isInitialized } from "../lib/instantdb";

import { Heart, MessageCircle, Image as ImageIcon } from "lucide-react";

const Feed = ({ onImageClick }) => {
  const reactionsQuery = useQuery(db && isInitialized ? { reactions: {} } : null);
  const commentsQuery = useQuery(db && isInitialized ? { comments: {} } : null);
  const imagesQuery = useQuery(db && isInitialized ? { images: {} } : null);

  const reactions = reactionsQuery?.data?.reactions ?? [];
  const comments = commentsQuery?.data?.comments ?? [];
  const images = imagesQuery?.data?.images ?? [];

  if (!db || !isInitialized) {
    return (
      <div className="min-h-screen bg-gray-50 py-8">
        <div className="max-w-3xl mx-auto px-4">
          <h1 className="text-3xl font-bold text-gray-900 mb-8">
            Activity Feed
          </h1>
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">
              InstantDB is not initialized. Please check your
              VITE_INSTANTDB_APP_ID environment variable.
            </p>
          </div>
        </div>
      </div>
    );
  }

  const feedItems = useMemo(() => {
    const items = [];

    if (reactions) {
      reactions.forEach((reaction) => {
        items.push({
          id: `reaction-${reaction.id}`,
          type: "reaction",
          emoji: reaction.emoji,
          userName: reaction.userName,
          userColor: reaction.userColor,
          imageId: reaction.imageId,
          imageUrl: reaction.imageUrl,
          thumbUrl: reaction.thumbUrl,
          imageDescription: reaction.imageDescription,
          createdAt: reaction.createdAt,
        });
      });
    }

    if (comments) {
      comments.forEach((comment) => {
        items.push({
          id: `comment-${comment.id}`,
          type: "comment",
          text: comment.text,
          userName: comment.userName,
          userColor: comment.userColor,
          imageId: comment.imageId,
          imageUrl: comment.imageUrl,
          thumbUrl: comment.thumbUrl,
          imageDescription: comment.imageDescription,
          createdAt: comment.createdAt,
        });
      });
    }

    return items.sort((a, b) => b.createdAt - a.createdAt);
  }, [reactions, comments]);

  const getImageDescription = (item) => {
    if (item.imageDescription) {
      return item.imageDescription;
    }
    const image = images?.find((img) => img.id === item.imageId);
    return image?.description || "Image";
  };

  const formatTime = (timestamp) => {
    const date = new Date(timestamp);
    const now = new Date();
    const diff = now - date;
    const seconds = Math.floor(diff / 1000);
    const minutes = Math.floor(seconds / 60);
    const hours = Math.floor(minutes / 60);

    if (seconds < 60) return "just now";
    if (minutes < 60) return `${minutes}m ago`;
    if (hours < 24) return `${hours}h ago`;
    return date.toLocaleDateString();
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-3xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Activity Feed</h1>

        {feedItems.length === 0 ? (
          <div className="bg-white rounded-lg p-8 text-center">
            <p className="text-gray-500">
              No activity yet. Start interacting with images in the gallery!
            </p>
          </div>
        ) : (
          <div className="space-y-4">
            {feedItems.map((item) => (
              <div
                key={item.id}
                className="bg-white rounded-lg p-4 shadow-md hover:shadow-lg transition-shadow animate-fade-in cursor-pointer"
                onClick={() => onImageClick && onImageClick(item.imageId)}
              >
                <div className="flex items-start gap-3">
                  <div
                    className="w-10 h-10 rounded-full flex items-center justify-center text-white font-semibold flex-shrink-0"
                    style={{ backgroundColor: item.userColor }}
                  >
                    {item.userName[0].toUpperCase()}
                  </div>

                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-2">
                      <span
                        className="font-semibold"
                        style={{ color: item.userColor }}
                      >
                        {item.userName}
                      </span>
                      {item.type === "reaction" ? (
                        <>
                          <span className="text-gray-600">reacted</span>
                          <span className="text-2xl">{item.emoji}</span>
                          <span className="text-gray-600">to</span>
                        </>
                      ) : (
                        <>
                          <span className="text-gray-600">commented on</span>
                        </>
                      )}
                      <ImageIcon className="w-4 h-4 text-gray-400" />
                      <span className="text-gray-600 truncate">
                        {getImageDescription(item)}
                      </span>
                    </div>

                    {item.thumbUrl && (
                      <div className="mb-2">
                        <img
                          src={item.thumbUrl}
                          alt={getImageDescription(item)}
                          className="w-32 h-32 object-cover rounded-lg border border-gray-200"
                          loading="lazy"
                        />
                      </div>
                    )}

                    {item.type === "comment" && (
                      <p className="text-gray-700 mt-2">{item.text}</p>
                    )}

                    <div className="flex items-center gap-4 mt-2 text-xs text-gray-500">
                      <span>{formatTime(item.createdAt)}</span>
                      {item.type === "reaction" && (
                        <div className="flex items-center gap-1">
                          <Heart className="w-3 h-3" />
                          <span>Reaction</span>
                        </div>
                      )}
                      {item.type === "comment" && (
                        <div className="flex items-center gap-1">
                          <MessageCircle className="w-3 h-3" />
                          <span>Comment</span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default Feed;
