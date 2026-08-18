import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useData } from "../context/DataContext";
import { HeartIcon } from "../components/Icons";
import PostMediaGrid from "../components/dashboard/PostMediaGrid";

export default function SavedPosts() {
  const { savedPosts, toggleSave } = useData();

  return (
    <DashboardLayout>
      <h1
        className="text-ink text-2xl mb-1"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        Saved Posts
      </h1>
      <p className="text-sm text-ink/60 mb-6">
        Posts you&rsquo;ve bookmarked to read again later.
      </p>

      {savedPosts.length === 0 ? (
        <div className="text-center py-16 text-ink/50 bg-white/40 rounded-md border border-soil/10">
          <HeartIcon className="w-8 h-8 mx-auto mb-3" />
          <p>No saved posts yet.</p>
          <p className="text-xs mt-1 text-ink/40">
            Tap the heart icon on any post in the Home feed to save it here.
          </p>
        </div>
      ) : (
        <div className="space-y-4">
          {savedPosts.map((post) => (
            <div key={post.id} className="bg-white/60 border border-soil/10 rounded-md p-5">
              <div className="flex items-start justify-between mb-2 gap-3">
                <div className="flex items-center gap-3 min-w-0">
                  <span className="w-9 h-9 rounded-full bg-paddy-green text-paper flex items-center justify-center text-sm font-bold shrink-0">
                    {post.name.charAt(0)}
                  </span>
                  <div className="min-w-0">
                    <p className="text-sm font-semibold text-ink truncate">{post.name}</p>
                    <p className="text-xs text-ink/60">{post.role}</p>
                  </div>
                </div>
                <button
                  onClick={() => toggleSave(post.id)}
                  className="text-paddy-green shrink-0"
                  aria-label="Unsave post"
                  title="Unsave post"
                >
                  <HeartIcon className="w-4 h-4" fill="currentColor" />
                </button>
              </div>
              <p className="text-sm text-ink/85 leading-relaxed">{post.text}</p>
              <PostMediaGrid media={post.media} />
              <div className="flex gap-4 text-xs text-ink/50 mt-3 pt-3 border-t border-soil/10">
                <span>{post.likes} Likes</span>
                <span>{post.comments.length} Comments</span>
                <span>{post.shares} Shares</span>
              </div>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
