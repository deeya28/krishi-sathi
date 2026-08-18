import { createContext, useContext, useEffect, useState, useCallback } from "react";
import { useAuth } from "./AuthContext";
import { apiFetch } from "../utils/api";

const DataContext = createContext(null);

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";
const SAVED_KEY = "ks_saved"; // bookmarks - local only, no backend endpoint for this yet
const NOTIFS_KEY = "ks_notifications"; // local only until notification wiring is confirmed

const SEED_NOTIFICATIONS = [
  { id: 1, type: "system", text: "Welcome to Krishi Sathi! Complete your profile to get started.", time: "3d", read: true },
];

function loadJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

// Turns an ISO date string into a short relative label
function timeAgo(dateString) {
  if (!dateString) return "";
  const date = new Date(dateString);
  const seconds = Math.floor((Date.now() - date.getTime()) / 1000);

  if (seconds < 60) return "Just now";
  const minutes = Math.floor(seconds / 60);
  if (minutes < 60) return `${minutes}m`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return date.toLocaleDateString();
}

// Maps a User.role value to the commentType enum the backend expects
function commentTypeForRole(role) {
  if (role === "agricultural_expert") return "expert";
  if (role === "farmer") return "farmer";
  return "community";
}

// Normalizes a raw post from the API into the shape the UI uses
function normalizePost(raw) {
  return {
    id: raw._id,
    authorId: raw.farmer?._id || raw.farmer,
    name: raw.farmer?.name || "Unknown user",
    cropName: raw.cropName,
    text: raw.description,
    issueType: raw.issueType,
    media: raw.media || [],
    location: raw.location?.district || raw.location?.state || "",
    createdAt: raw.createdAt,
    time: timeAgo(raw.createdAt),
    likes: raw.likeCount ?? 0,
    isLiked: !!raw.likedByMe,
    status: raw.status,
    // Not yet loaded on the feed list endpoint - filled in lazily by fetchFollowInfo/shares
    isFollowing: false,
    shares: raw.shareCount ?? 0,
    // Comments are lazy-loaded per post into commentsByPost via fetchComments;
    // this is just a lightweight count for list views so we don't need the
    // full comment array up front. Defaults to 0 if the backend doesn't send it.
    commentCount: raw.commentCount ?? 0,
  };
}

function normalizeComment(c) {
  return {
    id: c._id,
    name: c.user?.name || "Unknown",
    text: c.text,
    time: timeAgo(c.createdAt),
  };
}

