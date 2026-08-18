import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { apiFetch } from "../utils/api";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
  const [activeTab, setActiveTab] = useState("upcoming");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/appointments/my-appointments");
      setAppointments(data.appointments || []);
    } catch (err) {
      setError(err.message || "Failed to load appointments.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadAppointments();
  }, []);

  const handleCancel = async (id) => {
    const confirmed = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmed) return;

    try {
      setCancellingId(id);

      const data = await apiFetch(`/appointments/${id}/cancel`, {
        method: "PATCH",
      });

      setAppointments((prev) =>
        prev.map((appointment) =>
          appointment._id === id
            ? { ...appointment, status: "cancelled" }
            : appointment
        )
      );

      window.alert(data.message || "Appointment cancelled successfully.");
    } catch (err) {
      window.alert(err.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Date not available";

    return new Date(date).toLocaleDateString("en-NP", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const isUpcoming = (appointment) => {
    if (!appointment.appointmentDate) return false;

    const appointmentDate = new Date(appointment.appointmentDate);
    return appointmentDate > new Date();
  };

  const getStatusStyle = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-50 text-green-700 border-green-200";

      case "pending":
        return "bg-yellow-50 text-yellow-700 border-yellow-200";

      case "completed":
        return "bg-blue-50 text-blue-700 border-blue-200";

      case "cancelled":
        return "bg-red-50 text-red-700 border-red-200";

      default:
        return "bg-gray-50 text-gray-700 border-gray-200";
    }
  };

  const upcomingAppointments = appointments.filter(
    (appointment) =>
      isUpcoming(appointment) && appointment.status !== "cancelled"
  );

  const pastAppointments = appointments.filter(
    (appointment) =>
      !isUpcoming(appointment) || appointment.status === "cancelled"
  );

  const displayedAppointments =
    activeTab === "upcoming"
      ? upcomingAppointments
      : pastAppointments;

  const canCancel = (appointment) => {
    if (!appointment.appointmentDate) return false;

    const appointmentDate = new Date(appointment.appointmentDate);

    return (
      appointmentDate > new Date() &&
      appointment.status !== "cancelled" &&
      appointment.status !== "completed"
    );
  };

  return (
    <DashboardLayout>
      <div className="max-w-6xl mx-auto px-2 sm:px-4 pb-8">

        {/* Header */}
        <div className="mb-6">
          <h1 className="text-2xl sm:text-3xl font-bold text-ink">
            My Appointments
          </h1>

          <p className="text-sm text-ink/60 mt-1">
            Manage your consultations with agricultural experts.
          </p>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-2 md:grid-cols-3 gap-3 mb-6">

          <div className="bg-white border border-soil/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide">
              Upcoming
            </p>

            <p className="text-2xl font-bold text-paddy-green mt-1">
              {upcomingAppointments.length}
            </p>
          </div>

          <div className="bg-white border border-soil/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide">
              Past
            </p>

            <p className="text-2xl font-bold text-ink mt-1">
              {pastAppointments.length}
            </p>
          </div>

          <div className="hidden md:block bg-white border border-soil/10 rounded-xl p-4">
            <p className="text-xs font-semibold text-ink/50 uppercase tracking-wide">
              Total
            </p>

            <p className="text-2xl font-bold text-ink mt-1">
              {appointments.length}
            </p>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-white border border-soil/10 rounded-xl p-1.5 mb-5 flex gap-1">
          <button
            type="button"
            onClick={() => setActiveTab("upcoming")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "upcoming"
                ? "bg-paddy-green text-white"
                : "text-ink/60 hover:bg-soil/5"
            }`}
          >
            Upcoming
            <span className="ml-1.5">
              ({upcomingAppointments.length})
            </span>
          </button>

          <button
            type="button"
            onClick={() => setActiveTab("past")}
            className={`flex-1 py-2.5 rounded-lg text-sm font-semibold transition ${
              activeTab === "past"
                ? "bg-paddy-green text-white"
                : "text-ink/60 hover:bg-soil/5"
            }`}
          >
            Past
            <span className="ml-1.5">
              ({pastAppointments.length})
            </span>
          </button>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-soil/10 rounded-xl p-12 text-center">
            <div className="w-8 h-8 border-2 border-paddy-green/30 border-t-paddy-green rounded-full animate-spin mx-auto mb-3" />

            <p className="text-sm text-ink/60">
              Loading your appointments...
            </p>
          </div>
        )}

        {/* Error */}
        {!loading && error && (
          <div className="bg-red-50 border border-red-200 rounded-xl p-5">
            <p className="font-semibold text-red-700">
              Unable to load appointments
            </p>

            <p className="text-sm text-red-600 mt-1">
              {error}
            </p>

            <button
              type="button"
              onClick={loadAppointments}
              className="mt-3 px-4 py-2 bg-red-600 text-white rounded-lg text-sm font-semibold hover:bg-red-700"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && displayedAppointments.length === 0 && (
          <div className="bg-white border border-soil/10 rounded-xl p-12 text-center">

            <div className="w-14 h-14 mx-auto rounded-full bg-paddy-green/10 flex items-center justify-center text-2xl mb-4">
              📅
            </div>

            <h2 className="text-lg font-bold text-ink">
              {activeTab === "upcoming"
                ? "No upcoming appointments"
                : "No past appointments"}
            </h2>

            <p className="text-sm text-ink/50 mt-1 max-w-sm mx-auto">
              {activeTab === "upcoming"
                ? "Your upcoming consultations with agricultural experts will appear here."
                : "Your completed or cancelled appointments will appear here."}
            </p>
          </div>
        )}

        {/* Appointment List */}
        {!loading && !error && displayedAppointments.length > 0 && (
          <div className="space-y-4">

            {displayedAppointments.map((appointment) => (
              <div
                key={appointment._id}
                className="bg-white border border-soil/10 rounded-xl overflow-hidden shadow-sm hover:shadow-md transition"
              >
                {/* Card Header */}
                <div className="px-5 py-4 border-b border-soil/10 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">

                  <div className="flex items-center gap-3">

                    <div className="w-11 h-11 rounded-full bg-paddy-green/10 text-paddy-green flex items-center justify-center font-bold text-lg">
                      {appointment.expert?.name
                        ? appointment.expert.name.charAt(0).toUpperCase()
                        : "E"}
                    </div>

                    <div>
                      <p className="text-xs text-ink/50 font-medium">
                        Agricultural Expert
                      </p>

                      <h2 className="font-bold text-ink">
                        {appointment.expert?.name ||
                          "Agricultural Expert"}
                      </h2>

                      {appointment.expert?.email && (
                        <p className="text-xs text-ink/50 mt-0.5">
                          {appointment.expert.email}
                        </p>
                      )}
                    </div>
                  </div>

                  <span
                    className={`self-start sm:self-auto px-3 py-1.5 rounded-full border text-xs font-bold capitalize ${getStatusStyle(
                      appointment.status
                    )}`}
                  >
                    {appointment.status}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-5">

                  <div className="grid sm:grid-cols-2 gap-4 mb-5">

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-soil/5 flex items-center justify-center">
                        📅
                      </div>

                      <div>
                        <p className="text-xs text-ink/50 font-medium">
                          Date
                        </p>

                        <p className="text-sm font-semibold text-ink mt-0.5">
                          {formatDate(appointment.appointmentDate)}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-start gap-3">
                      <div className="w-9 h-9 rounded-lg bg-soil/5 flex items-center justify-center">
                        🕐
                      </div>

                      <div>
                        <p className="text-xs text-ink/50 font-medium">
                          Time
                        </p>

                        <p className="text-sm font-semibold text-ink mt-0.5">
                          {appointment.timeSlot || "Time not available"}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="bg-soil/5 rounded-lg p-4">
                    <p className="text-xs text-ink/50 font-semibold uppercase tracking-wide mb-1">
                      Consultation Reason
                    </p>

                    <p className="text-sm text-ink/80 leading-relaxed">
                      {appointment.reason ||
                        "No reason provided."}
                    </p>
                  </div>

                  {/* Cancel */}
                  {canCancel(appointment) && (
                    <div className="mt-4 flex justify-end">
                      <button
                        type="button"
                        onClick={() =>
                          handleCancel(appointment._id)
                        }
                        disabled={
                          cancellingId === appointment._id
                        }
                        className="px-4 py-2 border border-red-200 text-red-600 rounded-lg text-sm font-semibold hover:bg-red-50 transition disabled:opacity-50"
                      >
                        {cancellingId === appointment._id
                          ? "Cancelling..."
                          : "Cancel Appointment"}
                      </button>
                    </div>
                  )}

                  {/* Cancelled message */}
                  {appointment.status === "cancelled" && (
                    <div className="mt-4 px-4 py-3 bg-red-50 border border-red-100 rounded-lg">
                      <p className="text-xs text-red-700 font-medium">
                        This appointment has been cancelled.
                      </p>
                    </div>
                  )}

                  {/* Completed message */}
                  {appointment.status === "completed" && (
                    <div className="mt-4 px-4 py-3 bg-blue-50 border border-blue-100 rounded-lg">
                      <p className="text-xs text-blue-700 font-medium">
                        This consultation has been completed.
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}