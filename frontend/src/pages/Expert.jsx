import { useState, useEffect } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { StarIcon, UsersIcon } from "../components/Icons";
import { apiFetch } from "../utils/api";

const TIME_SLOTS = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];
const CONSULTATION_FEE = 500; // flat fee - backend doesn't have per-expert pricing yet

// Builds a hidden HTML form and auto-submits it to eSewa's payment page.
// This is the standard way to redirect a user to eSewa with signed payment data.
function redirectToEsewa(esewaFormUrl, esewaPayment) {
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
}

export default function Expert() {
  const { t } = useTranslation();

  const [experts, setExperts] = useState([]);
  const [loadingExperts, setLoadingExperts] = useState(true);
  const [expertsError, setExpertsError] = useState("");

  const [selectedExpert, setSelectedExpert] = useState(null);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [bookingError, setBookingError] = useState("");

  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState(TIME_SLOTS[0]);
  const [reason, setReason] = useState("");

  // Fetch the real list of experts from the backend on mount
  useEffect(() => {
    (async () => {
      try {
        setLoadingExperts(true);
        const data = await apiFetch("/appointments/experts");
        setExperts(data.experts || []);
      } catch (err) {
        setExpertsError(err.message || "Failed to load experts.");
      } finally {
        setLoadingExperts(false);
      }
    })();
  }, []);

  const handleSelect = (expert) => {
    setSelectedExpert(expert);
    setBookingError("");
  };

  // -------------------------------------------------------------
  // SUBMIT BOOKING - calls the real backend, then redirects to eSewa
  // -------------------------------------------------------------
  const handleConfirm = async (e) => {
    e.preventDefault();
    if (!appointmentDate || !reason.trim()) return;

    setIsSubmitting(true);
    setBookingError("");

    try {
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

      // Redirect the browser to eSewa's payment page using the signed form data
      redirectToEsewa(data.esewaFormUrl, data.esewaPayment);
      // NOTE: execution stops here - the browser navigates away to eSewa.
      // After payment, eSewa redirects back to the backend, which then
      // redirects to /appointment-success or /appointment-failed.
    } catch (err) {
      setBookingError(err.message || "Failed to book appointment.");
      setIsSubmitting(false);
    }
  };

  return (
    <DashboardLayout>
      <div className="font-sans antialiased text-ink max-w-7xl mx-auto p-2">
        {/* Page Header */}
        <div className="mb-4">
          <h1 className="text-ink text-2xl font-bold tracking-tight mb-1">
            {t("expert.title") || "Talk to an Expert"}
          </h1>
          <p className="text-xs text-ink/70 font-medium">
            Select a verified specialist and schedule a consultation.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Expert Cards */}
          <div className="lg:col-span-6 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
            {loadingExperts && (
              <p className="text-sm text-ink/60 text-center py-8">Loading experts...</p>
            )}

            {expertsError && (
              <p className="text-sm text-red-600 text-center py-8">{expertsError}</p>
            )}

            {!loadingExperts && !expertsError && experts.length === 0 && (
              <p className="text-sm text-ink/60 text-center py-8">
                No experts are available right now.
              </p>
            )}

            {experts.map((expert) => {
              const isSelected = selectedExpert?._id === expert._id;
              return (
                <div
                  key={expert._id}
                  onClick={() => handleSelect(expert)}
                  className={`bg-white border rounded-xl p-3.5 cursor-pointer transition-all duration-150 shadow-xs ${
                    isSelected
                      ? "border-paddy-green bg-paddy-green/5 ring-2 ring-paddy-green/20"
                      : "border-soil/15 hover:border-paddy-green/40 hover:shadow-md"
                  }`}
                >
                  <div className="flex items-center justify-between gap-3">
                    <div className="flex items-center gap-3">
                      <div className="relative shrink-0">
                        <span className="w-10 h-10 rounded-full bg-paddy-green/15 text-paddy-green flex items-center justify-center font-bold text-sm">
                          {expert.name.charAt(0)}
                        </span>
                        <span className="absolute -bottom-0.5 -right-0.5 bg-green-500 text-white rounded-full p-0.5 border border-white">
                          <svg className="w-2 h-2 fill-current" viewBox="0 0 20 20">
                            <path d="M0 11l2-2 5 5L18 3l2 2L7 18z" />
                          </svg>
                        </span>
                      </div>

                      <div>
                        <p className="text-ink font-bold text-sm leading-tight">
                          {expert.name}
                        </p>
                        <p className="text-xs text-ink/70 font-medium mt-0.5">
                          {expert.email}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Verified Specialist
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-paddy-green font-extrabold text-sm">
                        Rs. {CONSULTATION_FEE}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleSelect(expert);
                        }}
                        className={`mt-2 text-xs px-3 py-1 rounded-full font-bold transition-colors ${
                          isSelected
                            ? "bg-paddy-green text-paper"
                            : "bg-paddy-green/10 text-paddy-green hover:bg-paddy-green hover:text-paper"
                        }`}
                      >
                        {isSelected ? "Selected" : t("expert.book") || "Book"}
                      </button>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Right Column: Checkout */}
          <div className="lg:col-span-6 bg-white border border-soil/15 rounded-2xl p-4 shadow-md sticky top-2">
            {!selectedExpert && (
              <div className="text-center py-16">
                <span className="w-12 h-12 rounded-full bg-soil/5 text-ink/40 flex items-center justify-center mx-auto mb-3">
                  <UsersIcon className="w-6 h-6" />
                </span>
                <p className="text-sm text-ink font-bold">
                  No Specialist Selected
                </p>
                <p className="text-xs text-ink/60 mt-1 max-w-xs mx-auto">
                  Select an expert from the list to review slot options and finalize payment.
                </p>
              </div>
            )}

            {selectedExpert && (
              <form onSubmit={handleConfirm} className="space-y-3.5">
                <div className="border-b border-soil/10 pb-2.5 flex items-center justify-between">
                  <div>
                    <span className="text-[10px] font-extrabold uppercase tracking-wider text-paddy-green bg-paddy-green/10 px-2 py-0.5 rounded inline-block mb-1">
                      Checkout
                    </span>
                    <h3 className="text-ink text-base font-bold leading-none">
                      {selectedExpert.name}
                    </h3>
                    <p className="text-xs text-ink/70 font-medium mt-1">
                      {selectedExpert.email}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-ink/50 block leading-none font-medium">Session Fee</span>
                    <span className="text-sm font-extrabold text-paddy-green mt-0.5 block">Rs. {CONSULTATION_FEE}</span>
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-ink/80 block">
                    Reason for Consultation
                  </label>
                  <textarea
                    required
                    rows={2}
                    value={reason}
                    onChange={(e) => setReason(e.target.value)}
                    placeholder="Describe your crop issue or question..."
                    className="w-full px-2.5 py-1.5 text-xs font-medium border border-soil/20 rounded-lg bg-white text-ink focus:outline-none focus:border-paddy-green resize-none"
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs uppercase font-bold tracking-wider text-ink/80 block">
                    Date & Time
                  </label>
                  <input
                    type="date"
                    required
                    value={appointmentDate}
                    onChange={(e) => setAppointmentDate(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-soil/20 rounded-lg bg-white text-ink focus:outline-none focus:border-paddy-green mb-1.5"
                  />
                  <select
                    value={appointmentTime}
                    onChange={(e) => setAppointmentTime(e.target.value)}
                    className="w-full px-2.5 py-1.5 text-xs font-semibold border border-soil/20 rounded-lg bg-white text-ink focus:outline-none focus:border-paddy-green cursor-pointer"
                  >
                    {TIME_SLOTS.map((slot) => (
                      <option key={slot} value={slot}>
                        ⏰ {slot}
                      </option>
                    ))}
                  </select>
                </div>

                <div className="p-2 bg-soil/5 border border-soil/15 rounded-lg flex items-center gap-2">
                  <span className="text-base">🟢</span>
                  <p className="text-xs font-bold text-ink">
                    Payment via eSewa - you'll be redirected to complete payment securely.
                  </p>
                </div>

                {bookingError && (
                  <p className="text-xs text-red-600 font-medium">{bookingError}</p>
                )}

                {/* Cost Breakdown & Pay Button */}
                <div className="grid grid-cols-12 gap-3 items-center bg-paddy-green/5 border border-paddy-green/20 rounded-xl p-2.5">
                  <div className="col-span-6 space-y-1 border-r border-paddy-green/20 pr-2">
                    <div className="flex justify-between text-xs font-extrabold text-paddy-green">
                      <span>Total:</span>
                      <span className="text-sm">Rs. {CONSULTATION_FEE}</span>
                    </div>
                  </div>

                  <div className="col-span-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-3 rounded-lg bg-paddy-green text-paper font-bold hover:bg-soil-dark shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Redirecting to eSewa...</span>
                      ) : (
                        <>
                          <span>Pay with eSewa</span>
                          <svg className="w-4 h-4 fill-current" viewBox="0 0 20 20">
                            <path d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" />
                          </svg>
                        </>
                      )}
                    </button>
                  </div>
                </div>
              </form>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}