export function DataProvider({ children }) {
  const { currentUser, token } = useAuth();
  const [posts, setPosts] = useState([]);
  const [myPosts, setMyPosts] = useState([]);
  const [savedIds, setSavedIds] = useState(() => loadJSON(SAVED_KEY, []));
  const [commentsByPost, setCommentsByPost] = useState({});
  const [notifications, setNotifications] = useState(() =>
    loadJSON(NOTIFS_KEY, SEED_NOTIFICATIONS)
  );
  const [loading, setLoading] = useState(false);

  const authHeaders = useCallback(
    () => ({
      "Content-Type": "application/json",
      ...(token ? { Authorization: `Bearer ${token}` } : {}),
    }),
    [token]
  );

  const fetchPosts = useCallback(async () => {
    if (!token) return;
    setLoading(true);
    try {
      const res = await fetch(`${API_URL}/posts`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setPosts((data.posts || []).map(normalizePost));
    } catch (err) {
      console.error("Failed to load posts", err);
    } finally {
      setLoading(false);
    }
  }, [token, authHeaders]);

  const fetchMyPosts = useCallback(async () => {
    if (!token) return;
    try {
      const res = await fetch(`${API_URL}/posts/my-posts`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) setMyPosts((data.posts || []).map(normalizePost));
    } catch (err) {
      console.error("Failed to load your posts", err);
    }
  }, [token, authHeaders]);

  useEffect(() => {
    if (token) {
      fetchPosts();
      fetchMyPosts();
    } else {
      setPosts([]);
      setMyPosts([]);
    }
  }, [token, fetchPosts, fetchMyPosts]);

  useEffect(() => {
    localStorage.setItem(SAVED_KEY, JSON.stringify(savedIds));
  }, [savedIds]);

  useEffect(() => {
    localStorage.setItem(NOTIFS_KEY, JSON.stringify(notifications));
  }, [notifications]);

  // --- CREATE POST ---
  // Accepts an optional array of real File objects (photos/videos). When
  // files are present, sends multipart/form-data (required for the backend's
  // multer/Cloudinary upload). Otherwise sends plain JSON as before.
  const addPost = async (text, files = []) => {
    if (!text.trim() && files.length === 0) {
      return { ok: false, error: "Add some text or a photo/video to post." };
    }
    try {
      let res;

      if (files.length > 0) {
        const formData = new FormData();
        formData.append("description", text.trim());
        files.forEach((file) => formData.append("media", file));

        res = await fetch(`${API_URL}/posts`, {
          method: "POST",
          // No Content-Type here - the browser sets the correct multipart
          // boundary automatically. Only pass the auth header.
          headers: token ? { Authorization: `Bearer ${token}` } : {},
          body: formData,
        });
      } else {
        res = await fetch(`${API_URL}/posts`, {
          method: "POST",
          headers: authHeaders(),
          body: JSON.stringify({
            description: text.trim(),
          }),
        });
      }

      const data = await res.json();
      if (!res.ok) return { ok: false, error: data.message || "Failed to create post." };
      await Promise.all([fetchPosts(), fetchMyPosts()]);
      return { ok: true };
    } catch (err) {
      return { ok: false, error: "Could not connect to the server." };
    }
  };

  const deletePost = async (id) => {
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "DELETE",
        headers: authHeaders(),
      });
      if (res.ok) {
        setPosts((prev) => prev.filter((p) => p.id !== id));
        setMyPosts((prev) => prev.filter((p) => p.id !== id));
      }
    } catch (err) {
      console.error("Failed to delete post", err);
    }
  };

  const editPost = async (id, text) => {
    try {
      const res = await fetch(`${API_URL}/posts/${id}`, {
        method: "PUT",
        headers: authHeaders(),
        body: JSON.stringify({ description: text }),
      });
      const data = await res.json();
      if (res.ok) {
        const updated = normalizePost(data.post);
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
        setMyPosts((prev) => prev.map((p) => (p.id === id ? { ...p, ...updated } : p)));
      }
    } catch (err) {
      console.error("Failed to edit post", err);
    }
  };

  // --- LIKES ---
  const toggleLike = async (id) => {
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id
          ? { ...p, isLiked: !p.isLiked, likes: p.isLiked ? p.likes - 1 : p.likes + 1 }
          : p
      )
    );
    try {
      const data = await apiFetch(`/likes/${id}`, { method: "POST" });
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
      console.error("Failed to toggle like:", err.message);
    }
  };

  // --- COMMENTS (lazy-loaded per post) ---
  const fetchComments = async (postId) => {
    try {
      const res = await fetch(`${API_URL}/comments/${postId}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) {
        const list = (data.comments || data || []).map(normalizeComment);
        setCommentsByPost((prev) => ({ ...prev, [postId]: list }));
      }
    } catch (err) {
      console.error("Failed to load comments", err);
    }
  };

  const addComment = async (postId, text) => {
    if (!text || !text.trim()) return;
    try {
      const res = await fetch(`${API_URL}/comments/${postId}`, {
        method: "POST",
        headers: authHeaders(),
        body: JSON.stringify({
          text: text.trim(),
          commentType: commentTypeForRole(currentUser?.role),
        }),
      });
      if (res.ok) await fetchComments(postId);
    } catch (err) {
      console.error("Failed to add comment", err);
    }
  };

  // --- FOLLOW (real backend, POST /api/follows/:userId toggles) ---
  // Follow is keyed by the *author's user ID*, not the post ID - one follow
  // status applies across all of that author's posts, so we update every
  // post by that author in the feed at once.
  const toggleFollow = async (authorId) => {
    if (!authorId) return;
    setPosts((prev) =>
      prev.map((p) => (p.authorId === authorId ? { ...p, isFollowing: !p.isFollowing } : p))
    );
    try {
      const res = await fetch(`${API_URL}/follows/${authorId}`, {
        method: "POST",
        headers: authHeaders(),
      });
      if (!res.ok) fetchPosts(); // revert on failure
    } catch (err) {
      fetchPosts();
    }
  };

  // Fetch follow info (counts + isFollowing) for one profile - used on the
  // profile page, not the feed (feed toggle above is optimistic/local).
  const fetchFollowInfo = async (userId) => {
    try {
      const res = await fetch(`${API_URL}/follows/${userId}`, { headers: authHeaders() });
      const data = await res.json();
      if (res.ok) return data; // { followerCount, followingCount, isFollowing }
    } catch (err) {
      console.error("Failed to load follow info", err);
    }
    return null;
  };

  // --- SHARE (real backend, POST /api/shares/:postId records a share) ---
  const sharePost = async (id) => {
    setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, shares: p.shares + 1 } : p)));
    try {
      const res = await fetch(`${API_URL}/shares/${id}`, {
        method: "POST",
        headers: authHeaders(),
      });
      const data = await res.json();
      if (res.ok) {
        setPosts((prev) => prev.map((p) => (p.id === id ? { ...p, shares: data.shareCount } : p)));
      }
    } catch (err) {
      console.error("Failed to record share", err);
    }
  };

  // --- SAVE / BOOKMARK (local only - no backend endpoint for this yet) ---
  const toggleSave = (id) =>
    setSavedIds((prev) => (prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id]));

  // --- NOTIFICATIONS (local only until backend wiring is confirmed) ---
  const markNotificationRead = (id) =>
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
  const markAllNotificationsRead = () =>
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  const clearNotifications = () => setNotifications([]);

  const savedPosts = posts.filter((p) => savedIds.includes(p.id));
  const unreadCount = notifications.filter((n) => !n.read).length;

  return (
    <DataContext.Provider
      value={{
        posts,
        myPosts,
        savedPosts,
        savedIds,
        loading,
        commentsByPost,
        notifications,
        unreadCount,
        fetchPosts,
        addPost,
        deletePost,
        editPost,
        toggleFollow,
        fetchFollowInfo,
        toggleLike,
        sharePost,
        fetchComments,
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