import { useState, useRef, useEffect } from "react";
import { useTranslation } from "react-i18next";
import { useSearchParams, useLocation, Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import RightPanel from "../components/dashboard/RightPanel";
import { PostIcon, HeartIcon, ImageIcon, VideoIcon, XIcon } from "../components/Icons";
import PostMediaGrid, { getYouTubeEmbedUrl, getYouTubeThumbnail } from "../components/dashboard/PostMediaGrid";
import { useData } from "../context/DataContext";
import { useAuth } from "../context/AuthContext";

export default function Dashboard() {
  const { t } = useTranslation();
  const [searchParams] = useSearchParams();
  const location = useLocation();
  const { currentUser } = useAuth();
  const {
    posts,
    addPost,
    deletePost,
    editPost,
    toggleFollow,
    toggleLike,
    sharePost,
    addComment,
    loadComments,
    toggleSave,
    savedIds,
    commentsByPost,
    fetchComments,
  } = useData();

  const [postText, setPostText] = useState("");
  // Each entry: { file: File|null, url: previewUrl, type: "image"|"video", name }
  // file is null for YouTube link entries (those aren't uploadable File objects)
  const [attachedMedia, setAttachedMedia] = useState([]);
  const [showYouTubeInput, setShowYouTubeInput] = useState(false);
  const [youtubeInput, setYoutubeInput] = useState("");
  const [posting, setPosting] = useState(false);
  const [postError, setPostError] = useState("");

  const photoInputRef = useRef(null);
  const videoInputRef = useRef(null);

  // File upload states
  const [selectedFiles, setSelectedFiles] = useState([]);
  const [previews, setPreviews] = useState([]);

  // Edit Post States
  const [editingPostId, setEditingPostId] = useState(null);
  const [editText, setEditText] = useState("");

  // UI Interactive States
  const [commentInputs, setCommentInputs] = useState({});
  const [activeCommentDrawer, setActiveCommentDrawer] = useState({});
  const [activeMenuId, setActiveMenuId] = useState(null);

  // --- AUTHOR FILTER (from clicking a person in search results) ---
  const filterAuthorId = searchParams.get("author");
  const filterAuthorName = searchParams.get("authorName");

  // --- SCROLL-TO-POST + HIGHLIGHT (from clicking a post in search results) ---
  const [highlightedPostId, setHighlightedPostId] = useState(null);

  useEffect(() => {
    const targetId = location.state?.scrollToPostId;
    if (!targetId || posts.length === 0) return;

    const el = document.getElementById(`post-${targetId}`);
    if (el) {
      el.scrollIntoView({ behavior: "smooth", block: "center" });
      setHighlightedPostId(targetId);
      const timer = setTimeout(() => setHighlightedPostId(null), 2000);
      return () => clearTimeout(timer);
    }
    // Clear the browser history state so this doesn't re-trigger on next navigation
    window.history.replaceState({}, document.title);
  }, [location.state, posts]);

  // Revoke object URLs when they're no longer needed, to avoid memory leaks
  useEffect(() => {
    return () => {
      attachedMedia.forEach((m) => {
        if (m.file) URL.revokeObjectURL(m.url);
      });
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // --- PHOTO FILE SELECT ---
  // Keeps the real File object (needed for upload) alongside a fast local
  // preview URL (URL.createObjectURL - no need to read the whole file into
  // memory as base64 just to show a thumbnail).
  const handlePhotoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: "image",
      name: file.name,
    }));
    setAttachedMedia((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  // --- VIDEO FILE SELECT ---
  const handleVideoSelect = (e) => {
    const files = Array.from(e.target.files || []);
    const newEntries = files.map((file) => ({
      file,
      url: URL.createObjectURL(file),
      type: "video",
      name: file.name,
    }));
    setAttachedMedia((prev) => [...prev, ...newEntries]);
    e.target.value = "";
  };

  // --- YOUTUBE LINK ADD ---
  // NOTE: YouTube links aren't real uploadable files, so they aren't sent to
  // the backend's file upload - they're excluded when building the post.
  // (If you want YouTube links saved with the post, that needs a small
  // backend change to accept a separate "videoLinks" field.)
  const handleAddYouTubeLink = () => {
    if (!youtubeInput.trim()) return;
    setAttachedMedia((prev) => [
      ...prev,
      { file: null, url: youtubeInput.trim(), type: "video" },
    ]);
    setYoutubeInput("");
    setShowYouTubeInput(false);
  };

  // --- REMOVE ATTACHED MEDIA ---
  const handleRemoveMedia = (index) => {
    setAttachedMedia((prev) => {
      const target = prev[index];
      if (target?.file) URL.revokeObjectURL(target.url);
      return prev.filter((_, i) => i !== index);
    });
  };

  // --- CREATE POST ---
  const handleCreatePost = async (e) => {
    e.preventDefault();
    if (!postText.trim() && attachedMedia.length === 0) return;

    setPosting(true);
    setPostError("");

    // Only real File objects get uploaded - YouTube link entries are skipped
    // (see note above).
    const filesToUpload = attachedMedia.filter((m) => m.file).map((m) => m.file);

    const result = await addPost(postText, filesToUpload);

    if (!result.ok) {
      setPostError(result.error || "Failed to create post.");
      setPosting(false);
      return;
    }

    // Clean up preview object URLs now that the post succeeded
    attachedMedia.forEach((m) => {
      if (m.file) URL.revokeObjectURL(m.url);
    });

    setPostText("");
    setAttachedMedia([]);
    setShowYouTubeInput(false);
    setPosting(false);
  };

  // --- DELETE POST ---
  const handleDeletePost = (id) => {
    deletePost(id);
    setActiveMenuId(null);
  };

  // --- EDIT POST ---
  const handleStartEdit = (post) => {
    setEditingPostId(post.id);
    setEditText(post.text);
    setActiveMenuId(null);
  };

  const handleSaveEdit = (id) => {
    if (!editText.trim()) return;
    editPost(id, editText.trim());
    setEditingPostId(null);
    setEditText("");
  };

  // --- SHARE POST ---
  const handleShare = (id) => {
    sharePost(id);
    alert("Post shared with your agricultural network!");
  };

  // --- COMMENT ACTIONS ---
  const toggleCommentDrawer = (id) => {
    setActiveCommentDrawer((prev) => {
      const next = !prev[id];
      if (next) fetchComments(id);
      return { ...prev, [id]: next };
    });
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    addComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  // Apply the author filter (from search) to the posts list, if present
  const visiblePosts = filterAuthorId
    ? posts.filter((p) => p.authorId === filterAuthorId)
    : posts;

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
      <h1
        className="text-ink text-2xl mb-6"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {t("dashboard.home") || "Farmers' Community Network"}
      </h1>

      {/* AUTHOR FILTER BANNER */}
      {filterAuthorId && (
        <div className="flex items-center justify-between bg-paddy-green/10 border border-paddy-green/20 rounded-md px-4 py-2.5 mb-5 text-sm">
          <span className="text-ink">
            Showing posts by <strong>{filterAuthorName || "this user"}</strong>
          </span>
          <Link
            to="/dashboard"
            className="text-paddy-green font-medium hover:underline text-xs"
          >
            Clear filter
          </Link>
        </div>
      )}

      {/* CREATE POST CARD */}
      {!filterAuthorId && (
        <div className="bg-white/60 border border-soil/10 rounded-md p-5 mb-8 shadow-xs">
          <p
            className="text-xs uppercase tracking-wide text-ink/70 mb-3"
            style={{ fontFamily: "'JetBrains Mono', monospace" }}
          >
            {t("dashboard.createPost") || "Share Updates with Local Farmers"}
          </p>
          <textarea
            value={postText}
            onChange={(e) => setPostText(e.target.value)}
            rows={3}
            placeholder={
              t("dashboard.createPostPlaceholder") || "Ask questions about crops, soil conditions, market rates, or share a suggestion..."
            }
            className="w-full bg-transparent border border-soil/15 rounded-md p-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-paddy-green transition-colors resize-none"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          />

          {postError && (
            <p className="text-xs text-red-600 mt-2">{postError}</p>
          )}

          {/* ATTACHED MEDIA PREVIEW ROW */}
          {attachedMedia.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-2 pt-2 border-t border-soil/10">
              {attachedMedia.map((media, idx) => {
                const youtubeEmbed = getYouTubeEmbedUrl(media.url);
                const ytThumb = getYouTubeThumbnail(media.url);
                return (
                  <div
                    key={idx}
                    className="relative group w-20 h-20 rounded-md overflow-hidden bg-black/10 border border-soil/20 shrink-0"
                  >
                    {media.type === "image" ? (
                      <img
                        src={media.url}
                        alt="Upload preview"
                        className="w-full h-full object-cover"
                      />
                    ) : youtubeEmbed ? (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        {ytThumb ? (
                          <img
                            src={ytThumb}
                            alt="YouTube preview"
                            className="w-full h-full object-cover opacity-80"
                          />
                        ) : (
                          <div className="w-full h-full bg-red-950 flex flex-col items-center justify-center p-1" />
                        )}
                        <div className="absolute inset-0 flex items-center justify-center bg-black/30">
                          <span className="bg-red-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow">
                            ▶ YouTube
                          </span>
                        </div>
                      </div>
                    ) : (
                      <video
                        src={media.url}
                        className="w-full h-full object-cover"
                      />
                    )}
                    <button
                      type="button"
                      onClick={() => handleRemoveMedia(idx)}
                      className="absolute top-1 right-1 bg-black/70 hover:bg-red-600 text-white rounded-full p-0.5 transition-colors z-10"
                      title="Remove item"
                    >
                      <XIcon className="w-3.5 h-3.5" />
                    </button>
                  </div>
                );
              })}
            </div>
          )}

          {/* YOUTUBE LINK INPUT POPUP */}
          {showYouTubeInput && (
            <div className="mt-3 p-3 bg-soil/5 border border-soil/15 rounded-md flex items-center gap-2">
              <input
                type="text"
                value={youtubeInput}
                onChange={(e) => setYoutubeInput(e.target.value)}
                placeholder="Paste YouTube Video URL for Video Storage (e.g. https://www.youtube.com/watch?v=...)"
                className="flex-1 bg-white border border-soil/20 rounded px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-paddy-green"
              />
              <button
                type="button"
                onClick={handleAddYouTubeLink}
                className="text-xs px-3 py-1.5 bg-paddy-green text-paper rounded font-medium hover:bg-soil-dark"
              >
                Attach Video
              </button>
              <button
                type="button"
                onClick={() => setShowYouTubeInput(false)}
                className="text-xs text-ink/60 hover:text-ink"
              >
                Cancel
              </button>
            </div>
          )}

          {/* TOOLBAR FOR MEDIA UPLOADS & POST BUTTON */}
          <div className="flex items-center justify-between mt-3 pt-2 border-t border-soil/10">
            {/* MEDIA UPLOAD BUTTONS */}
            <div className="flex items-center gap-2">
              {/* Photo Button */}
              <input
                type="file"
                ref={photoInputRef}
                onChange={handlePhotoSelect}
                accept="image/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-soil/15 hover:bg-soil/5 text-ink/80 transition-colors"
                title="Add Photo"
              >
                <ImageIcon className="w-4 h-4 text-paddy-green" />
                <span>Photo</span>
              </button>

              {/* YouTube Video Button (Storage) */}
              <button
                type="button"
                onClick={() => setShowYouTubeInput((prev) => !prev)}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-soil/15 hover:bg-soil/5 text-ink/80 transition-colors"
                title="Attach a YouTube link (not uploaded, link only)"
              >
                <span className="text-red-600 font-bold text-xs">▶</span>
                <span>Video (YouTube)</span>
              </button>

              {/* Video File Upload */}
              <input
                type="file"
                ref={videoInputRef}
                onChange={handleVideoSelect}
                accept="video/*"
                multiple
                className="hidden"
              />
              <button
                type="button"
                onClick={() => videoInputRef.current?.click()}
                className="flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-md border border-soil/15 hover:bg-soil/5 text-ink/80 transition-colors"
                title="Upload Video file"
              >
                <VideoIcon className="w-4 h-4 text-red-600" />
                <span>Video File</span>
              </button>
            </div>

            <button
              type="button"
              onClick={handleCreatePost}
              disabled={(!postText.trim() && attachedMedia.length === 0) || posting}
              className="text-sm px-6 py-2 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors disabled:opacity-50 cursor-pointer"
              style={{ fontFamily: "'Work Sans', sans-serif" }}
            >
              {posting ? "Posting..." : t("dashboard.post") || "Publish Post"}
            </button>
          </div>
        </div>
      )}

      {/* FEED HEADER */}
      <p
        className="text-xs uppercase tracking-wide text-ink/70 mb-4"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {filterAuthorId
          ? "Filtered Posts"
          : t("dashboard.recentPosts") || "Recent Updates from the Field"}
      </p>

      {/* POSTS FEED */}
      <div className="space-y-5">
        {visiblePosts.map((post) => {
          const isCommentsOpen = activeCommentDrawer[post.id];
          const isEditing = editingPostId === post.id;
          const isSaved = savedIds.includes(post.id);
          const isHighlighted = highlightedPostId === post.id;
          const postComments = commentsByPost[post.id] || [];

          return (
            <div
              key={post.id}
              id={`post-${post.id}`}
              className={`bg-white/60 border rounded-md p-5 relative transition-all ${
                isHighlighted
                  ? "border-paddy-green ring-2 ring-paddy-green/30"
                  : "border-soil/10"
              }`}
            >
              {/* HEADER */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-soil/10 gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <Link to={`/profile/${post.authorId}`} className="shrink-0 mt-0.5">
                    <span className="w-11 h-11 rounded-full bg-paddy-green text-paper flex items-center justify-center text-base font-bold">
                      {post.name.charAt(0)}
                    </span>
                  </Link>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <Link
                        to={`/profile/${post.authorId}`}
                        className="text-sm font-semibold text-ink hover:underline"
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        {post.name}
                      </Link>
                    </div>

                    {post.location && (
                      <p className="text-xs text-ink/60 font-medium">{post.location}</p>
                    )}

                    {/* CROP / ISSUE INFO */}
                    {(post.cropName || (post.issueType && post.issueType !== "other")) && (
                      <div className="flex items-center gap-3 text-[11px] text-ink/50 mt-1 flex-wrap">
                        {post.cropName && (
                          <span><strong>Crop:</strong> {post.cropName}</span>
                        )}
                        {post.issueType && post.issueType !== "other" && (
                          <>
                            {post.cropName && <span>•</span>}
                            <span><strong>Issue:</strong> {post.issueType}</span>
                          </>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Follow Button - keyed to the author, not the post */}
                  {post.authorId !== currentUser?._id && (
                    <button
                      onClick={() => toggleFollow(post.authorId)}
                      className={`hidden sm:inline-flex text-xs px-3 py-1 rounded-full border transition-all ${
                        post.isFollowing
                          ? "bg-soil/10 border-soil/20 text-ink/70"
                          : "border-paddy-green text-paddy-green hover:bg-paddy-green hover:text-paper"
                      }`}
                    >
                      {post.isFollowing ? "Following" : "+ Follow"}
                    </button>
                  )}

                  {/* Save / Bookmark Button */}
                  <button
                    onClick={() => toggleSave(post.id)}
                    aria-label={isSaved ? "Unsave post" : "Save post"}
                    title={isSaved ? "Unsave post" : "Save post"}
                    className={`p-1.5 rounded-full transition-colors ${
                      isSaved ? "text-paddy-green" : "text-ink/50 hover:text-paddy-green"
                    }`}
                  >
                    <HeartIcon
                      className="w-4 h-4"
                      fill={isSaved ? "currentColor" : "none"}
                    />
                  </button>

                  <span
                    className="text-xs text-ink/40 ml-1 hidden sm:inline"
                    style={{ fontFamily: "'JetBrains Mono', monospace" }}
                  >
                    {post.time}
                  </span>

                  {/* Options Menu Button (...) - only visible on your own posts */}
                  {post.authorId === currentUser?._id && (
                    <div className="relative">
                      <button
                        onClick={() =>
                          setActiveMenuId(activeMenuId === post.id ? null : post.id)
                        }
                        className="p-1 rounded-full text-ink/60 hover:text-ink hover:bg-soil/10 transition-colors"
                      >
                        •••
                      </button>

                      {/* Options Dropdown */}
                      {activeMenuId === post.id && (
                        <div className="absolute right-0 mt-1 w-32 bg-white border border-soil/15 rounded-md shadow-md z-10 py-1 text-xs font-medium">
                          <button
                            onClick={() => handleStartEdit(post)}
                            className="w-full text-left px-3 py-1.5 hover:bg-soil/5 text-ink transition-colors"
                          >
                            Edit Post
                          </button>
                          <button
                            onClick={() => handleDeletePost(post.id)}
                            className="w-full text-left px-3 py-1.5 hover:bg-red-50 text-red-600 transition-colors"
                          >
                            Delete Post
                          </button>
                        </div>
                      )}
                    </div>
                  )}
                </div>
              </div>

              {/* POST CONTENT OR EDIT FORM */}
              {isEditing ? (
                <div className="mb-4 space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-soil/20 rounded-md p-2.5 text-sm text-ink focus:outline-none focus:border-paddy-green"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingPostId(null)}
                      className="text-xs px-3 py-1.5 rounded-md border border-soil/20 text-ink/70 hover:bg-soil/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => handleSaveEdit(post.id)}
                      className="text-xs px-3 py-1.5 rounded-md bg-paddy-green text-paper font-medium hover:bg-soil-dark"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p
                    className="text-sm text-ink/85 leading-relaxed mb-3"
                    style={{ fontFamily: "'Work Sans', sans-serif" }}
                  >
                    {post.text}
                  </p>

                  {/* POST PHOTOS & VIDEOS GRID */}
                  <PostMediaGrid media={post.media} />
                </>
              )}

              {/* STATS SUMMARY COUNTER */}
              <div className="flex justify-between items-center text-xs text-ink/50 py-1.5 border-t border-soil/10 mb-2">
                <span>{post.likes} {post.likes === 1 ? "Like" : "Likes"}</span>
                <div className="space-x-3">
                  <button onClick={() => toggleCommentDrawer(post.id)} className="hover:underline">
                    {postComments.length} Comments
                  </button>
                  <span>{post.shares} Shares</span>
                </div>
              </div>

              {/* ACTION BUTTONS (LIKE, COMMENT, SHARE) */}
              <div className="grid grid-cols-3 gap-1 border-t border-b border-soil/10 py-1 mb-3 text-xs font-medium text-ink/70">
                <button
                  onClick={() => toggleLike(post.id)}
                  className={`flex items-center justify-center gap-1.5 py-1.5 rounded-md hover:bg-soil/5 transition-colors ${
                    post.isLiked ? "text-paddy-green font-bold" : ""
                  }`}
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  <span>{post.isLiked ? "❤️ Liked" : "🤍 Like"}</span>
                </button>

                <button
                  onClick={() => toggleCommentDrawer(post.id)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-md hover:bg-soil/5 transition-colors"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  💬 Comment
                </button>

                <button
                  onClick={() => handleShare(post.id)}
                  className="flex items-center justify-center gap-1.5 py-1.5 rounded-md hover:bg-soil/5 transition-colors"
                  style={{ fontFamily: "'Work Sans', sans-serif" }}
                >
                  ↪ Share
                </button>
              </div>

              {/* COMMENTS SECTION */}
              {isCommentsOpen && (
                <div className="mt-3 pt-2 space-y-3 bg-soil/5 p-3 rounded-md border border-soil/10">
                  {/* EXISTING COMMENTS LIST */}
                  {postComments.length > 0 ? (
                    <div className="space-y-2">
                      {postComments.map((comment) => (
                        <div key={comment.id} className="bg-white/80 p-2.5 rounded-md border border-soil/10">
                          <div className="flex justify-between items-center mb-0.5">
                            <span className="text-xs font-bold text-ink">{comment.name}</span>
                            <span
                              className="text-[10px] text-ink/40"
                              style={{ fontFamily: "'JetBrains Mono', monospace" }}
                            >
                              {comment.time}
                            </span>
                          </div>
                          <p className="text-xs text-ink/80">{comment.text}</p>
                        </div>
                      ))}
                    </div>
                  ) : (
                    <p className="text-xs text-ink/40 text-center py-1">No comments yet. Be the first to comment!</p>
                  )}

                  {/* ADD NEW COMMENT INPUT */}
                  <div className="flex gap-2 pt-1">
                    <input
                      type="text"
                      placeholder="Write a comment..."
                      value={commentInputs[post.id] || ""}
                      onChange={(e) =>
                        setCommentInputs({ ...commentInputs, [post.id]: e.target.value })
                      }
                      onKeyDown={(e) => e.key === "Enter" && handleAddComment(post.id)}
                      className="flex-1 bg-white border border-soil/15 rounded-md px-3 py-1.5 text-xs text-ink focus:outline-none focus:border-paddy-green"
                    />
                    <button
                      onClick={() => handleAddComment(post.id)}
                      className="text-xs px-3 py-1.5 bg-paddy-green text-paper font-medium rounded-md hover:bg-soil-dark transition-colors shrink-0"
                    >
                      Comment
                    </button>
                  </div>
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* EMPTY FEED STATE */}
      {visiblePosts.length === 0 && (
        <div className="text-center py-16 text-ink/50">
          <PostIcon className="w-8 h-8 mx-auto mb-3" />
          <p style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {filterAuthorId
              ? "This user hasn't posted anything yet."
              : t("dashboard.noPosts") || "No posts found in feed."}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}