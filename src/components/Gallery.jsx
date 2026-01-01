import { useState, useCallback, useMemo, useEffect } from "react";
import { useUnsplashImages } from "../hooks/useUnsplash";
import { useQuery, db, isInitialized } from "../lib/instantdb";
import ImageCard from "./ImageCard";
import ImageView from "./ImageView";
import { Loader2 } from "lucide-react";

const Gallery = ({ imageIdToOpen, onImageOpened }) => {
  const [page, setPage] = useState(1);
  const [selectedImage, setSelectedImage] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  const { data, isLoading, isError, error } = useUnsplashImages(page);
  const reactionsQuery = useQuery(
    db && isInitialized ? { reactions: {} } : null
  );
  const commentsQuery = useQuery(db && isInitialized ? { comments: {} } : null);

  const images = useMemo(() => {
    if (!data) return [];
    return data.map((photo) => ({
      id: photo.id,
      url: photo.urls.regular,
      thumbUrl: photo.urls.thumb,
      description: photo.description || photo.alt_description || "Untitled",
      unsplashId: photo.id,
    }));
  }, [data]);

  const reactions = reactionsQuery?.data?.reactions ?? [];
  const comments = commentsQuery?.data?.comments ?? [];

  const getImageCounts = useCallback(
    (imageId) => {
      const reactionCount = reactions.filter(
        (r) => r.imageId === String(imageId)
      ).length;
      const commentCount = comments.filter(
        (c) => c.imageId === String(imageId)
      ).length;
      return { reactionCount, commentCount };
    },
    [reactions, comments]
  );

  const handleImageClick = useCallback((image) => {
    setSelectedImage(image);
    setIsModalOpen(true);
  }, []);

  const handleCloseModal = useCallback(() => {
    setIsModalOpen(false);
    setSelectedImage(null);
  }, []);

  const handleLoadMore = useCallback(() => {
    setPage((prev) => prev + 1);
  }, []);

  useEffect(() => {
    if (imageIdToOpen && images.length > 0) {
      const imageToOpen = images.find(
        (img) => img.id === imageIdToOpen || img.unsplashId === imageIdToOpen
      );
      if (imageToOpen) {
        setSelectedImage(imageToOpen);
        setIsModalOpen(true);
        if (onImageOpened) {
          onImageOpened();
        }
      }
    }
  }, [imageIdToOpen, images, onImageOpened]);

  if (isError) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-500 mb-4">
            Error loading images: {error?.message}
          </p>
          <p className="text-gray-600 text-sm">
            Make sure you have set VITE_UNSPLASH_ACCESS_KEY in your .env file
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-7xl mx-auto px-4">
        <h1 className="text-3xl font-bold text-gray-900 mb-8">Photo Gallery</h1>

        {isLoading && images.length === 0 ? (
          <div className="flex items-center justify-center min-h-[400px]">
            <Loader2 className="w-8 h-8 animate-spin text-blue-500" />
          </div>
        ) : (
          <>
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
              {images.map((image) => {
                const { reactionCount, commentCount } = getImageCounts(
                  image.id
                );
                return (
                  <ImageCard
                    key={image.id}
                    image={image}
                    onClick={() => handleImageClick(image)}
                    reactionCount={reactionCount}
                    commentCount={commentCount}
                  />
                );
              })}
            </div>

            <div className="mt-8 flex justify-center">
              <button
                onClick={handleLoadMore}
                disabled={isLoading}
                className="px-6 py-3 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
              >
                {isLoading ? (
                  <>
                    <Loader2 className="w-4 h-4 animate-spin" />
                    Loading...
                  </>
                ) : (
                  "Load More"
                )}
              </button>
            </div>
          </>
        )}

        {isModalOpen && selectedImage && (
          <ImageView image={selectedImage} onClose={handleCloseModal} />
        )}
      </div>
    </div>
  );
};

export default Gallery;
