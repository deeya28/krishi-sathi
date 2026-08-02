import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../utils/api";

const DataContext = createContext(null);

const SAVED_KEY  = "ks_saved";
const NOTIFS_KEY = "ks_notifications";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

/** Map a backend post document to the shape the UI expects. */
function mapPost(raw) {
  const loc = raw.location || {};
  const locationStr = [loc.district, loc.state].filter(Boolean).join(', ') || 'Nepal';

  return {
    // Identity
    id:       raw._id,
    authorId: raw.farmer?._id || null,
    // Author display
    name:     raw.farmer?.name  || 'Unknown',
    role:     raw.farmer?.email || '',          // email shown as subtitle (no role in populate)
    location: locationStr,
    farmSize: '—',
    badge:    null,
    primaryCrops: [raw.cropName].filter(Boolean),
    // Post content
    text:       raw.description,
    cropName:   raw.cropName,
    issueType:  raw.issueType,
    status:     raw.status,
    media:      raw.media || [],
    // Engagement
    time:     raw.createdAt ? new Date(raw.createdAt).toLocaleDateString() : 'Now',
    likes:    raw.likeCount  || 0,
    isLiked:  raw.likedByMe  || false,
    shares:   0,
    isFollowing: false,
    comments: [],           // loaded lazily when comment drawer opens
  };
}

/** Map a backend comment document to the shape the UI expects. */
function mapComment(raw) {
  return {
    id:           raw._id,
    name:         raw.user?.name  || 'Unknown',
    text:         raw.text,
    time:         raw.createdAt ? new Date(raw.createdAt).toLocaleDateString() : 'Now',
    commentType:  raw.commentType,
  };
}

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

const SEED_NOTIFICATIONS = [
  { id: 1, type: "system", text: "Welcome to Krishi Sathi! Complete your profile to get started.", time: "Now", read: false },
];

// ---------------------------------------------------------------------------
// Provider
// ---------------------------------------------------------------------------

