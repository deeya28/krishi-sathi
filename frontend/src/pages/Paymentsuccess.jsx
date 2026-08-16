
// This is where eSewa/Khalti redirect back to after payment.
import { useEffect, useState } from "react";
import { Link, useSearchParams } from "react-router-dom";
import { verifyPayment } from "../lib/api";

export default function PaymentSuccess() {
  const [searchParams] = useSearchParams();
  const [status, setStatus] = useState("checking"); // checking | success | failed

  useEffect(() => {
    const pending = sessionStorage.getItem("krishisathi_pending_payment");
    if (!pending) {
      setStatus("failed");
      return;
    }

    const { transactionUuid, provider } = JSON.parse(pending);
    const pidx = searchParams.get("pidx"); // present when Khalti redirects back

    verifyPayment({ transactionUuid, provider, pidx })
      .then((res) => setStatus(res.success ? "success" : "failed"))
      .catch(() => setStatus("failed"))
      .finally(() => sessionStorage.removeItem("krishisathi_pending_payment"));
  }, [searchParams]);

  return (
    <div className="mx-auto max-w-lg px-5 py-24 text-center">
      {status === "checking" && <p className="text-ink/60">Confirming your payment…</p>}

      {status === "success" && (
        <>
          <p className="font-display text-2xl font-semibold text-wood">भुक्तानी सफल — Payment confirmed!</p>
          <p className="mt-2 text-ink/70">Your appointment is booked. The expert will see it in their schedule.</p>
          <Link to="/appointments" className="mt-6 inline-block rounded-full bg-wood px-6 py-2.5 text-sm font-semibold text-parchment hover:bg-wood-dark">
            View my appointments
          </Link>
        </>
      )}

      {status === "failed" && (
        <>
          <p className="font-display text-2xl font-semibold text-vermillion-dark">We couldn't confirm this payment</p>
          <p className="mt-2 text-ink/70">If money left your account, it will be reconciled automatically — contact us if it isn't within 24 hours.</p>
          <Link to="/appointments" className="mt-6 inline-block rounded-full bg-wood px-6 py-2.5 text-sm font-semibold text-parchment hover:bg-wood-dark">
            View my appointments
          </Link>
        </>
      )}
    </div>
  );
}