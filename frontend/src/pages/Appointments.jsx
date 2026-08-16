import { useEffect, useState } from "react";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { apiFetch } from "../utils/api";

export default function Appointments() {
  const [appointments, setAppointments] = useState([]);
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
    return new Date(date).toLocaleDateString();
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

  return (
    <DashboardLayout>
      <div className="max-w-5xl mx-auto">
        <div className="mb-6">
          <h1 className="text-2xl font-bold text-ink">
            My Appointments
          </h1>

          <p className="text-sm text-ink/60 mt-1">
            View your upcoming and past appointments.
          </p>
        </div>

        {loading && (
          <div className="text-center py-10 text-ink/60">
            Loading appointments...
          </div>
        )}

        {error && (
          <div className="bg-red-50 border border-red-200 text-red-600 rounded-lg p-4 mb-5">
            {error}
          </div>
        )}

        {!loading && !error && appointments.length === 0 && (
          <div className="bg-white border border-soil/10 rounded-xl p-10 text-center">
            <p className="text-ink font-semibold">
              No appointments found.
            </p>

            <p className="text-sm text-ink/50 mt-1">
              Your booked appointments will appear here.
            </p>
          </div>
        )}

        {!loading && appointments.length > 0 && (
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
                  className="bg-white border border-soil/10 rounded-xl p-5 shadow-sm"
                >
                  <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
                    <div>
                      <h2 className="font-bold text-ink">
                        {appointment.expert?.name || "Agricultural Expert"}
                      </h2>

                      <p className="text-sm text-ink/60 mt-1">
                        {appointment.expert?.email || ""}
                      </p>

                      <div className="mt-3 space-y-1 text-sm text-ink/80">
                        <p>
                          <strong>Date:</strong>{" "}
                          {formatDate(appointment.appointmentDate)}
                        </p>

                        <p>
                          <strong>Time:</strong>{" "}
                          {appointment.timeSlot}
                        </p>

                        <p>
                          <strong>Reason:</strong>{" "}
                          {appointment.reason}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-col items-start md:items-end gap-3">
                      <span
                        className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusClass(
                          appointment.status
                        )}`}
                      >
                        {appointment.status}
                      </span>

                      {canCancel && (
                        <button
                          onClick={() =>
                            handleCancel(appointment._id)
                          }
                          disabled={cancellingId === appointment._id}
                          className="px-4 py-2 text-sm font-semibold text-red-600 border border-red-200 rounded-lg hover:bg-red-50 disabled:opacity-50"
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