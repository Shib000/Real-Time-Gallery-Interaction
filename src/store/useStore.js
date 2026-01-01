import { create } from "zustand";

const useStore = create((set) => ({
  currentUser: null,
  setCurrentUser: (user) => set({ currentUser: user }),

  initializeUser: () => {
    const userId =
      localStorage.getItem("userId") ||
      `user-${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
    
    const storedUserName = localStorage.getItem("userName");
    const userName =
      storedUserName && storedUserName !== "Shibshankar Das"
        ? storedUserName
        : `User${Math.floor(Math.random() * 10000)}`;
    
    const userColor =
      localStorage.getItem("userColor") ||
      `#${Math.floor(Math.random() * 16777215)
        .toString(16)
        .padStart(6, "0")}`;

    localStorage.setItem("userId", userId);
    localStorage.setItem("userName", userName);
    localStorage.setItem("userColor", userColor);

    set({ currentUser: { id: userId, name: userName, color: userColor } });
  },
}));

export default useStore;
