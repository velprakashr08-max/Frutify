import { useState, useMemo, useEffect, useRef, useCallback } from 'react';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import {
  CreditCard, Check, Loader2, Printer, Download, QrCode,
  MapPin, Tag, Clock, Mail, ChevronRight, ChevronLeft,
  Truck, Gift, ShieldCheck, Banknote, ImageDown,
} from 'lucide-react';
import { QRCodeCanvas } from 'qrcode.react';
import { useCart } from '@/contexts/CartContext';
import { saveOrder } from '@/pages/OrderHistory';
import { formatPrice } from '@/lib/utils';

/* ── Coupon codes ── */
const COUPONS = {
  FRESH10:  { type: 'percent', value: 10, label: '10% off', minOrder: 2 },
  SAVE20:   { type: 'percent', value: 20, label: '20% off', minOrder: 10 },
  FLAT50:   { type: 'flat',    value: 50 / 83, label: '₹50 off', minOrder: 5 },
  WELCOME:  { type: 'percent', value: 15, label: '15% off (New user)', minOrder: 0 },
  FREEShip: { type: 'flat',    value: 0, label: 'Free express shipping', minOrder: 0, freeShip: true },
};

/* ── Order summary sub-component ── */
function OrderSummary({ cartProducts, subtotal, discount, label }) {
  return (
    <div className="border-t pt-3 space-y-1">
      {cartProducts.map(ci => (
        <div key={ci.productId} className="flex justify-between text-sm">
          <span>{ci.product.name} ×{ci.quantity}</span>
          <span>{formatPrice(ci.product.price * ci.quantity)}</span>
        </div>
      ))}
      {discount > 0 && (
        <div className="flex justify-between text-sm text-green-600">
          <span>Discount</span>
          <span>-{formatPrice(discount)}</span>
        </div>
      )}
      <div className="flex justify-between text-sm text-muted-foreground">
        <span>Shipping</span>
        <span className="text-green-600 font-medium">FREE</span>
      </div>
      <div className="flex justify-between font-bold pt-2 border-t">
        <span>{label}</span>
        <span className="text-primary">{formatPrice(subtotal - discount)}</span>
      </div>
    </div>
  );
}

/* ── Countdown timer for QR ── */
function QrTimer({ seconds, onExpire }) {
  const [left, setLeft] = useState(seconds);
  useEffect(() => {
    if (left <= 0) { onExpire(); return; }
    const t = setTimeout(() => setLeft(l => l - 1), 1000);
    return () => clearTimeout(t);
  }, [left, onExpire]);
  const mins = String(Math.floor(left / 60)).padStart(2, '0');
  const secs = String(left % 60).padStart(2, '0');
  const pct = (left / seconds) * 100;
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-4 w-4 text-muted-foreground" />
      <div className="flex-1 h-1.5 rounded-full bg-muted overflow-hidden">
        <div
          className={`h-full rounded-full transition-all duration-1000 ${pct > 30 ? 'bg-primary' : 'bg-red-500'}`}
          style={{ width: `${pct}%` }}
        />
      </div>
      <span className={`font-mono text-sm font-medium ${pct <= 30 ? 'text-red-500' : 'text-muted-foreground'}`}>
        {mins}:{secs}
      </span>
    </div>
  );
}

