import { useEffect, useState, useCallback } from "react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";

import useStore from "./store/useStore";
import Gallery from "./components/Gallery";
import Feed from "./components/Feed";
import { Image, Activity } from "lucide-react";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function App() {
  const [activeTab, setActiveTab] = useState("gallery");
  const [imageIdToOpen, setImageIdToOpen] = useState(null);
  const { initializeUser, currentUser } = useStore();

  useEffect(() => {
    initializeUser();
  }, [initializeUser]);

  const handleFeedImageClick = useCallback((imageId) => {
    setImageIdToOpen(imageId);
    setActiveTab("gallery");
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <div className="min-h-screen bg-gray-50">
        <nav className="bg-white shadow-sm border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex items-center justify-between h-16">
              <h1 className="text-xl font-bold text-gray-900">
                Real-Time Photo Reaction
              </h1>

              {currentUser && (
                <div className="flex items-center gap-4">
                  <div className="flex items-center gap-2">
                    <div
                      className="w-8 h-8 rounded-full flex items-center justify-center text-white text-xs font-semibold"
                      style={{ backgroundColor: currentUser.color }}
                    >
                      {currentUser.name[0].toUpperCase()}
                    </div>
                    <span className="text-sm font-medium text-gray-700">
                      {currentUser.name}
                    </span>
                  </div>
                </div>
              )}
            </div>
          </div>
        </nav>

        <div className="bg-white border-b">
          <div className="max-w-7xl mx-auto px-4">
            <div className="flex gap-1">
              <button
                onClick={() => setActiveTab("gallery")}
                className={`px-6 py-3 flex items-center gap-2 font-medium transition-colors ${
                  activeTab === "gallery"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Image className="w-5 h-5" />
                Gallery
              </button>
              <button
                onClick={() => setActiveTab("feed")}
                className={`px-6 py-3 flex items-center gap-2 font-medium transition-colors ${
                  activeTab === "feed"
                    ? "text-blue-600 border-b-2 border-blue-600"
                    : "text-gray-600 hover:text-gray-900"
                }`}
              >
                <Activity className="w-5 h-5" />
                Feed
              </button>
            </div>
          </div>
        </div>

        <main>
          {activeTab === "gallery" ? (
            <Gallery imageIdToOpen={imageIdToOpen} onImageOpened={() => setImageIdToOpen(null)} />
          ) : (
            <Feed onImageClick={handleFeedImageClick} />
          )}
        </main>
      </div>
    </QueryClientProvider>
  );
}

export default App;
