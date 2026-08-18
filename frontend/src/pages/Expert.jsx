import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { UsersIcon } from "../components/Icons";
import { apiFetch } from "../utils/api";

const TIME_SLOTS = [
  "09:00 AM",
  "11:00 AM",
  "02:00 PM",
  "04:00 PM",
  "06:00 PM",
];

// Flat consultation fee (NPR) charged for booking an expert appointment
const CONSULTATION_FEE = 500;

export default function Expert() {
  const { t } = useTranslation();

  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState("");

  const [selectedExpert, setSelectedExpert] = useState(null);

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState(TIME_SLOTS[0]);
  const [reason, setReason] = useState("");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");
  const [bookingSuccess, setBookingSuccess] = useState("");

  // Load agricultural experts
  useEffect(() => {
    const loadExperts = async () => {
      try {
        setLoadingExperts(true);
        setExpertsError("");

        const data = await apiFetch("/appointments/experts");

        setExperts(data.experts || []);
      } catch (err) {
        setExpertsError(
          err.message || "Failed to load agricultural experts."
        );
      } finally {
        setLoadingExperts(false);
      }
    };

    loadExperts();
  }, []);

  // Select an expert
  const handleSelect = (expert) => {
    setSelectedExpert(expert);
    setBookingError("");
    setBookingSuccess("");
  };

  // Submits a hidden auto-posting form to eSewa's payment page using the
  // signed field data the backend returned. eSewa requires a real form POST
  // (not fetch/XHR) since it redirects the user's browser to its own UI.
  const redirectToEsewa = (esewaFormUrl, esewaPayment) => {
    const form = document.createElement("form");
    form.method = "POST";
    form.action = esewaFormUrl;

    Object.entries(esewaPayment).forEach(([key, value]) => {
      const input = document.createElement("input");
      input.type = "hidden";
      input.name = key;
      input.value = value;
      form.appendChild(input);
    });

    document.body.appendChild(form);
    form.submit();
  };

  // Book appointment
  const handleConfirm = async (e) => {
    e.preventDefault();

    setBookingError("");
    setBookingSuccess("");

    if (!selectedExpert) {
      setBookingError("Please select an agricultural expert.");
      return;
    }

    if (!appointmentDate) {
      setBookingError("Please select an appointment date.");
      return;
    }

    if (!reason.trim()) {
      setBookingError("Please enter the reason for your appointment.");
      return;
    }

    // Prevent selecting a past date
    const selectedDate = new Date(appointmentDate);
    const today = new Date();

    today.setHours(0, 0, 0, 0);

    if (selectedDate < today) {
      setBookingError("Please select a future date.");
      return;
    }

    try {
      setIsSubmitting(true);

      const data = await apiFetch("/appointments", {
        method: "POST",
        body: JSON.stringify({
          expertId: selectedExpert._id,
          reason: reason.trim(),
          appointmentDate,
          timeSlot: appointmentTime,
          amount: CONSULTATION_FEE,
        }),
      });

      setBookingSuccess(
        "Appointment created. Redirecting you to eSewa to complete payment..."
      );

      // Redirect to eSewa's payment page - appointment is only confirmed
      // once the backend's /verify callback receives a successful payment.
      if (data.esewaFormUrl && data.esewaPayment) {
        redirectToEsewa(data.esewaFormUrl, data.esewaPayment);
        return; // page is navigating away, no need to reset form state
      }

      // Fallback: if for some reason payment data wasn't returned, just
      // clear the form as before.
      setReason("");
      setAppointmentDate("");
      setAppointmentTime(TIME_SLOTS[0]);
      setSelectedExpert(selectedExpert);
    } catch (err) {
      setBookingError(
        err.message || "Failed to book appointment. Please try again."
      );
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="font-sans antialiased text-ink max-w-7xl mx-auto p-2">
        {/* Page Header */}
        <div className="mb-6">
          <h1 className="text-2xl font-bold tracking-tight mb-1">
            {t("expert.title") || "Talk to an Expert"}
          </h1>

          <p className="text-sm text-ink/70">
            Select a verified agricultural expert and schedule an
            appointment.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-6 items-start">
          {/* =====================================================
              LEFT SIDE - EXPERT LIST
          ====================================================== */}
          <div className="lg:col-span-6">
            <div className="mb-3">
              <h2 className="text-lg font-bold text-ink">
                Agricultural Experts
              </h2>

              <p className="text-sm text-ink/60">
                Choose an expert based on your farming needs.
              </p>
            </div>

            {/* Loading */}
            {loadingExperts && (
              <div className="bg-white border border-soil/15 rounded-xl p-8 text-center">
                <p className="text-sm text-ink/60">
                  Loading experts...
                </p>
              </div>
            )}

            {/* Error */}
            {expertsError && (
              <div className="bg-red-50 border border-red-200 rounded-xl p-4">
                <p className="text-sm text-red-600">
                  {expertsError}
                </p>
              </div>
            )}

            {/* No Experts */}
            {!loadingExperts &&
              !expertsError &&
              experts.length === 0 && (
                <div className="bg-white border border-soil/15 rounded-xl p-10 text-center">
                  <div className="w-12 h-12 rounded-full bg-soil/5 text-ink/40 flex items-center justify-center mx-auto mb-3">
                    <UsersIcon className="w-6 h-6" />
                  </div>

                  <p className="font-bold text-ink">
                    No experts available
                  </p>

                  <p className="text-sm text-ink/60 mt-1">
                    There are currently no agricultural experts
                    available for appointments.
                  </p>
                </div>
              )}

            {/* Expert Cards */}
            {!loadingExperts &&
              !expertsError &&
              experts.length > 0 && (
                <div className="space-y-3">
                  {experts.map((expert) => {
                    const isSelected =
                      selectedExpert?._id === expert._id;

                    return (
                      <div
                        key={expert._id}
                        onClick={() => handleSelect(expert)}
                        className={`bg-white border rounded-xl p-4 cursor-pointer transition-all ${
                          isSelected
                            ? "border-paddy-green bg-paddy-green/5 ring-2 ring-paddy-green/20"
                            : "border-soil/15 hover:border-paddy-green/40 hover:shadow-md"
                        }`}
                      >
                        <div className="flex items-center justify-between gap-4">
                          {/* Expert Information */}
                          <div className="flex items-center gap-3">
                            <div className="relative shrink-0">
                              <div className="w-12 h-12 rounded-full bg-paddy-green/15 text-paddy-green flex items-center justify-center font-bold">
                                {expert.name
                                  ?.charAt(0)
                                  ?.toUpperCase() || "E"}
                              </div>

                              {expert.isVerified !== false && (
                                <span className="absolute -bottom-1 -right-1 bg-green-500 text-white rounded-full w-5 h-5 flex items-center justify-center border-2 border-white text-xs">
                                  ✓
                                </span>
                              )}
                            </div>

                            <div>
                              <p className="text-ink font-bold text-sm">
                                {expert.name}
                              </p>

                              <p className="text-xs text-ink/60 mt-1">
                                {expert.email}
                              </p>

                              {expert.location && (
                                <p className="text-xs text-ink/60 mt-1">
                                  📍 {expert.location}
                                </p>
                              )}

                              {expert.bio && (
                                <p className="text-xs text-ink/70 mt-2 line-clamp-2">
                                  {expert.bio}
                                </p>
                              )}

                              <span className="inline-flex items-center mt-2 px-2 py-1 rounded-md text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                                Verified Agricultural Expert
                              </span>
                            </div>
                          </div>

                          {/* Select Button */}
                          <button
                            type="button"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleSelect(expert);
                            }}
                            className={`shrink-0 text-xs px-4 py-2 rounded-lg font-bold transition-colors ${
                              isSelected
                                ? "bg-paddy-green text-paper"
                                : "bg-paddy-green/10 text-paddy-green hover:bg-paddy-green hover:text-paper"
                            }`}
                          >
                            {isSelected ? "Selected" : "Select"}
                          </button>
                        </div>
                      </div>
                    );
                  })}
                </div>
              )}
          </div>

          {/* =====================================================
              RIGHT SIDE - APPOINTMENT FORM
          ====================================================== */}
          <div className="lg:col-span-6">
            <div className="bg-white border border-soil/15 rounded-2xl p-5 shadow-md">
              {!selectedExpert ? (
                <div className="text-center py-16">
                  <div className="w-14 h-14 rounded-full bg-soil/5 text-ink/40 flex items-center justify-center mx-auto mb-4">
                    <UsersIcon className="w-7 h-7" />
                  </div>

                  <h3 className="text-lg font-bold text-ink">
                    Select an Expert
                  </h3>

                  <p className="text-sm text-ink/60 mt-2 max-w-sm mx-auto">
                    Choose an agricultural expert from the list to
                    schedule your appointment.
                  </p>
                </div>
              ) : (
                <form onSubmit={handleConfirm}>
                  {/* Selected Expert */}
                  <div className="border-b border-soil/10 pb-4 mb-5">
                    <p className="text-xs font-bold uppercase tracking-wider text-paddy-green mb-2">
                      Selected Expert
                    </p>

                    <div className="flex items-center gap-3">
                      <div className="w-11 h-11 rounded-full bg-paddy-green/15 text-paddy-green flex items-center justify-center font-bold">
                        {selectedExpert.name
                          ?.charAt(0)
                          ?.toUpperCase() || "E"}
                      </div>

                      <div>
                        <h3 className="text-base font-bold text-ink">
                          {selectedExpert.name}
                        </h3>

                        <p className="text-xs text-ink/60">
                          {selectedExpert.email}
                        </p>

                        {selectedExpert.location && (
                          <p className="text-xs text-ink/60 mt-1">
                            📍 {selectedExpert.location}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Reason */}
                  <div className="mb-5">
                    <label className="text-sm font-bold text-ink block mb-2">
                      Reason for Appointment
                    </label>

                    <textarea
                      required
                      rows={4}
                      value={reason}
                      onChange={(e) => setReason(e.target.value)}
                      placeholder="Describe your crop issue or what you need help with..."
                      className="w-full px-3 py-2.5 text-sm border border-soil/20 rounded-lg bg-white text-ink focus:outline-none focus:border-paddy-green focus:ring-1 focus:ring-paddy-green resize-none"
                    />
                  </div>

                  {/* Date */}
                  <div className="mb-5">
                    <label className="text-sm font-bold text-ink block mb-2">
                      Appointment Date
                    </label>

                    <input
                      type="date"
                      required
                      value={appointmentDate}
                      min={new Date().toISOString().split("T")[0]}
                      onChange={(e) =>
                        setAppointmentDate(e.target.value)
                      }
                      className="w-full px-3 py-2.5 text-sm border border-soil/20 rounded-lg bg-white text-ink focus:outline-none focus:border-paddy-green focus:ring-1 focus:ring-paddy-green"
                    />
                  </div>

                  {/* Time */}
                  <div className="mb-5">
                    <label className="text-sm font-bold text-ink block mb-2">
                      Appointment Time
                    </label>

                    <select
                      value={appointmentTime}
                      onChange={(e) =>
                        setAppointmentTime(e.target.value)
                      }
                      className="w-full px-3 py-2.5 text-sm border border-soil/20 rounded-lg bg-white text-ink focus:outline-none focus:border-paddy-green focus:ring-1 focus:ring-paddy-green cursor-pointer"
                    >
                      {TIME_SLOTS.map((slot) => (
                        <option key={slot} value={slot}>
                          {slot}
                        </option>
                      ))}
                    </select>
                  </div>

                  {/* Fee + Information */}
                  <div className="bg-paddy-green/5 border border-paddy-green/20 rounded-lg p-3 mb-5">
                    <p className="text-sm font-semibold text-ink">
                      Consultation Fee: NPR {CONSULTATION_FEE}
                    </p>

                    <p className="text-xs text-ink/60 mt-1">
                      You'll be redirected to eSewa to complete payment.
                      The appointment is confirmed once payment succeeds.
                    </p>
                  </div>

                  {/* Error */}
                  {bookingError && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-red-600">
                        {bookingError}
                      </p>
                    </div>
                  )}

                  {/* Success */}
                  {bookingSuccess && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-3 mb-4">
                      <p className="text-sm text-green-700 font-medium">
                        {bookingSuccess}
                      </p>
                    </div>
                  )}

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-full py-3 px-4 rounded-lg bg-paddy-green text-paper font-bold hover:bg-soil-dark transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {isSubmitting
                      ? "Booking Appointment..."
                      : "Book Appointment"}
                  </button>
                </form>
              )}
            </div>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}