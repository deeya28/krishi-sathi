import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import RightPanel from "../components/dashboard/RightPanel";
import { PostIcon, HeartIcon } from "../components/Icons";
import { useData } from "../context/DataContext";

export default function Dashboard() {
  const { t } = useTranslation();
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
  } = useData();

  const [postText, setPostText] = useState("");

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

  // --- FILE UPLOAD HANDLERS ---
  const handleFileChange = (e) => {
    const files = Array.from(e.target.files).slice(0, 5); // max 5 files
    setSelectedFiles(files);
    setPreviews(
      files.map((file) => ({
        url: URL.createObjectURL(file),
        type: file.type.startsWith("video") ? "video" : "image",
      }))
    );
  };

  const removeSelectedFile = (index) => {
    setSelectedFiles((prev) => prev.filter((_, i) => i !== index));
    setPreviews((prev) => prev.filter((_, i) => i !== index));
  };

  // --- CREATE POST ---
  const handleCreatePost = (e) => {
    e.preventDefault();
    if (!postText.trim()) return;
    addPost(postText, selectedFiles);
    setPostText("");
    setSelectedFiles([]);
    setPreviews([]);
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
    const isOpening = !activeCommentDrawer[id];
    setActiveCommentDrawer((prev) => ({ ...prev, [id]: !prev[id] }));
    // Fetch comments from the backend the first time the drawer opens
    if (isOpening) loadComments(id);
  };

  const handleAddComment = (postId) => {
    const text = commentInputs[postId];
    addComment(postId, text);
    setCommentInputs((prev) => ({ ...prev, [postId]: "" }));
  };

  return (
    <DashboardLayout rightPanel={<RightPanel />}>
      <h1
        className="text-ink text-2xl mb-6"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        {t("dashboard.home") || "Farmers' Community Network"}
      </h1>

      {/* CREATE POST CARD */}
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
            t("dashboard.createPostPlaceholder") || "Ask questions about crops, soil conditions, or market rates..."
          }
          className="w-full bg-transparent border border-soil/15 rounded-md p-3 text-sm text-ink placeholder:text-ink/40 focus:outline-none focus:border-paddy-green transition-colors resize-none"
          style={{ fontFamily: "'Work Sans', sans-serif" }}
        />

        {/* MEDIA PREVIEW THUMBNAILS */}
        {previews.length > 0 && (
          <div className="flex gap-2 flex-wrap mt-3">
            {previews.map((preview, index) => (
              <div
                key={index}
                className="relative w-20 h-20 rounded-md overflow-hidden border border-soil/15"
              >
                {preview.type === "video" ? (
                  <video src={preview.url} className="w-full h-full object-cover" />
                ) : (
                  <img src={preview.url} className="w-full h-full object-cover" alt="" />
                )}
                <button
                  type="button"
                  onClick={() => removeSelectedFile(index)}
                  className="absolute top-0.5 right-0.5 w-5 h-5 rounded-full bg-black/60 text-white text-xs flex items-center justify-center"
                >
                  x
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="flex justify-between items-center mt-3">
          <label className="text-xs text-paddy-green font-medium cursor-pointer hover:underline">
            📷 Add Photos/Videos
            <input
              type="file"
              accept="image/*,video/*"
              multiple
              onChange={handleFileChange}
              className="hidden"
            />
          </label>

          <button
            type="button"
            onClick={handleCreatePost}
            disabled={!postText.trim()}
            className="text-sm px-6 py-2 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors disabled:opacity-50 cursor-pointer"
            style={{ fontFamily: "'Work Sans', sans-serif" }}
          >
            {t("dashboard.post") || "Publish Post"}
          </button>
        </div>
      </div>

      {/* FEED HEADER */}
      <p
        className="text-xs uppercase tracking-wide text-ink/70 mb-4"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {t("dashboard.recentPosts") || "Recent Updates from the Field"}
      </p>

      {/* POSTS FEED */}
      <div className="space-y-5">
        {posts.map((post) => {
          const isCommentsOpen = activeCommentDrawer[post.id];
          const isEditing = editingPostId === post.id;
          const isSaved = savedIds.includes(post.id);

          return (
            <div
              key={post.id}
              className="bg-white/60 border border-soil/10 rounded-md p-5 relative transition-all"
            >
              {/* HEADER WITH EXTENDED FARMER INFO */}
              <div className="flex items-start justify-between mb-3 pb-3 border-b border-soil/10 gap-3">
                <div className="flex items-start gap-3 min-w-0">
                  <span className="w-11 h-11 rounded-full bg-paddy-green text-paper flex items-center justify-center text-base font-bold shrink-0 mt-0.5">
                    {post.name.charAt(0)}
                  </span>

                  <div className="min-w-0">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p
                        className="text-sm font-semibold text-ink"
                        style={{ fontFamily: "'Work Sans', sans-serif" }}
                      >
                        {post.name}
                      </p>
                      {post.badge && (
                        <span className="text-[10px] bg-paddy-green/10 text-paddy-green font-bold px-2 py-0.5 rounded border border-paddy-green/20">
                          {post.badge}
                        </span>
                      )}
                    </div>

                    <p className="text-xs text-ink/60 font-medium">
                      {post.role} • <span className="text-ink/80">{post.location}</span>
                    </p>

                    {/* FARMER STATS & CROPS */}
                    <div className="flex items-center gap-3 text-[11px] text-ink/50 mt-1 flex-wrap">
                      <span><strong>Land:</strong> {post.farmSize}</span>
                      {post.primaryCrops.length > 0 && (
                        <>
                          <span>•</span>
                          <span className="truncate max-w-xs">
                            <strong>Crops:</strong> {post.primaryCrops.join(", ")}
                          </span>
                        </>
                      )}
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 shrink-0">
                  {/* Follow Button */}
                  <button
                    onClick={() => toggleFollow(post.id)}
                    className={`hidden sm:inline-flex text-xs px-3 py-1 rounded-full border transition-all ${
                      post.isFollowing
                        ? "bg-soil/10 border-soil/20 text-ink/70"
                        : "border-paddy-green text-paddy-green hover:bg-paddy-green hover:text-paper"
                    }`}
                  >
                    {post.isFollowing ? "Following" : "+ Follow"}
                  </button>

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

                  {/* Options Menu Button (...) */}
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

                  {/* UPLOADED MEDIA DISPLAY */}
                  {post.media && post.media.length > 0 && (
                    <div className="flex gap-2 flex-wrap mb-4">
                      {post.media.map((m, i) =>
                        m.type === "video" ? (
                          <video
                            key={i}
                            src={m.url}
                            controls
                            className="w-full max-w-xs rounded-md"
                          />
                        ) : (
                          <img
                            key={i}
                            src={m.url}
                            className="w-full max-w-xs rounded-md object-cover"
                            alt=""
                          />
                        )
                      )}
                    </div>
                  )}
                </>
              )}

              {/* STATS SUMMARY COUNTER */}
              <div className="flex justify-between items-center text-xs text-ink/50 py-1.5 border-t border-soil/10 mb-2">
                <span>{post.likes} {post.likes === 1 ? "Like" : "Likes"}</span>
                <div className="space-x-3">
                  <button onClick={() => toggleCommentDrawer(post.id)} className="hover:underline">
                    {post.comments.length} Comments
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
                  {post.comments.length > 0 ? (
                    <div className="space-y-2">
                      {post.comments.map((comment) => (
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
      {posts.length === 0 && (
        <div className="text-center py-16 text-ink/50">
          <PostIcon className="w-8 h-8 mx-auto mb-3" />
          <p style={{ fontFamily: "'Work Sans', sans-serif" }}>
            {t("dashboard.noPosts") || "No posts found in feed."}
          </p>
        </div>
      )}
    </DashboardLayout>
  );
}