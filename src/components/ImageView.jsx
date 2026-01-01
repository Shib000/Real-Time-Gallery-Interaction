import { useState, useCallback, useMemo } from "react";
import { db, useQuery, transact, tx, id, isInitialized } from "../lib/instantdb";

import useStore from "../store/useStore";
import { X, Send, Trash2 } from "lucide-react";
import EmojiPicker from "./EmojiPicker";

const ImageView = ({ image, onClose }) => {
  const { currentUser } = useStore();
  const [commentText, setCommentText] = useState("");
  const [showEmojiPicker, setShowEmojiPicker] = useState(false);
  
  const imageId = image?.id ? String(image.id) : null;

  const reactionsQuery = useQuery(
    db && isInitialized && imageId ? { reactions: { $: { where: { imageId: imageId } } } } : null
  );
  const commentsQuery = useQuery(
    db && isInitialized && imageId ? { comments: { $: { where: { imageId: imageId } } } } : null
  );

  const reactions = useMemo(() => {
    const data = reactionsQuery?.data?.reactions ?? [];
    if (!imageId) return [];
    return data.filter((r) => r?.imageId === imageId);
  }, [reactionsQuery?.data, imageId]);

  const comments = useMemo(() => {
    const data = commentsQuery?.data?.comments ?? [];
    if (!imageId) return [];
    return data.filter((c) => c?.imageId === imageId);
  }, [commentsQuery?.data, imageId]);

  if (!image || !imageId) {
    return null;
  }

  if (!db || !isInitialized) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col p-8">
          <div className="text-center">
            <p className="text-red-500 mb-4">
              InstantDB is not initialized. Please check your
              VITE_INSTANTDB_APP_ID environment variable.
            </p>
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-500 text-white rounded-lg hover:bg-gray-600"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    );
  }

  const sortedComments = useMemo(() => {
    if (!comments) return [];
    return [...comments].sort((a, b) => a.createdAt - b.createdAt);
  }, [comments]);

  const reactionsByEmoji = useMemo(() => {
    if (!reactions) return {};
    return reactions.reduce((acc, reaction) => {
      if (!acc[reaction.emoji]) {
        acc[reaction.emoji] = [];
      }
      acc[reaction.emoji].push(reaction);
      return acc;
    }, {});
  }, [reactions]);

  const hasUserReacted = useCallback(
    (emoji) => {
      if (!currentUser || !reactions) return false;
      return reactions.some(
        (reaction) =>
          reaction.emoji === emoji &&
          reaction.userId === currentUser.id &&
          reaction.imageId === imageId
      );
    },
    [currentUser, reactions, imageId]
  );

  const getUserReactionId = useCallback(
    (emoji) => {
      if (!currentUser || !reactions) return null;
      const userReaction = reactions.find(
        (reaction) =>
          reaction.emoji === emoji &&
          reaction.userId === currentUser.id &&
          reaction.imageId === imageId
      );
      return userReaction?.id || null;
    },
    [currentUser, reactions, imageId]
  );

  const handleDeleteReaction = useCallback(
    (reactionId) => {
      if (!currentUser || !db) {
        return;
      }

      if (!tx || !db || !isInitialized) {
        return;
      }

      try {
        const transactionResult = transact([tx.reactions[reactionId].delete()]);

        if (transactionResult && typeof transactionResult.then === 'function') {
          transactionResult.catch(() => {});
        }
      } catch (error) {
      }
    },
    [currentUser]
  );

  const handleAddReaction = useCallback(
    (emoji) => {
      if (!currentUser || !db || !image?.id || !emoji) return;

      const userId = currentUser?.id ? String(currentUser.id) : null;
      const userName = currentUser?.name ? String(currentUser.name) : "Anonymous";
      const userColor = currentUser?.color ? String(currentUser.color) : "#000000";
      
      if (!userId) {
        return;
      }

      const existingReactionId = getUserReactionId(emoji);
      
      if (existingReactionId) {
        handleDeleteReaction(existingReactionId);
        return;
      }

      try {
        if (!tx || !db || !isInitialized) {
          return;
        }

        const transactionResult = transact([
          tx.reactions[id()].update({
            imageId: String(image.id),
            imageUrl: String(image.url || ""),
            thumbUrl: String(image.thumbUrl || image.url || ""),
            imageDescription: String(image.description || ""),
            emoji: String(emoji),
            userId: userId,
            userName: userName,
            userColor: userColor,
            createdAt: Date.now(),
          }),
        ]);

        if (transactionResult && typeof transactionResult.then === 'function') {
          transactionResult
            .then(() => {
              setShowEmojiPicker(false);
            })
            .catch(() => {});
        } else {
          setShowEmojiPicker(false);
        }
      } catch (error) {
      }
    },
    [currentUser, image, getUserReactionId, handleDeleteReaction, db, isInitialized]
  );

  const handleAddComment = useCallback(() => {
    if (!commentText.trim() || !currentUser || !db || !image?.id) return;

    const userId = currentUser?.id ? String(currentUser.id) : null;
    const userName = currentUser?.name ? String(currentUser.name) : "Anonymous";
    const userColor = currentUser?.color ? String(currentUser.color) : "#000000";
    
    if (!userId) {
      return;
    }

    try {
      if (!tx || !db || !isInitialized) {
        return;
      }

      const transactionResult = transact([
        tx.comments[id()].update({
          imageId: String(image.id),
          imageUrl: String(image.url || ""),
          thumbUrl: String(image.thumbUrl || image.url || ""),
          imageDescription: String(image.description || ""),
          text: String(commentText.trim()),
          userId: userId,
          userName: userName,
          userColor: userColor,
          createdAt: Date.now(),
        }),
      ]);

      if (transactionResult && typeof transactionResult.then === 'function') {
        transactionResult
          .then(() => {
            setCommentText("");
          })
          .catch(() => {});
      } else {
        setCommentText("");
      }
    } catch (error) {
    }
  }, [commentText, currentUser, image]);

  const handleDeleteComment = useCallback(
    (commentId) => {
      if (!currentUser || !db) {
        return;
      }

      if (!tx || !db || !isInitialized) {
        return;
      }

      try {
        const transactionResult = transact([tx.comments[commentId].delete()]);

        if (transactionResult && typeof transactionResult.then === 'function') {
          transactionResult.catch(() => {});
        }
      } catch (error) {
      }
    },
    [currentUser]
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-75 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-hidden flex flex-col">
        <div className="flex items-center justify-between p-4 border-b">
          <h2 className="text-xl font-semibold text-gray-900 truncate flex-1">
            {image?.description || "Untitled"}
          </h2>
          <button
            onClick={onClose}
            className="ml-4 p-2 hover:bg-gray-100 rounded-full transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        <div className="flex-1 overflow-y-auto">
          <div className="grid md:grid-cols-2 gap-4 p-4">
            <div className="relative">
              <img
                src={image?.url || ""}
                alt={image?.description || "Image"}
                className="w-full h-auto rounded-lg"
              />

              <div className="mt-4 flex flex-wrap gap-2 items-center">
                <button
                  onClick={() => handleAddReaction("❤️")}
                  className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                    hasUserReacted("❤️")
                      ? "bg-red-200 hover:bg-red-300 border-2 border-red-400"
                      : "bg-red-50 hover:bg-red-100 border border-red-200"
                  }`}
                  title={hasUserReacted("❤️") ? "Click to unreact" : "Click to react"}
                >
                  <span className="text-lg">❤️</span>
                  <span className="text-gray-600">
                    {reactionsByEmoji["❤️"]?.length || 0}
                  </span>
                </button>

                {Object.entries(reactionsByEmoji)
                  .filter(([emoji]) => emoji !== "❤️")
                  .map(([emoji, emojiReactions]) => (
                    <button
                      key={emoji}
                      onClick={() => handleAddReaction(emoji)}
                      className={`flex items-center gap-1 px-3 py-1 rounded-full text-sm transition-colors ${
                        hasUserReacted(emoji)
                          ? "bg-blue-200 hover:bg-blue-300 border-2 border-blue-400"
                          : "bg-gray-100 hover:bg-gray-200"
                      }`}
                      title={hasUserReacted(emoji) ? "Click to unreact" : "Click to react"}
                    >
                      <span className="text-lg">{emoji}</span>
                      <span className="text-gray-600">
                        {emojiReactions.length}
                      </span>
                    </button>
                  ))}
                
                <button
                  onClick={() => setShowEmojiPicker(!showEmojiPicker)}
                  className="px-3 py-1 bg-blue-100 hover:bg-blue-200 rounded-full text-sm transition-colors"
                >
                  + Add
                </button>
              </div>

              {showEmojiPicker && (
                <div className="mt-2">
                  <EmojiPicker onSelect={handleAddReaction} />
                </div>
              )}
            </div>

            <div className="flex flex-col">
              <h3 className="text-lg font-semibold mb-4">Comments</h3>

              <div className="flex-1 overflow-y-auto space-y-3 mb-4">
                {sortedComments.length === 0 ? (
                  <p className="text-gray-500 text-sm">
                    No comments yet. Be the first to comment!
                  </p>
                ) : (
                  sortedComments.map((comment) => (
                    <div
                      key={comment.id}
                      className="bg-gray-50 rounded-lg p-3 animate-fade-in"
                    >
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-2 mb-1">
                            <div
                              className="w-6 h-6 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                              style={{ backgroundColor: comment.userColor }}
                            >
                              {comment.userName[0].toUpperCase()}
                            </div>
                            <span
                              className="font-semibold text-sm"
                              style={{ color: comment.userColor }}
                            >
                              {comment.userName}
                            </span>
                          </div>
                          <p className="text-gray-700 text-sm">
                            {comment.text}
                          </p>
                        </div>
                        {currentUser && comment.userId === currentUser.id && (
                          <button
                            onClick={() => handleDeleteComment(comment.id)}
                            className="ml-2 p-1 hover:bg-red-100 rounded transition-colors"
                          >
                            <Trash2 className="w-4 h-4 text-red-500" />
                          </button>
                        )}
                      </div>
                    </div>
                  ))
                )}
              </div>

              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleAddComment();
                }}
                className="flex gap-2 border-t pt-4"
              >
                <input
                  type="text"
                  value={commentText}
                  onChange={(e) => setCommentText(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter" && !e.shiftKey) {
                      e.preventDefault();
                      handleAddComment();
                    }
                  }}
                  placeholder="Add a comment..."
                  className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  autoFocus={false}
                />
                <button
                  type="submit"
                  disabled={!commentText.trim()}
                  className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2 transition-colors"
                >
                  <Send className="w-4 h-4" />
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ImageView;