export function DataProvider({ children }) {
  const { currentUser } = useAuth();

  const [posts,         setPosts]         = useState([]);
  const [loading,       setLoading]       = useState(false);
  const [savedIds,      setSavedIds]      = useState(() => loadJSON(SAVED_KEY, []));
  const [notifications, setNotifications] = useState(() => loadJSON(NOTIFS_KEY, SEED_NOTIFICATIONS));

  // Persist saved / notifications to localStorage
  useEffect(() => { localStorage.setItem(SAVED_KEY,  JSON.stringify(savedIds)); },      [savedIds]);
  useEffect(() => { localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications)); }, [notifications]);

  // ------------------------------------------------------------------
  // Fetch the post feed from the backend whenever the user changes
  // ------------------------------------------------------------------
  const fetchPosts = useCallback(async () => {
    if (!currentUser) { setPosts([]); return; }
    try {
      setLoading(true);
      const data = await apiFetch('/posts');
      setPosts((data.posts || []).map(mapPost));
    } catch (err) {
      console.error('Failed to load posts:', err.message);
    } finally {
      setLoading(false);
    }
  }, [currentUser]);

  useEffect(() => { fetchPosts(); }, [fetchPosts]);

  // ------------------------------------------------------------------
  // Create post  (farmer only — backend enforces this)
  // Accepts an optional array of File objects (photos/videos) and extra
  // fields (cropName, issueType, location). Existing calls like
  // addPost(postText) still work fine since files/extra default to [] / {}.
  // ------------------------------------------------------------------
  const addPost = async (text, files = [], extra = {}) => {
    if (!text?.trim()) return;
    try {
      let data;

      if (files.length > 0) {
        // Files present - must send as multipart/form-data
        const formData = new FormData();
        formData.append('cropName', extra.cropName || 'General');
        formData.append('description', text.trim());
        formData.append('issueType', extra.issueType || 'other');
        if (extra.location) {
          formData.append('location', JSON.stringify(extra.location));
        }
        files.forEach((file) => formData.append('media', file));

        data = await apiFetch('/posts', {
          method: 'POST',
          body: formData, // apiFetch detects FormData and skips the JSON header
        });
      } else {
        // No files - plain JSON, same as before
        data = await apiFetch('/posts', {
          method: 'POST',
          body: JSON.stringify({
            cropName: extra.cropName || 'General',
            description: text.trim(),
            issueType: extra.issueType || 'other',
          }),
        });
      }

      // Prepend the new post to the feed
      setPosts((prev) => [mapPost({ ...data.post, likeCount: 0, likedByMe: false }), ...prev]);
    } catch (err) {
      console.error('Failed to create post:', err.message);
    }
  };

  // ------------------------------------------------------------------
  // Delete post  (owner only)
  // ------------------------------------------------------------------
  const deletePost = async (id) => {
    try {
      await apiFetch(`/posts/${id}`, { method: 'DELETE' });
      setPosts((prev) => prev.filter((p) => p.id !== id));
    } catch (err) {
      console.error('Failed to delete post:', err.message);
    }
  };

  // ------------------------------------------------------------------
  // Edit post  (owner only)
  // ------------------------------------------------------------------
  const editPost = async (id, text) => {
    try {
      const data = await apiFetch(`/posts/${id}`, {
        method: 'PUT',
        body: JSON.stringify({ description: text }),
      });
      setPosts((prev) =>
        prev.map((p) => (p.id === id ? { ...p, text: data.post.description } : p))
      );
    } catch (err) {
      console.error('Failed to edit post:', err.message);
    }
  };

  // ------------------------------------------------------------------
  // Toggle like
  // ------------------------------------------------------------------
  const toggleLike = async (id) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      const data = await apiFetch(`/likes/${id}`, { method: 'POST' });
      // Sync actual count from server
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likes: data.likeCount, isLiked: data.liked } : p
        )
      );
    } catch (err) {
      // Revert optimistic update on error
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id
            ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
            : p
        )
      );
      console.error('Failed to toggle like:', err.message);
    }
  };

  // ------------------------------------------------------------------
  // Load comments for a specific post  (called when drawer opens)
  // ------------------------------------------------------------------
  const loadComments = async (postId) => {
    try {
      const data = await apiFetch(`/comments/${postId}`);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId
            ? { ...p, comments: (data.comments || []).map(mapComment) }
            : p
        )
      );
    } catch (err) {
      console.error('Failed to load comments:', err.message);
    }
  };

  // ------------------------------------------------------------------
  // Add comment
  // ------------------------------------------------------------------
  const addComment = async (postId, text) => {
    if (!text?.trim()) return;
    try {
      const data = await apiFetch(`/comments/${postId}`, {
        method: 'POST',
        body: JSON.stringify({ text: text.trim() }),
      });
      const newComment = mapComment(data.comment);
      setPosts((prev) =>
        prev.map((p) =>
          p.id === postId ? { ...p, comments: [...p.comments, newComment] } : p
        )
      );
    } catch (err) {
      console.error('Failed to add comment:', err.message);
    }
  };

  // ------------------------------------------------------------------
  // Follow toggle  (local-only — no backend endpoint yet)
  // ------------------------------------------------------------------
  const toggleFollow = (id) =>
    setPosts((prev) =>
      prev.map((p) => (p.id === id ? { ...p, isFollowing: !p.isFollowing } : p))
    );

  // ------------------------------------------------------------------
  // Share  (local-only)
  // ------------------------------------------------------------------
  const sharePost = (id) =>
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p)));

  // ------------------------------------------------------------------
  // Saved posts  (localStorage-only — no backend equivalent)
  // ------------------------------------------------------------------
  const toggleSave = (id) =>
    setSavedIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]
    );

  // ------------------------------------------------------------------
  // Notifications  (localStorage-only)
  // ------------------------------------------------------------------
  const markNotificationRead    = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearNotifications       = () => setNotifications([]);

  // ------------------------------------------------------------------
  // Derived data
  // ------------------------------------------------------------------
  const myPosts    = posts.filter((p) => currentUser && p.authorId === currentUser.id);
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
        loading,
        fetchPosts,
        addPost,
        deletePost,
        editPost,
        toggleFollow,
        toggleLike,
        sharePost,
        addComment,
        loadComments,
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