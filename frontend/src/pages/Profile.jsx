import { useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useAuth } from "../context/AuthContext";
import { useData } from "../context/DataContext";
import { PinIcon, PostIcon } from "../components/Icons";

export default function Profile() {
  const { currentUser, updateProfile } = useAuth();
  const { myPosts } = useData();
  const [editing, setEditing] = useState(false);
  const [form, setForm] = useState({
    name: currentUser?.name || "",
    role: currentUser?.role || "Farmer",
    location: currentUser?.location || "",
    bio: currentUser?.bio || "",
  });

  const initial = currentUser?.name?.trim()?.[0]?.toUpperCase() || "K";

  const handleChange = (e) =>
    setForm((f) => ({ ...f, [e.target.name]: e.target.value }));

  const handleSave = (e) => {
    e.preventDefault();
    updateProfile(form);
    setEditing(false);
  };

  return (
    <DashboardLayout>
      <h1
        className="text-ink text-2xl mb-6"
        style={{ fontFamily: "'Fraunces', serif" }}
      >
        My Profile
      </h1>

      <div className="bg-white/60 border border-soil/10 rounded-md p-6 mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center gap-5 mb-6">
          <span className="w-20 h-20 rounded-full bg-paddy-green text-paper flex items-center justify-center text-2xl font-bold shrink-0">
            {initial}
          </span>
          <div>
            <h2
              className="text-ink text-xl"
              style={{ fontFamily: "'Fraunces', serif" }}
            >
              {currentUser?.name}
            </h2>
            <p className="text-sm text-ink/60">{currentUser?.email}</p>
            <span className="inline-block mt-1 text-[11px] bg-paddy-green/10 text-paddy-green font-bold px-2 py-0.5 rounded border border-paddy-green/20">
              {currentUser?.role}
            </span>
          </div>
          {!editing && (
            <button
              type="button"
              onClick={() => setEditing(true)}
              className="sm:ml-auto text-sm px-5 py-2 rounded-full border border-paddy-green text-paddy-green hover:bg-paddy-green hover:text-paper transition-colors self-start"
            >
              Edit Profile
            </button>
          )}
        </div>

        {editing ? (
          <form onSubmit={handleSave} className="space-y-5 max-w-md">
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/70 mb-1.5">
                Full Name
              </label>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                className="w-full bg-white border border-soil/20 rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-paddy-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/70 mb-1.5">
                Role
              </label>
              <select
                name="role"
                value={form.role}
                onChange={handleChange}
                className="w-full bg-white border border-soil/20 rounded-md px-3 py-2 text-sm text-ink focus:outline-none focus:border-paddy-green"
              >
                <option value="Farmer">Farmer</option>
                <option value="Expert">Expert</option>
                <option value="Vendor">Vendor</option>
              </select>
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/70 mb-1.5">
                Location
              </label>
              <input
                name="location"
                value={form.location}
                onChange={handleChange}
                placeholder="e.g. Bharatpur, Chitwan"
                className="w-full bg-white border border-soil/20 rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green"
              />
            </div>
            <div>
              <label className="block text-xs uppercase tracking-wide text-ink/70 mb-1.5">
                Bio
              </label>
              <textarea
                name="bio"
                value={form.bio}
                onChange={handleChange}
                rows={3}
                placeholder="Tell the community about yourself..."
                className="w-full bg-white border border-soil/20 rounded-md px-3 py-2 text-sm text-ink placeholder:text-ink/35 focus:outline-none focus:border-paddy-green resize-none"
              />
            </div>
            <div className="flex gap-3">
              <button
                type="submit"
                className="text-sm px-6 py-2 rounded-full bg-paddy-green text-paper font-medium hover:bg-soil-dark transition-colors"
              >
                Save Changes
              </button>
              <button
                type="button"
                onClick={() => setEditing(false)}
                className="text-sm px-6 py-2 rounded-full border border-soil/20 text-ink/70 hover:bg-soil/10 transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <div className="space-y-3 max-w-md">
            <p className="text-sm text-ink/80 flex items-center gap-2">
              <PinIcon className="w-4 h-4 text-ink/40 shrink-0" />
              {currentUser?.location || "Location not set"}
            </p>
            <p className="text-sm text-ink/70 leading-relaxed">
              {currentUser?.bio || "No bio yet. Click Edit Profile to introduce yourself to the community."}
            </p>
          </div>
        )}
      </div>

      <p
        className="text-xs uppercase tracking-wide text-ink/70 mb-4"
        style={{ fontFamily: "'JetBrains Mono', monospace" }}
      >
        My Recent Posts ({myPosts.length})
      </p>

      {myPosts.length === 0 ? (
        <div className="text-center py-14 text-ink/50 bg-white/40 rounded-md border border-soil/10">
          <PostIcon className="w-8 h-8 mx-auto mb-3" />
          <p>You haven&rsquo;t posted anything yet.</p>
        </div>
      ) : (
        <div className="space-y-3">
          {myPosts.map((post) => (
            <div key={post.id} className="bg-white/60 border border-soil/10 rounded-md p-4">
              <p className="text-sm text-ink/85 leading-relaxed">{post.text}</p>
              <p className="text-xs text-ink/40 mt-2">{post.time}</p>
            </div>
          ))}
        </div>
      )}
    </DashboardLayout>
  );
}
