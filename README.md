# Real-Time Photo Reaction Application

A multi-user real-time image interaction web application built with React. Users can browse images, react with emojis, add comments, and see all interactions update instantly across all users.

## Features

- **Gallery Section**: Browse images from Unsplash API with pagination
- **Real-Time Emoji Reactions**: Add emoji reactions that sync instantly across all users
- **Real-Time Comments**: Add comments that appear in real-time for all viewers
- **Activity Feed**: Global feed showing all interactions across images with image thumbnails
- **User Identity**: Random username and color assignment for each user
- **Emoji Picker**: Interactive emoji picker for reactions
- **Delete Functionality**: Users can delete their own reactions and comments
- **Toggle Reactions**: Click to react, click again to unreact
- **Feed Navigation**: Click feed items to open related images in gallery

## Tech Stack

- React 18 (Functional components only)
- Vite - Build tool
- Tailwind CSS - Styling
- React Query - API data fetching
- Zustand - State management
- InstantDB - Real-time database
- Unsplash API - Image source

## Setup Instructions

### Prerequisites

- Node.js 18+ and npm
- InstantDB account (free at https://www.instantdb.com/)
- Unsplash API access key (free at https://unsplash.com/developers)

### Installation

1. Clone the repository

```bash
git clone <repository-url>
cd realtime-photo-reaction
```

2. Install dependencies

```bash
npm install
```

3. Create `.env` file in root directory

```env
VITE_INSTANTDB_APP_ID=your-instantdb-app-id
VITE_UNSPLASH_ACCESS_KEY=your-unsplash-access-key
```

4. Run development server

```bash
npm run dev
```

The app will be available at `http://localhost:5173`

5. Build for production

```bash
npm run build
```

## InstantDB Schema

The application uses three tables:

```javascript
{
  reactions: {
    imageId: string,
    emoji: string,
    userId: string,
    userName: string,
    userColor: string,
    imageUrl: string,
    thumbUrl: string,
    imageDescription: string,
    createdAt: number
  },
  comments: {
    imageId: string,
    text: string,
    userId: string,
    userName: string,
    userColor: string,
    imageUrl: string,
    thumbUrl: string,
    imageDescription: string,
    createdAt: number
  }
}
```

## Key React Decisions

1. **Component Structure**: Separated Gallery, Feed, ImageView, and EmojiPicker components
2. **State Management**: Zustand for user state, React Query for API data, InstantDB for real-time data
3. **Hooks Usage**: Proper use of useEffect, useMemo, useCallback for performance
4. **Real-Time Sync**: InstantDB's useQuery hook for automatic real-time updates
5. **Transactions**: All writes use InstantDB transactions for atomic updates

## Challenges Faced & Solutions

### Real-Time Synchronization

**Problem**: Ensuring reactions and comments appear instantly for all users.

**Solution**: Used InstantDB's real-time query hooks which automatically subscribe to database changes.

### Multiple Users on Same Image

**Problem**: Handling simultaneous interactions without conflicts.

**Solution**: InstantDB handles concurrent updates automatically. Each reaction/comment is a separate record, preventing conflicts. Added toggle functionality to prevent duplicate reactions.

### User Identity

**Problem**: Need to identify users without authentication.

**Solution**: Generate random user ID, username, and color on first visit, stored in localStorage for persistence.

## License

Created as part of React Intern Assignment for FotoOwl.
