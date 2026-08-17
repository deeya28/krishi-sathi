import { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useData } from "../context/DataContext";
import { PostIcon } from "../components/Icons";
import PostMediaGrid from "../components/dashboard/PostMediaGrid";

export default function MyPosts() {
  const { myPosts, editPost, deletePost } = useData();
  const [editingId, setEditingId] = useState(null);
  const [editText, setEditText] = useState("");

  const startEdit = (post) => {
    setEditingId(post.id);
    setEditText(post.text);
  };

  const saveEdit = (id) => {
    if (!editText.trim()) return;
    editPost(id, editText.trim());
    setEditingId(null);
  };

  return (
    <DashboardLayout>
      <h1
        className="text-ink text-2xl mb-1"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        My Posts
      </h1>
      <p className="text-sm text-ink/60 mb-6">
        Everything you&rsquo;ve shared with the community, in one place.
      </p>

      {myPosts.length === 0 ? (
        <div className="text-center py-16 text-ink/50 bg-white/40 rounded-md border border-soil/10">
          <PostIcon className="w-8 h-8 mx-auto mb-3" />
          <p>You haven&rsquo;t created any posts yet.</p>
          <p className="text-xs mt-1 text-ink/40">
            Head to the Home feed to share an update with the community.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {myPosts.map((post) => (
            <div key={post.id} className="bg-white/60 border border-soil/10 rounded-md p-5">
              <div className="flex items-center justify-between mb-3">
                <span className="text-xs text-ink/40" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {post.time}
                </span>
                {editingId !== post.id && (
                  <div className="flex gap-3 text-xs font-medium">
                    <button onClick={() => startEdit(post)} className="text-paddy-green hover:underline">
                      Edit
                    </button>
                    <button onClick={() => deletePost(post.id)} className="text-red-600 hover:underline">
                      Delete
                    </button>
                  </div>
                )}
              </div>

              {editingId === post.id ? (
                <div className="space-y-2">
                  <textarea
                    value={editText}
                    onChange={(e) => setEditText(e.target.value)}
                    rows={3}
                    className="w-full bg-white border border-soil/20 rounded-md p-2.5 text-sm text-ink focus:outline-none focus:border-paddy-green resize-none"
                  />
                  <div className="flex justify-end gap-2">
                    <button
                      onClick={() => setEditingId(null)}
                      className="text-xs px-3 py-1.5 rounded-md border border-soil/20 text-ink/70 hover:bg-soil/10"
                    >
                      Cancel
                    </button>
                    <button
                      onClick={() => saveEdit(post.id)}
                      className="text-xs px-3 py-1.5 rounded-md bg-paddy-green text-paper font-medium hover:bg-soil-dark"
                    >
                      Save
                    </button>
                  </div>
                </div>
              ) : (
                <>
                  <p className="text-sm text-ink/85 leading-relaxed">{post.text}</p>
                  <PostMediaGrid media={post.media} />
                </>
              )}

              <div className="flex gap-4 text-xs text-ink/50 mt-3 pt-3 border-t border-soil/10">
                <span>{post.likes} Likes</span>
                <span>{post.commentCount} Comments</span>
                <span>{post.shares} Shares</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}