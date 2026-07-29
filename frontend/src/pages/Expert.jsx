import { useState } from "react";
import { useTranslation } from "react-i18next";
import DashboardLayout from "../components/dashboard/DashboardLayout";
import { StarIcon, UsersIcon } from "../components/Icons";

const EXPERTS = [
  { name: "Dr. Bimal Rai", field: "Agronomist & Crop Specialist", rating: 4.9, price: 500 },
  { name: "Dr. Sushma Adhikari", field: "Soil Health Specialist", rating: 4.7, price: 400 },
  { name: "Dr. Prakash Shrestha", field: "Veterinary Livestock Expert", rating: 4.8, price: 450 },
  { name: "Dr. Anjana Karki", field: "Plant Pathologist (Crop Diseases)", rating: 4.9, price: 550 },
  { name: "Dr. Ramesh Dahal", field: "Entomologist (Pest Control)", rating: 4.6, price: 420 },
  { name: "Dr. Sunita Thapa", field: "Horticulturalist (Fruits & Veggies)", rating: 4.8, price: 500 },
  { name: "Dr. Roshan Devkota", field: "Irrigation & Water Management", rating: 4.7, price: 380 },
  { name: "Dr. Kabita Sharma", field: "Organic Farming Consultant", rating: 4.9, price: 600 },
  { name: "Dr. Deepak Basnet", field: "Poultry & Dairy Specialist", rating: 4.7, price: 450 },
  { name: "Dr. Gita Paudel", field: "Seed Genetics & Breeding Expert", rating: 4.8, price: 500 },
];

const PAYMENT_METHODS = [
  { id: "esewa", label: "eSewa", icon: "🟢" },
  { id: "khalti", label: "Khalti", icon: "🟣" },
  { id: "bank", label: "Global IME", icon: "🏦" },
  { id: "card", label: "Card", icon: "💳" },
];

const TIME_SLOTS = ["09:00 AM", "11:00 AM", "02:00 PM", "04:00 PM", "06:00 PM"];

