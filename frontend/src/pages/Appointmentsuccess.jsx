import { useSearchParams, Link } from "react-router-dom";
import DashboardLayout from "../components/dashboard/DashboardLayout";

export default function AppointmentSuccess() {
  const [searchParams] = useSearchParams();
  const appointmentId = searchParams.get("appointmentId");

  return (
    <DashboardLayout>
      <div className="max-w-lg mx-auto text-center py-16">
        <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm mb-4">
          <svg className="w-8 h-8 fill-current" viewBox="0 0 20 20">
            <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
          </svg>
        </div>

        <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-2">
          Payment Successful
        </span>

        <h1 className="text-ink text-2xl font-bold mb-2">
          Appointment Confirmed!
        </h1>

        <p className="text-sm text-ink/60 mb-1">
          Your consultation has been booked and payment was received.
        </p>

        {appointmentId && (
          <p className="text-xs text-ink/40 font-mono mb-6">
            Appointment ID: {appointmentId}
          </p>
        )}

        <Link
          to="/dashboard"
          className="inline-block mt-4 py-2.5 px-6 rounded-lg bg-paddy-green text-paper font-bold text-sm hover:bg-soil-dark transition-all"
        >
          Back to Dashboard
        </Link>
      </div>
    </DashboardLayout>
  );
}