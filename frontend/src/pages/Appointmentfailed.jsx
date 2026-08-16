import { useSearchParams, Link, useNavigate } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";

const REASON_MESSAGES = {
  missing_data: "Payment data was missing. Please try booking again.",
  invalid_signature: "Payment could not be verified. Please try booking again.",
  not_found: "We couldn't find a matching appointment for this payment.",
  incomplete: "The payment was not completed.",
  status_check_failed: "Payment verification failed. If you were charged, please contact support.",
  cancelled_or_declined: "The payment was cancelled or declined.",
  server_error: "Something went wrong on our end. Please try again.",
};

export default function AppointmentFailed() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const reason = searchParams.get("reason");
  const appointmentId = searchParams.get("appointmentId");

  const message = REASON_MESSAGES[reason] || "Your payment could not be completed.";

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-red-100 text-red-600 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z"
              clipRule="evenodd"
            />
          </svg>
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest text-red-700 bg-red-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
          Payment Failed
        </span>

        <h1 className="text-ink text-2xl font-bold mb-2">
          Booking Not Completed
        </h1>

        <p className="text-sm text-ink/60 mb-1">{message}</p>

        {appointmentId && (
          <p className="text-xs text-ink/40 font-mono mb-6">
            Appointment ID: {appointmentId}
          </p>
        )}

        <div className="flex gap-3 justify-center mt-6">
          <button
            onClick={() => navigate("/expert")}
            className="py-2.5 px-6 rounded-lg bg-paddy-green text-paper font-bold text-sm hover:bg-soil-dark transition-all"
          >
            Try Again
          </button>
          <Link
            to="/dashboard"
            className="py-2.5 px-6 rounded-lg border border-soil/20 text-ink font-bold text-sm hover:bg-soil/5 transition-all"
          >
            Back to Dashboard
          </Link>
        </div>
      </div>
    </DashboardLayout>
  );
}