export default function Expert() {
  const { t } = useTranslation();
  const [selectedExpert, setSelectedExpert] = useState(null);
  const [payment, setPayment] = useState("esewa");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedData, setConfirmedData] = useState(null);

  // Date and Time Slot selection
  const [appointmentDate, setAppointmentDate] = useState("");
  const [appointmentTime, setAppointmentTime] = useState(TIME_SLOTS[0]);

  // Payment method specific states
  const [walletId, setWalletId] = useState("");
  const [bankInfo, setBankInfo] = useState({ accountNumber: "", registeredMobile: "" });
  const [cardInfo, setCardInfo] = useState({ cardName: "", cardNumber: "", expiry: "", cvc: "" });

  const SERVICE_FEE = 50;

  const handleBook = (expert) => {
    setSelectedExpert(expert);
    setConfirmedData(null);
  };

  const handleBankInfoChange = (e) => {
    const { name, value } = e.target;
    setBankInfo((prev) => ({ ...prev, [name]: value }));
  };

  const handleCardInfoChange = (e) => {
    const { name, value } = e.target;
    setCardInfo((prev) => ({ ...prev, [name]: value }));
  };

  // -------------------------------------------------------------
  // SUBMISSION LOGIC & SUCCESS HANDLING
  // -------------------------------------------------------------
  const handleConfirm = async (e) => {
    e.preventDefault();
    setIsSubmitting(true);

    // 1. Gather Payment Payload Details
    let paymentDetails = {};
    if (payment === "esewa" || payment === "khalti") {
      paymentDetails = { walletMobile: walletId };
    } else if (payment === "bank") {
      paymentDetails = bankInfo;
    } else if (payment === "card") {
      paymentDetails = { cardName: cardInfo.cardName, cardNumberMasked: `**** **** **** ${cardInfo.cardNumber.slice(-4)}` };
    }

    const payload = {
      receiptId: `EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      expert: selectedExpert,
      appointmentDate: appointmentDate || new Date().toISOString().split("T")[0],
      appointmentTime,
      paymentMethod: payment === "bank" ? "Global IME Bank" : payment.toUpperCase(),
      paymentDetails,
      sessionFee: selectedExpert.price,
      serviceFee: SERVICE_FEE,
      totalPaid: selectedExpert.price + SERVICE_FEE,
      bookedAt: new Date().toLocaleString(),
    };

    // 2. Simulate API Call delay
    setTimeout(() => {
      console.log("Booking Successfully Processed:", payload);
      setConfirmedData(payload);
      setIsSubmitting(false);
    }, 1000);
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
            Select a verified specialist and schedule an instant consultation.
          </p>
        </div>

        <div className="grid lg:grid-cols-12 gap-5 items-start">
          {/* Left Column: Expert Cards */}
          <div className="lg:col-span-6 space-y-3 max-h-[calc(100vh-140px)] overflow-y-auto [scrollbar-width:none] [-ms-overflow-style:none] [&::-webkit-scrollbar]:hidden pr-1">
            {EXPERTS.map((expert) => {
              const isSelected = selectedExpert?.name === expert.name;
              return (
                <div
                  key={expert.name}
                  onClick={() => handleBook(expert)}
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
                          {expert.name.charAt(4)}
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
                          {expert.field}
                        </p>

                        <div className="flex items-center gap-2 mt-1.5">
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-amber-50 text-amber-800 border border-amber-200 font-bold">
                            <StarIcon className="w-3 h-3 text-amber-500 fill-current" />
                            {expert.rating}
                          </span>
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-xs bg-emerald-50 text-emerald-800 border border-emerald-200 font-semibold">
                            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse"></span>
                            Verified Specialist
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="text-right shrink-0">
                      <p className="text-paddy-green font-extrabold text-sm">
                        Rs. {expert.price}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleBook(expert);
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

          {/* Right Column: Checkout or Success Note */}
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

            {/* FORM VIEW */}
            {selectedExpert && !confirmedData && (
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
                      {selectedExpert.field}
                    </p>
                  </div>
                  <div className="text-right">
                    <span className="text-xs text-ink/50 block leading-none font-medium">Session Fee</span>
                    <span className="text-sm font-extrabold text-paddy-green mt-0.5 block">Rs. {selectedExpert.price}</span>
                  </div>
                </div>

                {/* Step 1 & Step 2 */}
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold tracking-wider text-ink/80 block">
                      1. Date & Time
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

                  <div className="space-y-1.5">
                    <label className="text-xs uppercase font-bold tracking-wider text-ink/80 block">
                      2. Payment Method
                    </label>
                    <div className="grid grid-cols-2 gap-1.5">
                      {PAYMENT_METHODS.map((method) => {
                        const isChecked = payment === method.id;
                        return (
                          <label
                            key={method.id}
                            className={`flex items-center gap-1.5 px-2 py-1.5 rounded-lg border cursor-pointer transition-all select-none ${
                              isChecked
                                ? "border-paddy-green bg-paddy-green/5 text-paddy-green font-bold shadow-2xs"
                                : "border-soil/15 bg-white text-ink/70 hover:border-soil/30 font-medium"
                            }`}
                          >
                            <input
                              type="radio"
                              name="payment"
                              value={method.id}
                              checked={isChecked}
                              onChange={() => setPayment(method.id)}
                              className="accent-paddy-green w-3.5 h-3.5 cursor-pointer"
                            />
                            <span className="text-xs">{method.icon}</span>
                            <span className="text-xs">{method.label}</span>
                          </label>
                        );
                      })}
                    </div>
                  </div>
                </div>

                {/* Conditional Inputs */}
                {(payment === "esewa" || payment === "khalti") && (
                  <div className="p-2 bg-soil/5 border border-soil/15 rounded-lg flex items-center justify-between gap-3">
                    <p className="text-xs font-bold text-ink shrink-0">
                      {payment === "esewa" ? "eSewa" : "Khalti"} Mobile:
                    </p>
                    <input
                      type="tel"
                      required
                      placeholder="98XXXXXXXX"
                      value={walletId}
                      onChange={(e) => setWalletId(e.target.value)}
                      className="w-full px-2.5 py-1.5 text-xs font-medium border border-soil/20 rounded bg-white text-ink focus:outline-none focus:border-paddy-green"
                    />
                  </div>
                )}

                {payment === "bank" && (
                  <div className="p-2 bg-soil/5 border border-soil/15 rounded-lg grid grid-cols-2 gap-2">
                    <input
                      type="text"
                      name="accountNumber"
                      required
                      placeholder="Account Number *"
                      value={bankInfo.accountNumber}
                      onChange={handleBankInfoChange}
                      className="w-full px-2.5 py-1.5 text-xs font-medium border border-soil/20 rounded bg-white text-ink focus:outline-none focus:border-paddy-green"
                    />
                    <input
                      type="tel"
                      name="registeredMobile"
                      required
                      placeholder="Mobile Number *"
                      value={bankInfo.registeredMobile}
                      onChange={handleBankInfoChange}
                      className="w-full px-2.5 py-1.5 text-xs font-medium border border-soil/20 rounded bg-white text-ink focus:outline-none focus:border-paddy-green"
                    />
                  </div>
                )}

                {payment === "card" && (
                  <div className="p-2 bg-soil/5 border border-soil/15 rounded-lg space-y-1.5">
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="cardName"
                        required
                        placeholder="Cardholder Name *"
                        value={cardInfo.cardName}
                        onChange={handleCardInfoChange}
                        className="w-full px-2.5 py-1 text-xs font-medium border border-soil/20 rounded bg-white text-ink"
                      />
                      <input
                        type="text"
                        name="cardNumber"
                        required
                        placeholder="Card Number *"
                        maxLength="19"
                        value={cardInfo.cardNumber}
                        onChange={handleCardInfoChange}
                        className="w-full px-2.5 py-1 text-xs font-medium border border-soil/20 rounded bg-white text-ink"
                      />
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <input
                        type="text"
                        name="expiry"
                        required
                        placeholder="MM/YY *"
                        maxLength="5"
                        value={cardInfo.expiry}
                        onChange={handleCardInfoChange}
                        className="w-full px-2.5 py-1 text-xs font-medium border border-soil/20 rounded bg-white text-ink"
                      />
                      <input
                        type="password"
                        name="cvc"
                        required
                        placeholder="CVC *"
                        maxLength="4"
                        value={cardInfo.cvc}
                        onChange={handleCardInfoChange}
                        className="w-full px-2.5 py-1 text-xs font-medium border border-soil/20 rounded bg-white text-ink"
                      />
                    </div>
                  </div>
                )}

                {/* Cost Breakdown & Pay Button */}
                <div className="grid grid-cols-12 gap-3 items-center bg-paddy-green/5 border border-paddy-green/20 rounded-xl p-2.5">
                  <div className="col-span-6 space-y-1 border-r border-paddy-green/20 pr-2">
                    <div className="flex justify-between text-xs text-ink/80">
                      <span>Fee:</span>
                      <span className="font-bold text-ink">Rs. {selectedExpert.price}</span>
                    </div>
                    <div className="flex justify-between text-xs text-ink/80">
                      <span>Service:</span>
                      <span className="font-bold text-ink">Rs. {SERVICE_FEE}</span>
                    </div>
                    <div className="flex justify-between text-xs font-extrabold text-paddy-green pt-1 border-t border-paddy-green/20">
                      <span>Total:</span>
                      <span className="text-sm">Rs. {selectedExpert.price + SERVICE_FEE}</span>
                    </div>
                  </div>

                  <div className="col-span-6">
                    <button
                      type="submit"
                      disabled={isSubmitting}
                      className="w-full py-2.5 px-3 rounded-lg bg-paddy-green text-paper font-bold hover:bg-soil-dark shadow-sm transition-all active:scale-[0.99] flex items-center justify-center gap-1.5 text-sm disabled:opacity-50"
                    >
                      {isSubmitting ? (
                        <span>Processing...</span>
                      ) : (
                        <>
                          <span>Confirm & Pay</span>
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

            {/* SUCCESS RECEIPT / NOTE VIEW */}
            {confirmedData && (
              <div className="text-center py-4 space-y-4 animate-in fade-in zoom-in-95 duration-200">
                <div className="w-12 h-12 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center mx-auto shadow-sm">
                  <svg className="w-6 h-6 fill-current" viewBox="0 0 20 20">
                    <path d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" />
                  </svg>
                </div>

                <div>
                  <span className="text-[10px] font-extrabold uppercase tracking-widest text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-full inline-block mb-1">
                    Payment Successful
                  </span>
                  <h3 className="text-ink text-lg font-bold">
                    Booking Confirmed!
                  </h3>
                  <p className="text-xs text-ink/60 mt-0.5 font-mono">
                    Receipt ID: {confirmedData.receiptId}
                  </p>
                </div>

                {/* Structured Success Note */}
                <div className="bg-emerald-50/50 p-3.5 rounded-xl text-left text-xs space-y-2 border border-emerald-200/60 shadow-2xs">
                  <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
                    <span className="text-ink/60 font-medium">Specialist:</span>
                    <span className="font-bold text-ink">{confirmedData.expert.name}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
                    <span className="text-ink/60 font-medium">Field:</span>
                    <span className="font-semibold text-ink">{confirmedData.expert.field}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
                    <span className="text-ink/60 font-medium">Scheduled Time:</span>
                    <span className="font-bold text-ink">{confirmedData.appointmentDate} at {confirmedData.appointmentTime}</span>
                  </div>
                  <div className="flex justify-between border-b border-emerald-200/40 pb-1.5">
                    <span className="text-ink/60 font-medium">Payment Method:</span>
                    <span className="font-bold text-ink">{confirmedData.paymentMethod}</span>
                  </div>
                  <div className="flex justify-between pt-1">
                    <span className="text-ink/80 font-bold">Total Paid:</span>
                    <span className="font-extrabold text-paddy-green text-sm">Rs. {confirmedData.totalPaid}</span>
                  </div>
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => window.print()}
                    className="flex-1 py-2 px-3 rounded-lg border border-soil/20 text-ink font-bold text-xs hover:bg-soil/5 transition-all"
                  >
                    🖨️ Print Receipt
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedExpert(null);
                      setConfirmedData(null);
                    }}
                    className="flex-1 py-2 px-3 rounded-lg bg-paddy-green text-paper font-bold text-xs hover:bg-soil-dark transition-all"
                  >
                    Done
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}