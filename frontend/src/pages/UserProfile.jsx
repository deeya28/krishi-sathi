import { useEffect, useState } from "react";
import { useParams, Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import PostMediaGrid from "../components/dashboard/PostMediaGrid";
import { PinIcon, PostIcon } from "../components/Icons";

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000/api";

const ROLE_LABELS = {
  farmer: "Farmer",
  agricultural_expert: "Agricultural Expert",
  community_user: "Community User",
  admin: "Admin",
};

export default function UserProfile() {
  const { id } = useParams();
  const { token, currentUser } = useAuth();
  const { toggleFollow, fetchFollowInfo } = useData();

  const [profile, setProfile] = useState(null);
  const [posts, setPosts] = useState([]);
  const [followInfo, setFollowInfo] = useState({
    followerCount: 0,
    followingCount: 0,
    isFollowing: false,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const isOwnProfile = currentUser?._id === id;

  useEffect(() => {
    if (!token || !id) return;

    // If someone clicks their own name/avatar, send them to the real
    // editable profile instead of rendering a read-only duplicate.
    if (isOwnProfile) return;

    const load = async () => {
      setLoading(true);
      setError("");
      try {
        const headers = { Authorization: `Bearer ${token}` };

        const [profileRes, postsRes] = await Promise.all([
          fetch(`${API_URL}/users/${id}`, { headers }),
          fetch(`${API_URL}/users/${id}/posts`, { headers }),
        ]);

        const profileData = await profileRes.json();
        const postsData = await postsRes.json();

        if (!profileRes.ok) {
          setError(profileData.message || "User not found.");
          return;
        }

        setProfile(profileData.user);
        setPosts(postsData.posts || []);

        const info = await fetchFollowInfo(id);
        if (info) setFollowInfo(info);
      } catch (err) {
        setError("Could not load this profile. Is the backend running?");
      } finally {
        setLoading(false);
      }
    };

    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [id, token, isOwnProfile]);

  const handleFollowClick = async () => {
    await toggleFollow(id);
    const info = await fetchFollowInfo(id);
    if (info) setFollowInfo(info);
  };

  if (isOwnProfile) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-ink/50">
          <p>This is your own profile.</p>
          <Link to="/dashboard/profile" className="text-paddy-green hover:underline text-sm mt-2 inline-block">
            Go to My Profile
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  if (loading) {
    return (
      <DashboardLayout>
        <p className="text-center text-ink/50 py-16">Loading profile...</p>
      </DashboardLayout>
    );
  }

  if (error || !profile) {
    return (
      <DashboardLayout>
        <div className="text-center py-16 text-ink/50">
          <p>{error || "User not found."}</p>
          <Link to="/dashboard" className="text-paddy-green hover:underline text-sm mt-2 inline-block">
            Back to feed
          </Link>
        </div>
      </DashboardLayout>
    );
  }

  const displayRole = ROLE_LABELS[profile.role] || profile.role || "Community User";
  const initial = profile.name?.trim()?.[0]?.toUpperCase() || "K";

  return (
    <DashboardLayout>
      {/* PROFILE HEADER */}
      <div className="bg-white/60 border border-soil/10 rounded-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5">
          <span className="w-20 h-20 rounded-full bg-paddy-green text-paper flex items-center justify-center text-2xl font-bold shrink-0">
            {initial}
          </span>

          <div className="min-w-0">
            <h1 className="text-ink text-xl" style={{ fontFamily: "'Fraunces', serif" }}>
              {profile.name}
            </h1>
            <span className="inline-block mt-1 text-[11px] bg-paddy-green/10 text-paddy-green font-bold px-2 py-0.5 rounded border border-paddy-green/20">
              {displayRole}
            </span>

            <div className="flex items-center gap-4 mt-3 text-xs text-ink/60">
              <span><strong className="text-ink">{followInfo.followerCount}</strong> Followers</span>
              <span><strong className="text-ink">{followInfo.followingCount}</strong> Following</span>
              <span><strong className="text-ink">{posts.length}</strong> Posts</span>
            </div>
          </div>

          <button
            onClick={handleFollowClick}
            className={`sm:ml-auto text-sm px-5 py-2 rounded-full border transition-colors self-start ${
              followInfo.isFollowing
                ? "bg-soil/10 border-soil/20 text-ink/70"
                : "border-paddy-green text-paddy-green hover:bg-paddy-green hover:text-paper"
            }`}
          >
            {followInfo.isFollowing ? "Following" : "+ Follow"}
          </button>
        </div>

        <div className="mt-5 space-y-2 max-w-md">
          <p className="text-sm text-ink/80 flex items-center gap-2">
            <PinIcon className="w-4 h-4 text-ink/40 shrink-0" />
            {profile.location || "Location not set"}
          </p>
          {profile.bio && <p className="text-sm text-ink/70 leading-relaxed">{profile.bio}</p>}
        </div>
      </div>

      {/* PROFILE'S POSTS */}
      <p
        className="text-xs uppercase tracking-wide text-ink/70 mb-4"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        {profile.name}'s Posts ({posts.length})
      </p>

      {posts.length === 0 ? (
        <div className="text-center py-14 text-ink/50 bg-white/40 rounded-md border border-soil/10">
          <PostIcon className="w-8 h-8 mx-auto mb-3" />
          <p>{profile.name} hasn&rsquo;t posted anything yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {posts.map((post) => (
            <div key={post._id} className="bg-white/60 border border-soil/10 rounded-md p-4">
              {post.cropName && (
                <p className="text-xs text-ink/50 mb-1"><strong>Crop:</strong> {post.cropName}</p>
              )}
              <p className="text-sm text-ink/85 leading-relaxed">{post.description}</p>
              <PostMediaGrid media={post.media} />
              <p className="text-xs text-ink/40 mt-2">
                {new Date(post.createdAt).toLocaleDateString()}
              </p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}