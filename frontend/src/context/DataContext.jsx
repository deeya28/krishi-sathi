import { createContext, useContext, useEffect, useState } from "react";
import { useAuth } from "./AuthContext";

const DataContext = createContext(null);

const POSTS_KEY = "ks_posts";
const SAVED_KEY = "ks_saved";
const NOTIFS_KEY = "ks_notifications";

const SEED_POSTS = [
  {
    id: 1,
    authorId: null,
    name: "Ram Bahadur Thapa",
    role: "Maize & Vegetable Farmer",
    location: "Bharatpur, Chitwan",
    farmSize: "2.5 Bigha",
    badge: "Verified Farmer",
    primaryCrops: ["Maize", "Tomatoes", "Cabbage"],
    text: "This season's maize looks strong. Sharing my irrigation schedule with anyone who wants to try it.",
    time: "2h",
    likes: 12,
    isLiked: false,
    shares: 2,
    isFollowing: false,
    comments: [
      { id: 101, name: "Suman Giri", text: "Please share the schedule! Very interested.", time: "1h" },
    ],
  },
  {
    id: 2,
    authorId: null,
    name: "Sunita Gurung",
    role: "Organic Horticulture Specialist",
    location: "Panchkhal, Kavre",
    farmSize: "12 Ropani",
    badge: "Organic Certified",
    primaryCrops: ["Tomatoes", "Capsicum", "Leafy Greens"],
    text: "Has anyone dealt with leaf blight on tomatoes this monsoon? Looking for biological control advice.",
    time: "5h",
    likes: 8,
    isLiked: true,
    shares: 0,
    isFollowing: true,
    comments: [
      { id: 102, name: "Bimal Rai", text: "Try copper-based fungicides or neem extract early morning.", time: "3h" },
    ],
  },
  {
    id: 3,
    authorId: null,
    name: "Bimal Rai",
    role: "Senior Agronomist & Consultant",
    location: "Lalitpur, Bagmati",
    farmSize: "Research Station",
    badge: "Expert Agronomist",
    primaryCrops: ["Soil Health", "Pest Management"],
    text: "Posted a short guide on organic pest control for the community. Check it in Farming Tips.",
    time: "1d",
    likes: 24,
    isLiked: false,
    shares: 5,
    isFollowing: false,
    comments: [],
  },
];

const SEED_NOTIFICATIONS = [
  { id: 1, type: "like", text: "Sunita Gurung liked your post.", time: "2h", read: false },
  { id: 2, type: "comment", text: "Bimal Rai commented on a post you follow.", time: "5h", read: false },
  { id: 3, type: "follow", text: "Suman Giri started following you.", time: "1d", read: true },
  { id: 4, type: "system", text: "Welcome to Krishi Sathi! Complete your profile to get started.", time: "3d", read: true },
];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

export function DataProvider({ children }) {
  const { currentUser } = useAuth();
  const [posts, setPosts] = useState(() => loadJSON(POSTS_KEY, SEED_POSTS));
  const [savedIds, setSavedIds] = useState(() => loadJSON(SAVED_KEY, []));
  const [notifications, setNotifications] = useState(() =>
    loadJSON(NOTIFS_KEY, SEED_NOTIFICATIONS)
  );

  useEffect(() => {
    localStorage.setItem(POSTS_KEY, JSON.stringify(posts));
  }, [posts]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  const addPost = (text) => {
    if (!text.trim()) return;
    const newPost = {
      id: Date.now(),
      authorId: currentUser?.id || "guest",
      name: currentUser?.name || "You",
      role: currentUser?.role || "Community Member",
      location: currentUser?.location || "Nepal",
      farmSize: "—",
      badge: currentUser ? null : "Guest",
      primaryCrops: [],
      text: text.trim(),
      time: "Just now",
      likes: 0,
      isLiked: false,
      shares: 0,
      isFollowing: false,
      comments: [],
    };
    setPosts((prev) => [newPost, ...prev]);
  };

  const deletePost = (id) => setPosts((prev) => prev.filter((p) => p.id !== id));

  const editPost = (id, text) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, text } : p)));

  const toggleFollow = (id) =>
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFollowing: !p.isFollowing } : p))
    );

  const toggleLike = (id) =>
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );

  const sharePost = (id) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p)));

  const addComment = (postId, text) => {
    if (!text || !text.trim()) return;
    const newComment = {
      id: Date.now(),
      name: currentUser?.name || "You",
      text: text.trim(),
      time: "Just now",
    };
    setPosts((prev) =>
      prev.map((p) =>
        p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
      )
    );
  };

  const toggleSave = (id) =>
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  const markNotificationRead = (id) =>
    setNotifications((prev) =>
      prev.map((n) => (n.id === id ? { ...n, read: true } : n))
    );

  const markAllNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));

  const clearNotifications = () => setNotifications([]);

  const myPosts = posts.filter(
    (p) => currentUser && p.authorId === currentUser.id
  );
  const savedPosts = posts.filter((p) => savedIds.includes(p.id));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DataContext.Provider
      value={{
        posts,
        myPosts,
        savedPosts,
        savedIds,
        notifications,
        unreadCount,
        addPost,
        deletePost,
        editPost,
        toggleFollow,
        toggleLike,
        sharePost,
        addComment,
        toggleSave,
        markNotificationRead,
        markAllNotificationsRead,
        clearNotifications,
      }}
    >
      {children}
    </DataContext.Provider>
  );
}

export function useData() {
  const ctx = useContext(DataContext);
  if (!ctx) throw new Error("useData must be used within a DataProvider");
  return ctx;
}
