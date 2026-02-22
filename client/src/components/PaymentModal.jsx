import { useState, useRef, useCallback, useEffect } from "react";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  CreditCard, Smartphone, Banknote, Check, Loader2, Shield,
  Clock, Download, RefreshCw, Copy, CheckCheck, Leaf, X,
} from "lucide-react";
import { QRCodeCanvas } from "qrcode.react";
import { formatPrice } from "@/lib/utils";

/* ── QR countdown timer ── */
function QrTimer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);
  const mins = String(Math.floor(left / 60)).padStart(2, "0");
  const secs = String(left % 60).padStart(2, "0");
  const pct = (left / seconds) * 100;
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${pct > 30 ? "bg-green-500" : "bg-red-500"}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-xs font-semibold tabular-nums ${pct <= 30 ? "text-red-500" : "text-gray-500"}`}>
        {mins}:{secs}
      </span>
    </div>
  );
}

const METHODS = [
  { key: "upi",  icon: Smartphone,  label: "UPI / QR",       desc: "PhonePe, GPay, Paytm" },
  { key: "card", icon: CreditCard,  label: "Card",            desc: "Credit / Debit card"  },
  { key: "cod",  icon: Banknote,    label: "Cash on Delivery",desc: "Pay at your door"      },
];

const UPI_ID = "frutify@upi";

/**
 * PaymentModal
 * Props:
 *   open         – boolean
 *   onOpenChange – fn
 *   amount       – number (in app currency)
 *   orderId      – string
 *   onSuccess    – fn(method)  called after successful payment flow
 */
export default function PaymentModal({ open, onOpenChange, amount = 0, orderId = "", onSuccess }) {
  const [method, setMethod] = useState("upi");
  const [stage, setStage]   = useState("pick"); // pick | pay | processing | success

  /* Card fields */
  const [cardNumber, setCardNumber] = useState("");
  const [expiry, setExpiry]         = useState("");
  const [cvv, setCvv]               = useState("");
  const [cardName, setCardName]     = useState("");

  /* UPI */
  const [qrExpired, setQrExpired] = useState(false);
  const [copied, setCopied]       = useState(false);
  const qrRef = useRef(null);

  const inrAmount = (amount * 83).toFixed(2);
  const upiString = `upi://pay?pa=${UPI_ID}&pn=Frutify&am=${inrAmount}&cu=INR&tn=Order-${orderId}`;

  /* Formatters */
  const fmtCard   = v => v.replace(/\D/g, "").slice(0, 16).replace(/(.{4})/g, "$1 ").trim();
  const fmtExpiry = v => { const d = v.replace(/\D/g, "").slice(0, 4); return d.length > 2 ? d.slice(0,2)+"/"+d.slice(2) : d; };

  /* Validation */
  const cardValid = cardName.trim() && cardNumber.replace(/\s/g,"").length === 16 && expiry.length === 5 && cvv.length === 3;
  const canPay = method === "upi" ? !qrExpired : method === "card" ? cardValid : true;

  /* Copy UPI ID */
  const copyUpi = () => {
    navigator.clipboard.writeText(UPI_ID).catch(() => {});
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  /* Download QR */
  const downloadQr = useCallback(() => {
    const canvas = qrRef.current?.querySelector("canvas");
    if (!canvas) return;
    const a = document.createElement("a");
    a.href = canvas.toDataURL("image/png");
    a.download = `frutify-qr-${orderId}.png`;
    a.click();
  }, [orderId]);

  /* Pay handler */
  const handlePay = () => {
    setStage("processing");
    setTimeout(() => {
      setStage("success");
    }, 2200);
  };

  /* Reset on close */
  const handleClose = (v) => {
    if (!v) {
      setStage("pick");
      setMethod("upi");
      setCardNumber(""); setExpiry(""); setCvv(""); setCardName("");
      setQrExpired(false);
    }
    onOpenChange(v);
  };

  /* Confirm success */
  const handleConfirm = () => {
    handleClose(false);
    onSuccess?.(method);
  };

  return (
    <Dialog open={open} onOpenChange={handleClose}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden">

        {/* ── Header ── */}
        <div className="flex items-center justify-between px-6 pt-5 pb-4 border-b border-gray-100">
          <div className="flex items-center gap-2.5">
            <div className="p-1.5 rounded-lg bg-green-50">
              <Leaf className="h-4 w-4 text-green-600" />
            </div>
            <div>
              <DialogTitle className="text-base font-bold text-gray-900 leading-none">
                {stage === "success" ? "Payment Successful" : "Complete Payment"}
              </DialogTitle>
              {stage !== "success" && (
                <p className="text-xs text-gray-400 mt-0.5">Order #{orderId}</p>
              )}
            </div>
          </div>
          <div className="flex items-center gap-2">
            <div className="bg-green-50 border border-green-100 px-3 py-1 rounded-full">
              <p className="text-sm font-bold text-green-700">{formatPrice(amount)}</p>
            </div>
          </div>
        </div>

        {/* ── SUCCESS ── */}
        {stage === "success" && (
          <div className="px-6 py-10 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <Check className="h-8 w-8 text-green-600" />
            </div>
            <div>
              <p className="text-lg font-bold text-gray-900">Payment Confirmed!</p>
              <p className="text-sm text-gray-400 mt-1">Your order has been placed successfully.</p>
            </div>
            <div className="w-full bg-gray-50 rounded-xl border border-gray-100 p-4 text-left space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Amount paid</span>
                <span className="font-bold text-gray-900">{formatPrice(amount)}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Method</span>
                <span className="font-medium text-gray-700">
                  {method === "upi" ? "UPI / QR" : method === "card" ? "Card" : "Cash on Delivery"}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-500">Order ID</span>
                <span className="font-mono text-xs text-gray-600">{orderId}</span>
              </div>
            </div>
            <Button onClick={handleConfirm} className="w-full bg-green-600 hover:bg-green-700 text-white rounded-xl h-11 font-semibold">
              Done
            </Button>
          </div>
        )}

        {/* ── PROCESSING ── */}
        {stage === "processing" && (
          <div className="px-6 py-16 flex flex-col items-center gap-4 text-center">
            <div className="w-16 h-16 rounded-full bg-green-50 flex items-center justify-center">
              <Loader2 className="h-8 w-8 text-green-600 animate-spin" />
            </div>
            <div>
              <p className="text-base font-bold text-gray-900">Processing Payment…</p>
              <p className="text-sm text-gray-400 mt-1">Please wait, do not close this window.</p>
            </div>
          </div>
        )}

        {/* ── PICK & PAY ── */}
        {(stage === "pick" || stage === "pay") && (
          <div className="px-6 pt-5 pb-6 space-y-5">

            {/* Method tabs */}
            <div className="grid grid-cols-3 gap-2">
              {METHODS.map(m => {
                const Icon = m.icon;
                return (
                  <button
                    key={m.key}
                    onClick={() => { setMethod(m.key); setQrExpired(false); }}
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                      method === m.key
                        ? "border-green-500 bg-green-50 text-green-700"
                        : "border-gray-200 hover:border-gray-300 text-gray-500"
                    }`}
                  >
                    <Icon className={`h-5 w-5 ${method === m.key ? "text-green-600" : "text-gray-400"}`} />
                    <span className="text-xs font-semibold leading-tight">{m.label}</span>
                    <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">{m.desc}</span>
                  </button>
                );
              })}
            </div>

            {/* ── UPI / QR ── */}
            {method === "upi" && (
              <div className="space-y-4">
                <div className="flex gap-3">
                  {/* QR */}
                  <div ref={qrRef} className="relative shrink-0">
                    <div className={`p-2 rounded-xl border-2 bg-white transition-all ${qrExpired ? "border-red-200 opacity-40 grayscale" : "border-green-200"}`}>
                      <QRCodeCanvas
                        value={upiString}
                        size={120}
                        level="H"
                        imageSettings={{
                          src: "data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjQiIGhlaWdodD0iMjQiIHZpZXdCb3g9IjAgMCAyNCAyNCIgZmlsbD0ibm9uZSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cGF0aCBkPSJNMTcgOEMxNyA1LjIzOSAxNC43NjEgMyAxMiAzQzkuMjM5IDMgNyA1LjIzOSA3IDhDNyAxMC43NjEgOS4yMzkgMTMgMTIgMTNDMTQuNzYxIDEzIDE3IDEwLjc2MSAxNyA4WiIgZmlsbD0iIzE2YTM0YSIvPjxwYXRoIGQ9Ik0zIDIxQzMgMTcuMTM0IDcuMDI5IDE0IDEyIDE0QzE2Ljk3MSAxNCDyMSAxNy4xMzQgMjEgMjFIM1oiIGZpbGw9IiMxNmEzNGEiLz48L3N2Zz4=",
                          height: 20,
                          width: 20,
                          excavate: true,
                        }}
                        fgColor="#111827"
                      />
                    </div>
                    {qrExpired && (
                      <button onClick={() => setQrExpired(false)}
                        className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/5">
                        <RefreshCw className="h-5 w-5 text-gray-600" />
                        <span className="text-[10px] font-semibold text-gray-600">Refresh</span>
                      </button>
                    )}
                  </div>

                  {/* Info panel */}
                  <div className="flex-1 space-y-3">
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Amount</p>
                      <p className="text-xl font-bold text-gray-900">{formatPrice(amount)}</p>
                      <p className="text-xs text-gray-400">₹{inrAmount} INR</p>
                    </div>
                    <div>
                      <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">UPI ID</p>
                      <button onClick={copyUpi}
                        className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-gray-700 hover:bg-gray-100 transition-colors w-full justify-between">
                        <span>{UPI_ID}</span>
                        {copied ? <CheckCheck className="h-3 w-3 text-green-600 shrink-0" /> : <Copy className="h-3 w-3 text-gray-400 shrink-0" />}
                      </button>
                    </div>
                    <button onClick={downloadQr}
                      className="flex items-center gap-1.5 text-xs text-gray-500 hover:text-green-600 transition-colors">
                      <Download className="h-3.5 w-3.5" /> Download QR
                    </button>
                  </div>
                </div>

                {/* Timer */}
                <div className="space-y-1">
                  <p className="text-xs text-gray-400">QR expires in</p>
                  <QrTimer key={String(qrExpired)} seconds={300} onExpire={() => setQrExpired(true)} />
                </div>

                {/* Instructions */}
                <div className="bg-blue-50 border border-blue-100 rounded-xl p-3 space-y-1.5">
                  <p className="text-xs font-semibold text-blue-800">How to pay via UPI</p>
                  {[
                    "Open PhonePe / GPay / Paytm / any UPI app",
                    "Scan QR code or pay to UPI ID above",
                    `Enter amount: ₹${inrAmount}`,
                    "Click 'Confirm Payment' after paying",
                  ].map((s, i) => (
                    <p key={i} className="text-xs text-blue-700 flex items-start gap-1.5">
                      <span className="shrink-0 font-bold">{i + 1}.</span> {s}
                    </p>
                  ))}
                </div>

                <Button
                  disabled={qrExpired}
                  onClick={handlePay}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                >
                  <Check className="h-4 w-4 mr-2" />
                  I've Completed the Payment
                </Button>
              </div>
            )}

            {/* ── CARD ── */}
            {method === "card" && (
              <div className="space-y-4">
                {/* Card preview */}
                <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-5 text-white shadow-lg">
                  <div className="flex justify-between items-start mb-6">
                    <Leaf className="h-6 w-6 text-green-400" />
                    <div className="text-right">
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">Frutify Pay</p>
                    </div>
                  </div>
                  <p className="font-mono text-base tracking-widest mb-4 text-gray-200">
                    {cardNumber || "•••• •••• •••• ••••"}
                  </p>
                  <div className="flex justify-between items-end">
                    <div>
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Card Holder</p>
                      <p className="text-sm font-medium mt-0.5">{cardName || "YOUR NAME"}</p>
                    </div>
                    <div className="text-right">
                      <p className="text-[10px] text-gray-400 uppercase tracking-wide">Expires</p>
                      <p className="text-sm font-medium mt-0.5">{expiry || "MM/YY"}</p>
                    </div>
                  </div>
                </div>

                {/* Fields */}
                <div className="space-y-3">
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Card Number</Label>
                    <Input
                      placeholder="1234 5678 9012 3456"
                      value={cardNumber}
                      onChange={e => setCardNumber(fmtCard(e.target.value))}
                      className="font-mono tracking-wide"
                    />
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Name on Card</Label>
                    <Input
                      placeholder="Full name"
                      value={cardName}
                      onChange={e => setCardName(e.target.value)}
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">Expiry</Label>
                      <Input
                        placeholder="MM/YY"
                        value={expiry}
                        onChange={e => setExpiry(fmtExpiry(e.target.value))}
                        maxLength={5}
                      />
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs font-semibold text-gray-500 uppercase tracking-wide">CVV</Label>
                      <Input
                        type="password"
                        placeholder="•••"
                        value={cvv}
                        onChange={e => setCvv(e.target.value.replace(/\D/g, "").slice(0, 3))}
                        maxLength={3}
                      />
                    </div>
                  </div>
                </div>

                <div className="flex items-center gap-2 text-xs text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />
                  256-bit SSL encrypted & 3D Secure protected
                </div>

                <Button
                  disabled={!cardValid}
                  onClick={handlePay}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl disabled:opacity-50"
                >
                  <CreditCard className="h-4 w-4 mr-2" />
                  Pay {formatPrice(amount)}
                </Button>
              </div>
            )}

            {/* ── COD ── */}
            {method === "cod" && (
              <div className="space-y-4">
                <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 space-y-2">
                  <div className="flex items-center gap-2">
                    <Banknote className="h-5 w-5 text-amber-600 shrink-0" />
                    <p className="text-sm font-semibold text-amber-800">Cash on Delivery Selected</p>
                  </div>
                  <p className="text-xs text-amber-700 leading-relaxed">
                    Keep <span className="font-bold">₹{inrAmount}</span> ready when your order arrives. Our delivery agent will collect exact change if possible.
                  </p>
                </div>

                <div className="bg-white border border-gray-100 rounded-xl divide-y divide-gray-50">
                  {[
                    { label: "Order amount", value: formatPrice(amount) },
                    { label: "Cash to keep (INR)", value: `₹${inrAmount}` },
                    { label: "Delivery charge", value: "FREE" },
                    { label: "Estimated delivery", value: "30–45 min" },
                  ].map((r, i) => (
                    <div key={i} className="flex justify-between px-4 py-2.5 text-sm">
                      <span className="text-gray-500">{r.label}</span>
                      <span className={`font-semibold ${r.value === "FREE" ? "text-green-600" : "text-gray-900"}`}>{r.value}</span>
                    </div>
                  ))}
                </div>

                <div className="flex items-start gap-2 text-xs text-gray-400">
                  <Shield className="h-3.5 w-3.5 text-green-500 shrink-0 mt-0.5" />
                  You can cancel before the order is packed. No charges apply.
                </div>

                <Button
                  onClick={handlePay}
                  className="w-full h-11 bg-green-600 hover:bg-green-700 text-white font-semibold rounded-xl"
                >
                  <Banknote className="h-4 w-4 mr-2" />
                  Confirm Cash on Delivery
                </Button>
              </div>
            )}
          </div>
        )}

      </DialogContent>
    </Dialog>
  );
}