export default function CheckoutModal({ open, onOpenChange, cartProducts, subtotal }) {
  const { clearCart } = useCart();

  /* ── stages: address → form → processing → success ── */
  const [stage, setStage] = useState('address');
  const [method, setMethod] = useState('card');

  /* Card fields */
  const [cardNumber, setCardNumber] = useState('');
  const [expiry, setExpiry] = useState('');
  const [cvv, setCvv] = useState('');

  /* Address fields */
  const [name, setName] = useState('');
  const [phone, setPhone] = useState('');
  const [email, setEmail] = useState('');
  const [address, setAddress] = useState('');
  const [city, setCity] = useState('');
  const [pincode, setPincode] = useState('');

  /* Coupon */
  const [couponCode, setCouponCode] = useState('');
  const [appliedCoupon, setAppliedCoupon] = useState(null);
  const [couponError, setCouponError] = useState('');

  /* QR timer */
  const [qrExpired, setQrExpired] = useState(false);
  const qrRef = useRef(null);

  /* Transaction */
  const [txnId] = useState(() => `FVM${Date.now()}`);

  /* ── Discount calc ── */
  const discount = useMemo(() => {
    if (!appliedCoupon) return 0;
    const c = COUPONS[appliedCoupon];
    if (!c) return 0;
    if (c.type === 'percent') return subtotal * (c.value / 100);
    return c.value;
  }, [appliedCoupon, subtotal]);

  const finalAmount = subtotal - discount;

  /* ── UPI QR string (auto-generated) ── */
  const upiString = useMemo(() => {
    const inrAmount = (finalAmount * 83).toFixed(2);
    return `upi://pay?pa=freshveg@upi&pn=FreshVeg&am=${inrAmount}&cu=INR&tn=Order-${txnId}`;
  }, [finalAmount, txnId]);

  /* ── Formatters ── */
  const formatCard = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 16);
    return digits.replace(/(.{4})/g, '$1 ').trim();
  };
  const formatExpiry = (v) => {
    const digits = v.replace(/\D/g, '').slice(0, 4);
    if (digits.length > 2) return digits.slice(0, 2) + '/' + digits.slice(2);
    return digits;
  };

  /* ── Validations ── */
  const addressValid = name.trim() && phone.replace(/\D/g, '').length >= 10 && address.trim() && city.trim() && pincode.replace(/\D/g, '').length >= 5;
  const cardValid = cardNumber.replace(/\s/g, '').length === 16 && expiry.length === 5 && cvv.length === 3;
  const canPay = method === 'online' ? !qrExpired : cardValid;

  /* ── Coupon handler ── */
  const applyCoupon = () => {
    const key = couponCode.trim().toUpperCase();
    setCouponError('');
    if (!COUPONS[key]) { setCouponError('Invalid coupon code'); return; }
    const c = COUPONS[key];
    if (subtotal < c.minOrder) { setCouponError(`Minimum order: ${formatPrice(c.minOrder)}`); return; }
    setAppliedCoupon(key);
    setCouponError('');
  };

  const removeCoupon = () => {
    setAppliedCoupon(null);
    setCouponCode('');
    setCouponError('');
  };

  /* ── QR download ── */
  const downloadQr = useCallback(() => {
    const canvas = qrRef.current?.querySelector('canvas');
    if (!canvas) return;
    const url = canvas.toDataURL('image/png');
    const a = document.createElement('a');
    a.href = url;
    a.download = `payment-qr-${txnId}.png`;
    a.click();
  }, [txnId]);

  /* ── Refresh QR (on expiry) ── */
  const refreshQr = () => setQrExpired(false);

  /* ── Pay handler ── */
  const handlePay = () => {
    setStage('processing');
    setTimeout(() => {
      saveOrder({
        id: txnId,
        date: new Date().toISOString(),
        items: cartProducts.map(ci => ({ name: ci.product.name, quantity: ci.quantity, price: ci.product.price })),
        total: finalAmount,
        discount,
        coupon: appliedCoupon || null,
        method: method === 'card' ? 'Card' : 'UPI (QR)',
        address: { name, phone, email, address, city, pincode },
      });
      setStage('success');
    }, 2200);
  };

  /* ── Reset & close ── */
  const handleContinue = () => {
    clearCart();
    setStage('address');
    setMethod('card');
    setCardNumber(''); setExpiry(''); setCvv('');
    setName(''); setPhone(''); setEmail(''); setAddress(''); setCity(''); setPincode('');
    setCouponCode(''); setAppliedCoupon(null); setCouponError('');
    setQrExpired(false);
    onOpenChange(false);
  };

  /* ── Receipt ── */
  const receiptText = () => {
    const lines = [
      '════════════════════════════════',
      '        🥬 FreshVeg Receipt        ',
      '════════════════════════════════',
      '',
      `Transaction : ${txnId}`,
      `Date        : ${new Date().toLocaleString()}`,
      `Payment     : ${method === 'card' ? 'Card' : 'UPI (QR)'}`,
      '',
      `Deliver to  : ${name}`,
      `Phone       : ${phone}`,
      `Address     : ${address}, ${city} - ${pincode}`,
      ...(email ? [`Email       : ${email}`] : []),
      '',
      '── Items ─────────────────────',
      ...cartProducts.map(ci => `  ${ci.product.name} ×${ci.quantity}  ${formatPrice(ci.product.price * ci.quantity)}`),
      '',
      ...(discount > 0 ? [`Discount    : -${formatPrice(discount)} (${appliedCoupon})`] : []),
      `Shipping    : FREE`,
      `──────────────────────────────`,
      `TOTAL       : ${formatPrice(finalAmount)}`,
      '',
      'Thank you for shopping with FreshVeg! 🌿',
      '════════════════════════════════',
    ];
    return lines.join('\n');
  };

  const downloadReceipt = () => {
    const blob = new Blob([receiptText()], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url; a.download = `receipt-${txnId}.txt`; a.click();
    URL.revokeObjectURL(url);
  };

  const printReceipt = () => {
    const w = window.open('', '', 'width=400,height=600');
    if (w) {
      w.document.write(`<pre style="font-family:monospace;padding:20px">${receiptText()}</pre>`);
      w.print();
    }
  };

  const emailReceipt = () => {
    const subject = encodeURIComponent(`FreshVeg Receipt - ${txnId}`);
    const body = encodeURIComponent(receiptText());
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };

  return (
    <Dialog open={open} onOpenChange={v => { if (stage !== 'processing') { onOpenChange(v); if (!v) setStage('address'); } }}>
      <DialogContent className="sm:max-w-lg glass-strong rounded-2xl max-h-[90vh] overflow-y-auto">

        {/* ═══════════════ STAGE 1: DELIVERY ADDRESS ═══════════════ */}
        {stage === 'address' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <MapPin className="h-5 w-5" /> Delivery Details
              </DialogTitle>
            </DialogHeader>

            {/* Progress steps */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">1</span>
              <span className="font-medium text-primary">Address</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-muted rounded-full w-5 h-5 flex items-center justify-center text-[10px]">2</span>
              <span>Payment</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-muted rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
              <span>Done</span>
            </div>

            <div className="space-y-3 pt-2">
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">Full Name *</Label>
                  <Input placeholder="Ravi Kumar" value={name} className="rounded-lg"
                    onChange={e => setName(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Phone *</Label>
                  <Input placeholder="9876543210" value={phone} className="rounded-lg"
                    onChange={e => setPhone(e.target.value.replace(/\D/g, '').slice(0, 10))} />
                </div>
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Email (for receipt)</Label>
                <Input placeholder="ravi@email.com" type="email" value={email} className="rounded-lg"
                  onChange={e => setEmail(e.target.value)} />
              </div>
              <div className="space-y-1">
                <Label className="text-xs">Address *</Label>
                <Input placeholder="House No, Street, Landmark" value={address} className="rounded-lg"
                  onChange={e => setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">City *</Label>
                  <Input placeholder="Mumbai" value={city} className="rounded-lg"
                    onChange={e => setCity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pincode *</Label>
                  <Input placeholder="400001" value={pincode} className="rounded-lg"
                    onChange={e => setPincode(e.target.value.replace(/\D/g, '').slice(0, 6))} />
                </div>
              </div>

              {/* ── Coupon ── */}
              <div className="space-y-2 pt-1">
                <Label className="text-xs flex items-center gap-1"><Tag className="h-3 w-3" /> Coupon Code</Label>
                {appliedCoupon ? (
                  <div className="flex items-center gap-2 bg-green-50 dark:bg-green-950/30 border border-green-200 dark:border-green-800 rounded-lg p-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 dark:text-green-400 flex-1">
                      {appliedCoupon} — {COUPONS[appliedCoupon].label}
                    </span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-700" onClick={removeCoupon}>
                      Remove
                    </Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="e.g. FRESH10" value={couponCode} className="rounded-lg flex-1"
                      onChange={e => { setCouponCode(e.target.value.toUpperCase()); setCouponError(''); }} />
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={applyCoupon} disabled={!couponCode.trim()}>
                      Apply
                    </Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                {!appliedCoupon && (
                  <p className="text-[10px] text-muted-foreground">Try: FRESH10, SAVE20, FLAT50, WELCOME</p>
                )}
              </div>

              <OrderSummary cartProducts={cartProducts} subtotal={subtotal} discount={discount} label="Total" />

              {/* Delivery estimate */}
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-2 text-xs text-primary">
                <Truck className="h-4 w-4" />
                <span className="font-medium">Estimated delivery: 30-45 mins</span>
              </div>

              <Button className="w-full rounded-full" onClick={() => setStage('form')} disabled={!addressValid}>
                Continue to Payment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>
        )}

        {/* ═══════════════ STAGE 2: PAYMENT ═══════════════ */}
        {stage === 'form' && (
          <>
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <CreditCard className="h-5 w-5" /> Payment
              </DialogTitle>
            </DialogHeader>

            {/* Progress steps */}
            <div className="flex items-center gap-1 text-xs text-muted-foreground pt-1">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px]">✓</span>
              <span className="text-muted-foreground">Address</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">2</span>
              <span className="font-medium text-primary">Payment</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-muted rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
              <span>Done</span>
            </div>

            <div className="space-y-4 pt-2">
              {/* Delivery summary mini-card */}
              <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-2 text-xs">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground" />
                <div className="flex-1">
                  <span className="font-medium">{name}</span> · {phone}<br />
                  <span className="text-muted-foreground">{address}, {city} - {pincode}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={() => setStage('address')}>
                  <ChevronLeft className="h-3 w-3 mr-0.5" /> Edit
                </Button>
              </div>

              {/* Payment method selector */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Payment Method</Label>
                <RadioGroup value={method} onValueChange={v => { setMethod(v); setQrExpired(false); }} className="grid grid-cols-3 gap-3">
                  <label
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'card' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <RadioGroupItem value="card" className="sr-only" />
                    <CreditCard className={`h-5 w-5 ${method === 'card' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-medium ${method === 'card' ? 'text-primary' : 'text-muted-foreground'}`}>Card</span>
                  </label>
                  <label
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'online' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <RadioGroupItem value="online" className="sr-only" />
                    <QrCode className={`h-5 w-5 ${method === 'online' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-medium ${method === 'online' ? 'text-primary' : 'text-muted-foreground'}`}>UPI / QR</span>
                  </label>
                  <label
                    className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border-2 cursor-pointer transition-all ${method === 'cod' ? 'border-primary bg-primary/5' : 'border-border hover:border-primary/30'}`}
                  >
                    <RadioGroupItem value="cod" className="sr-only" />
                    <Banknote className={`h-5 w-5 ${method === 'cod' ? 'text-primary' : 'text-muted-foreground'}`} />
                    <span className={`text-xs font-medium ${method === 'cod' ? 'text-primary' : 'text-muted-foreground'}`}>COD</span>
                  </label>
                </RadioGroup>
              </div>

              {/* Card fields */}
              {method === 'card' && (
                <div className="space-y-3 animate-fade-in">
                  <div className="space-y-2">
                    <Label>Card Number</Label>
                    <Input placeholder="XXXX XXXX XXXX XXXX" value={cardNumber} className="rounded-lg"
                      onChange={e => setCardNumber(formatCard(e.target.value))} />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>Expiry</Label>
                      <Input placeholder="MM/YY" value={expiry} className="rounded-lg"
                        onChange={e => setExpiry(formatExpiry(e.target.value))} />
                    </div>
                    <div className="space-y-2">
                      <Label>CVV</Label>
                      <Input placeholder="123" value={cvv} maxLength={3} className="rounded-lg"
                        onChange={e => setCvv(e.target.value.replace(/\D/g, '').slice(0, 3))} />
                    </div>
                  </div>
                </div>
              )}

              {/* ── Real QR Code (auto-generated) ── */}
              {method === 'online' && (
                <div className="flex flex-col items-center gap-3 py-2 animate-fade-in">
                  <p className="text-sm text-muted-foreground">Scan with any UPI app (GPay, PhonePe, Paytm)</p>

                  {qrExpired ? (
                    <div className="flex flex-col items-center gap-3 p-6 bg-muted/50 rounded-xl border">
                      <Clock className="h-8 w-8 text-muted-foreground" />
                      <p className="text-sm font-medium">QR Code Expired</p>
                      <Button variant="outline" size="sm" className="rounded-full" onClick={refreshQr}>
                        Generate New QR
                      </Button>
                    </div>
                  ) : (
                    <>
                      <div ref={qrRef} className="p-4 bg-white rounded-xl border shadow-sm">
                        <QRCodeCanvas
                          value={upiString}
                          size={180}
                          level="H"
                          includeMargin={false}
                          imageSettings={{
                            src: '',
                            height: 0,
                            width: 0,
                            excavate: false,
                          }}
                        />
                      </div>

                      {/* Timer */}
                      <div className="w-full max-w-55">
                        <QrTimer seconds={300} onExpire={() => setQrExpired(true)} />
                      </div>

                      <Button variant="ghost" size="sm" className="text-xs gap-1" onClick={downloadQr}>
                        <ImageDown className="h-3.5 w-3.5" /> Download QR
                      </Button>
                    </>
                  )}

                  <div className="flex items-center gap-1 text-xs text-muted-foreground">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600" />
                    <span>Secured by UPI · Amount: <strong className="text-foreground">{formatPrice(finalAmount)}</strong></span>
                  </div>
                </div>
              )}

              {/* COD notice */}
              {method === 'cod' && (
                <div className="flex flex-col gap-2 animate-fade-in text-sm">
                  <div className="flex items-center gap-2 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-800 rounded-lg p-3">
                    <Banknote className="h-5 w-5 text-amber-600" />
                    <div>
                      <p className="font-medium text-amber-700 dark:text-amber-400">Cash on Delivery</p>
                      <p className="text-xs text-amber-600 dark:text-amber-500">Pay {formatPrice(finalAmount)} when your order arrives.</p>
                    </div>
                  </div>
                </div>
              )}

              <OrderSummary cartProducts={cartProducts} subtotal={subtotal} discount={discount} label="Total" />

              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setStage('address')}>
                  <ChevronLeft className="h-4 w-4 mr-1" /> Back
                </Button>
                <Button
                  className="flex-1 rounded-full"
                  onClick={handlePay}
                  disabled={method === 'card' ? !cardValid : method === 'online' ? qrExpired : false}
                >
                  {method === 'card' && `Pay ${formatPrice(finalAmount)}`}
                  {method === 'online' && `Confirm Payment ${formatPrice(finalAmount)}`}
                  {method === 'cod' && `Place Order ${formatPrice(finalAmount)}`}
                </Button>
              </div>
            </div>
          </>
        )}

        {/* ═══════════════ PROCESSING ═══════════════ */}
        {stage === 'processing' && (
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin" />
            <p className="text-lg font-heading font-semibold">Processing Payment...</p>
            <p className="text-sm text-muted-foreground">Please wait while we process your order.</p>
          </div>
        )}

        {/* ═══════════════ SUCCESS ═══════════════ */}
        {stage === 'success' && (
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center animate-scale-in">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold">
              {method === 'cod' ? 'Order Placed!' : 'Payment Successful!'}
            </h3>
            <div className="text-center space-y-1 text-sm text-muted-foreground">
              <p>Transaction ID: <span className="font-mono font-medium text-foreground">{txnId}</span></p>
              <p>Method: {method === 'card' ? 'Credit Card' : method === 'online' ? 'UPI (QR)' : 'Cash on Delivery'}</p>
              <p>{new Date().toLocaleString()}</p>
            </div>

            {/* Delivery card */}
            <div className="w-full bg-muted/50 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className="h-3.5 w-3.5 text-primary" /> Delivering to
              </div>
              <p>{name} · {phone}</p>
              <p className="text-muted-foreground">{address}, {city} - {pincode}</p>
            </div>

            <OrderSummary cartProducts={cartProducts} subtotal={subtotal} discount={discount} label="Total Paid" />

            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 rounded-full" onClick={printReceipt}>
                <Printer className="h-4 w-4 mr-1" /> Print
              </Button>
              <Button variant="outline" className="flex-1 rounded-full" onClick={downloadReceipt}>
                <Download className="h-4 w-4 mr-1" /> Download
              </Button>
              {email && (
                <Button variant="outline" className="flex-1 rounded-full" onClick={emailReceipt}>
                  <Mail className="h-4 w-4 mr-1" /> Email
                </Button>
              )}
            </div>
            <Button className="w-full rounded-full" onClick={handleContinue}>Continue Shopping</Button>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}