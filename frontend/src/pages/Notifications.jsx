import DashboardLayout from "../components/dashboard/DashboardLayout";
import { useData } from "../context/DataContext";
import { BellIcon, HeartIcon, PostIcon, UsersIcon } from "../components/Icons";

const ICONS = {
  like: HeartIcon,
  comment: PostIcon,
  follow: UsersIcon,
  system: BellIcon,
};

export default function Notifications() {
  const { notifications, markNotificationRead, markAllNotificationsRead, clearNotifications } =
    useData();

  return (
    <DashboardLayout>
      <div className="flex items-center justify-between mb-1 gap-3 flex-wrap">
        <h1
          className="text-ink text-2xl"
          style={{ fontFamily: "'Fraunces', serif" }}
        >
          Notifications
        </h1>
        {notifications.length > 0 && (
          <div className="flex gap-4 text-xs font-medium">
            <button onClick={markAllNotificationsRead} className="text-paddy-green hover:underline">
              Mark all as read
            </button>
            <button onClick={clearNotifications} className="text-red-600 hover:underline">
              Clear all
            </button>
          </div>
        )}
      </div>
      <p className="text-sm text-ink/60 mb-6">Updates from your community, in one place.</p>

      {notifications.length === 0 ? (
        <div className="text-center py-16 text-ink/50 bg-white/40 rounded-md border border-soil/10">
          <BellIcon className="w-8 h-8 mx-auto mb-3" />
          <p>You&rsquo;re all caught up. No notifications.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map((n) => {
            const Icon = ICONS[n.type] || BellIcon;
            return (
              <button
                key={n.id}
                onClick={() => markNotificationRead(n.id)}
                className={`w-full flex items-start gap-3 text-left p-4 rounded-md border transition-colors ${
                  n.read
                    ? "bg-white/40 border-soil/10"
                    : "bg-paddy-green/5 border-paddy-green/20"
                }`}
              >
                <span className="w-9 h-9 rounded-full bg-paddy-green/10 text-paddy-green flex items-center justify-center shrink-0">
                  <Icon className="w-4 h-4" />
                </span>
                <div className="min-w-0 flex-1">
                  <p className="text-sm text-ink/85">{n.text}</p>
                  <p className="text-xs text-ink/40 mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    {n.time}
                  </p>
                </div>
                {!n.read && <span className="w-2 h-2 rounded-full bg-gold-grain mt-1.5 shrink-0" />}
              </button>
            );
          })}
        </div>
      )}
    </DashboardLayout>
  );
}
