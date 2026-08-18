import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { apiFetch } from "../utils/api";

export default function ExpertAppointments() {
  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [cancellingId, setCancellingId] = useState(null);

  const loadAppointments = async () => {
    try {
      setLoading(true);
      setError("");

      const data = await apiFetch("/appointments/expert-appointments");
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
    const confirmCancel = window.confirm(
      "Are you sure you want to cancel this appointment?"
    );

    if (!confirmCancel) return;

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

      alert(data.message || "Appointment cancelled successfully.");
    } catch (err) {
      alert(err.message || "Failed to cancel appointment.");
    } finally {
      setCancellingId(null);
    }
  };

  const formatDate = (date) => {
    if (!date) return "Not specified";

    return new Date(date).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusClass = (status) => {
    switch (status) {
      case "confirmed":
        return "bg-green-100 text-green-700";

      case "pending":
        return "bg-yellow-100 text-yellow-700";

      case "completed":
        return "bg-blue-100 text-blue-700";

      case "cancelled":
        return "bg-red-100 text-red-700";

      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  const getStatusLabel = (status) => {
    if (!status) return "Unknown";

    return status.charAt(0).toUpperCase() + status.slice(1);
  };

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">
            My Appointments
          </h1>

          <p className="text-sm text-ink/60 mt-1">
            View and manage appointments booked with you.
          </p>
        </div>

        {/* Loading */}
        {loading && (
          <div className="bg-white border border-soil/10 rounded-xl p-10 text-center">
            <p className="text-sm text-ink/60">
              Loading appointments...
            </p>
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-xl p-4 mb-5">
            <p className="font-semibold text-sm">
              Unable to load appointments
            </p>

            <p className="text-sm mt-1">
              {error}
            </p>

            <button
              onClick={loadAppointments}
              className="mt-3 px-4 py-2 text-sm font-semibold text-red-700 border border-red-200 rounded-lg hover:bg-red-100 transition"
            >
              Try Again
            </button>
          </div>
        )}

        {/* Empty State */}
        {!loading && !error && appointments.length === 0 && (
          <div className="bg-white border border-soil/10 rounded-xl p-10 text-center shadow-sm">
            <div className="w-14 h-14 mx-auto mb-4 rounded-full bg-paddy-green/10 flex items-center justify-center">
              <span className="text-2xl">📅</span>
            </div>

            <h2 className="text-ink font-semibold text-lg">
              No appointments found
            </h2>

            <p className="text-sm text-ink/50 mt-1">
              Appointments booked by farmers will appear here.
            </p>
          </div>
        )}

        {/* Appointment List */}
        {!loading && !error && appointments.length > 0 && (
          <div className="space-y-4">
            {appointments.map((appointment) => {
              const appointmentDate = new Date(
                appointment.appointmentDate
              );

              const canCancel =
                appointment.status !== "cancelled" &&
                appointment.status !== "completed" &&
                appointmentDate > new Date();

              return (
                <div
                  key={appointment._id}
                  className="bg-white border border-soil/10 rounded-xl p-5 shadow-sm hover:shadow-md transition"
                >
                  <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-5">
                    {/* Appointment Information */}
                    <div className="flex-1">
                      {/* Farmer */}
                      <div className="flex items-center gap-3">
                        <div className="w-11 h-11 rounded-full bg-paddy-green/10 text-paddy-green flex items-center justify-center font-bold">
                          {appointment.farmer?.name
                            ? appointment.farmer.name.charAt(0).toUpperCase()
                            : "F"}
                        </div>

                        <div>
                          <h2 className="font-bold text-ink">
                            {appointment.farmer?.name || "Farmer"}
                          </h2>

                          {appointment.farmer?.email && (
                            <p className="text-sm text-ink/60">
                              {appointment.farmer.email}
                            </p>
                          )}
                        </div>
                      </div>

                      {/* Appointment Details */}
                      <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-3">
                        <div className="bg-soil/5 rounded-lg p-3">
                          <p className="text-xs text-ink/50 font-semibold uppercase">
                            Date
                          </p>

                          <p className="text-sm font-semibold text-ink mt-1">
                            {formatDate(appointment.appointmentDate)}
                          </p>
                        </div>

                        <div className="bg-soil/5 rounded-lg p-3">
                          <p className="text-xs text-ink/50 font-semibold uppercase">
                            Time
                          </p>

                          <p className="text-sm font-semibold text-ink mt-1">
                            {appointment.timeSlot || "Not specified"}
                          </p>
                        </div>
                      </div>

                      {/* Reason */}
                      <div className="mt-3 bg-soil/5 rounded-lg p-3">
                        <p className="text-xs text-ink/50 font-semibold uppercase">
                          Reason for Consultation
                        </p>

                        <p className="text-sm text-ink/80 mt-1">
                          {appointment.reason || "No reason provided."}
                        </p>
                      </div>
                    </div>

                    {/* Status & Actions */}
                    <div className="flex flex-row md:flex-col items-center md:items-end justify-between gap-3 md:min-w-[150px]">
                      <span
                        className={`px-3 py-1.5 rounded-full text-xs font-semibold ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {getStatusLabel(appointment.status)}
                      </span>

                      {canCancel && (
                        <button
                          onClick={() =>
                            handleCancel(appointment._id)
                          }
                          disabled={
                            cancellingId === appointment._id
                          }
                          className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 transition disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                          {cancellingId === appointment._id
                            ? "Cancelling..."
                            : "Cancel Appointment"}
                        </button>
                      )}
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </DashboardLayout>
  );
}