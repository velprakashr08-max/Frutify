import{useState,useMemo,useEffect,useRef,useCallback} from 'react';
import{Dialog,DialogContent,DialogHeader,DialogTitle} from '@/components/ui/dialog';
import{Input} from '@/components/ui/input';
import{Button} from '@/components/ui/button';
import{Label} from '@/components/ui/label';
import{Check,Loader2,Printer,Download,MapPin,Tag,Mail,ChevronRight,ChevronLeft,Truck,Gift,ShieldCheck,Banknote,CreditCard,Smartphone,Clock,Copy,CheckCheck,RefreshCw,Leaf,Shield} from 'lucide-react';
import{QRCodeCanvas} from 'qrcode.react';
import{useCart} from '@/contexts/CartContext';
import{saveOrder} from '@/lib/storage';
import{formatPrice} from '@/lib/utils';
const UPI_ID ='frutify@upi';
const COUPONS ={
  FRESH10:{type:'percent',value:10,label:'10% off',minOrder:2},
  SAVE20:{type:'percent',value:20,label:'20% off',minOrder:10},
  FLAT50:{type:'flat',value:50/83,label:'Rs.50 off',minOrder:5},
  WELCOME:{type:'percent',value:15,label:'15% off (New user)',minOrder:0},
};
const METHODS = [
  { key:'upi',icon:Smartphone,label:'UPI / QR',desc:'GPay,PhonePe,Paytm'},
  { key:'card',icon:CreditCard,label:'Card',desc:'Credit / Debit card'},
  { key:'cod',icon:Banknote,label:'Cash on Delivery',desc:'Pay at your door'},
];

function QrTimer({seconds,onExpire}){
  const[left,setLeft]=useState(seconds);
  useEffect(()=>{
    if (left<=0){onExpire();return;}
    const t=setTimeout(()=>setLeft(l=>l-1),1000);
    return()=>clearTimeout(t);
  },[left,onExpire]);
  const mins=String(Math.floor(left/60)).padStart(2,'0');
  const secs=String(left%60).padStart(2,'0');
  const pct=(left/seconds)*100;
  return (
    <div className="flex items-center gap-2">
      <Clock className="h-3.5 w-3.5 text-gray-400 shrink-0" />
      <div className="flex-1 h-1.5 rounded-full bg-gray-100 overflow-hidden">
        <div className={`h-full rounded-full transition-all duration-1000 ${pct > 30 ? 'bg-green-500' : 'bg-red-500'}`}
          style={{width:`${pct}%`}} />
      </div>
      <span className={`font-mono text-xs font-semibold tabular-nums ${pct <= 30 ? 'text-red-500' : 'text-gray-500'}`}>
        {mins}:{secs}
      </span>
    </div>
  );
}

function OrderSummary({cartProducts,subtotal,discount,label}){
  return(
    <div className="border-t pt-3 space-y-1">
      {cartProducts.map(ci=>(
        <div key={ci.productId} className="flex justify-between text-sm">
          <span>{ci.product.name}x{ci.quantity}</span>
          <span>{formatPrice(ci.product.price*ci.quantity)}</span>
        </div>
      ))}
      {discount > 0 &&(
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
        <span className="text-primary">{formatPrice(subtotal-discount)}</span>
      </div>
    </div>
  );
}

export default function CheckoutModal({open,onOpenChange,cartProducts,subtotal}){
  const {clearCart}=useCart();
  const [stage,setStage]=useState('address');
  const [name,setName]=useState('');
  const [phone,setPhone]=useState('');
  const [email,setEmail]=useState('');
  const [address,setAddress]=useState('');
  const [city,setCity]=useState('');
  const [pincode,setPincode]=useState('');
  const [couponCode,setCouponCode]=useState('');
  const [appliedCoupon,setAppliedCoupon]=useState(null);
  const [couponError,setCouponError]=useState('');

  // Payment method
  const [method,setMethod]=useState('upi');
  const [cardNumber,setCardNumber]=useState('');
  const [expiry,setExpiry]=useState('');
  const [cvv,setCvv]=useState('');
  const [cardName,setCardName]=useState('');
  const [qrExpired,setQrExpired]=useState(false);
  const [copied,setCopied]=useState(false);
  const qrRef=useRef(null);
  const [txnId]=useState(()=> `FVM${Date.now()}`);
  const [paidMethod,setPaidMethod]=useState('');
  const [snapCart,setSnapCart]=useState([]);
  const [snapSubtotal,setSnapSubtotal]=useState(0);
  const [snapDiscount,setSnapDiscount]=useState(0);
  const discount=useMemo(()=>{
    if(!appliedCoupon) return 0;
    const c=COUPONS[appliedCoupon];
    if (!c) return 0;
    return c.type ==='percent'?subtotal*(c.value/100):c.value;
  },[appliedCoupon,subtotal]);
  const finalAmount=subtotal-discount;
  const inrAmount=(finalAmount*83).toFixed(2);
  const upiString=`upi://pay?pa=${UPI_ID}&pn=Frutify&am=${inrAmount}&cu=INR&tn=Order-${txnId}`;
  const fmtCard =v=>v.replace(/\D/g,'').slice(0,16).replace(/(.{4})/g,'$1').trim();
  const fmtExpiry=v=>{const d =v.replace(/\D/g,'').slice(0,4); return d.length > 2 ? d.slice(0,2)+'/'+d.slice(2) :d;};
  const addressValid=!!(name.trim() && phone.replace(/\D/g, '').length ===10 && address.trim() && city.trim() && pincode.replace(/\D/g, '').length === 6);
  const cardValid=!!(cardName.trim() && cardNumber.replace(/\s/g,'').length ===16 && expiry.length ===5 && cvv.length ===3);
  const canPay=method==='upi' ?!qrExpired:method ==='card' ?cardValid:true;
  const applyCoupon =()=>{
    const key=couponCode.trim().toUpperCase();
    setCouponError('');
    if (!COUPONS[key]){setCouponError('Invalid coupon code'); return;}
    const c =COUPONS[key];
    if (subtotal<c.minOrder){setCouponError(`Minimum order:${formatPrice(c.minOrder)}`);return;}
    setAppliedCoupon(key);
  };
  const removeCoupon =()=>{setAppliedCoupon(null);setCouponCode('');setCouponError('');};
  const copyUpi =()=>{
    navigator.clipboard.writeText(UPI_ID).catch(()=>{});
    setCopied(true);
    setTimeout(()=>setCopied(false),2000);
  };
  const downloadQr=useCallback(()=>{
    const canvas=qrRef.current?.querySelector('canvas');
    if(!canvas) return;
    const a=document.createElement('a');
    a.href=canvas.toDataURL('image/png');
    a.download=`frutify-qr-${txnId}.png`;
    a.click();
  },[txnId]);
  const handlePay =()=>{
    setSnapCart(cartProducts);
    setSnapSubtotal(subtotal);
    setSnapDiscount(discount);
    setPaidMethod(method);
    setStage('processing');
    saveOrder({
      id:txnId,date:new Date().toISOString(),
      items:cartProducts.map(ci=>({name:ci.product.name,quantity:ci.quantity,price:ci.product.price})),
  total:finalAmount,discount,coupon: appliedCoupon ||null,
      method:method ==='upi' ? 'UPI / QR' :method ==='card' ? 'Card' :'Cash on Delivery',
      address:{name,phone,email,address,city,pincode},
    });
    clearCart();
    setTimeout(()=>setStage('success'),2200);
  };
  const handleContinue =()=>{
    setStage('address');
    setName('');setPhone('');setEmail('');setAddress('');setCity('');setPincode('');
    setCouponCode('');setAppliedCoupon(null);setCouponError('');
    setMethod('upi');setCardNumber('');setExpiry('');setCvv('');setCardName('');
    setQrExpired(false);
    onOpenChange(false);
  };
  const receiptText =()=>[
    '================================',
    '        Frutify Receipt         ',
    '================================',
    '',
    `Transaction:${txnId}`,
    `Date:${new Date().toLocaleString()}`,
    `Payment:${paidMethod ==='upi' ?'UPI / QR':paidMethod ==='card' ?'Card':'Cash on Delivery'}`,'',
    `Deliver to:${name}`,
    `Phone:${phone}`,
    `Address:${address},${city}-${pincode}`,...(email ?[`Email:${email}`]:[]),'',
    '-- Items ----------------------------',
    ...snapCart.map(ci=>`${ci.product.name} x${ci.quantity}  ${formatPrice(ci.product.price *ci.quantity)}`),
    '',
    ...(snapDiscount >0 ?[`Discount:-${formatPrice(snapDiscount)}(${appliedCoupon})`]:[]),
    'Shipping:FREE',
    '--------------------------------------',
    `TOTAL:${formatPrice(snapSubtotal-snapDiscount)}`,'',
    'Thank you for shopping with Frutify!',
    '================================',
  ].join('\n');

  const downloadReceipt =()=>{
    const blob=new Blob([receiptText()],{type:'text/plain'});
    const url=URL.createObjectURL(blob);
    const a=document.createElement('a');
    a.href=url;a.download =`receipt-${txnId}.txt`;a.click();
    URL.revokeObjectURL(url);
  };
  const printReceipt=()=>{
    const w =window.open('','','width=400,height=600');
    if(w){w.document.write(`<pre style="font-family:monospace;padding:20px">${receiptText()}</pre>`); w.print();}
  };
  const emailReceipt =()=>{
    const subject=encodeURIComponent(`Frutify Receipt-${txnId}`);
    const body=encodeURIComponent(receiptText());
    window.open(`mailto:${email}?subject=${subject}&body=${body}`);
  };
  return (
    <Dialog open={open} onOpenChange={v=>{if(stage !=='processing'){onOpenChange(v);if(!v) setStage('address');}}}>
      <DialogContent className="sm:max-w-lg rounded-2xl max-h-[90vh] overflow-y-auto [&::-webkit-scrollbar]:hidden [scrollbar-width:none]">
        {stage ==='address' &&(
          <>
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <MapPin className="h-5 w-5" />Delivery Details
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">1</span>
              <span className="font-medium text-primary">Address</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-muted rounded-full w-5 h-5 flex items-center justify-center text-[10px]">2</span>
              <span>Payment</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-muted rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
              <span>Done</span>
            </div>
            <div className="space-y-3">
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
                  onChange={e =>setAddress(e.target.value)} />
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1">
                  <Label className="text-xs">City *</Label>
                  <Input placeholder="Mumbai" value={city} className="rounded-lg"
                    onChange={e =>setCity(e.target.value)} />
                </div>
                <div className="space-y-1">
                  <Label className="text-xs">Pincode *</Label>
                  <Input placeholder="400001" value={pincode} className="rounded-lg"
                    onChange={e=>setPincode(e.target.value.replace(/\D/g,'').slice(0,6))} />
                </div>
              </div>

              <div className="space-y-2 pt-1">
                <Label className="text-xs flex items-center gap-1"><Tag className="h-3 w-3"/>Coupon Code</Label>
                {appliedCoupon ?(
                  <div className="flex items-center gap-2 bg-green-50 border border-green-200 rounded-lg p-2">
                    <Gift className="h-4 w-4 text-green-600" />
                    <span className="text-sm font-medium text-green-700 flex-1">{appliedCoupon}-{COUPONS[appliedCoupon].label}</span>
                    <Button variant="ghost" size="sm" className="h-6 text-xs text-red-500 hover:text-red-700" onClick={removeCoupon}>Remove</Button>
                  </div>
                ) : (
                  <div className="flex gap-2">
                    <Input placeholder="COUPON" value={couponCode} className="rounded-lg flex-1"
                      onChange={e=>{setCouponCode(e.target.value.toUpperCase());setCouponError('');}} />
                    <Button variant="outline" size="sm" className="rounded-lg" onClick={applyCoupon} disabled={!couponCode.trim()}>Apply</Button>
                  </div>
                )}
                {couponError && <p className="text-xs text-red-500">{couponError}</p>}
                {!appliedCoupon && <p className="text-[10px] text-muted-foreground">Try:FRESH10, SAVE20, FLAT50, WELCOME</p>}
              </div>
              <OrderSummary cartProducts={cartProducts} subtotal={subtotal} discount={discount} label="Total" />
              <div className="flex items-center gap-2 bg-primary/5 rounded-lg p-2 text-xs text-primary">
                <Truck className="h-4 w-4" />
                <span className="font-medium">Estimated delivery:45 mins</span>
              </div>
              <Button className="w-full rounded-full" onClick={()=>setStage('payment')} disabled={!addressValid}>
                Continue to Payment <ChevronRight className="h-4 w-4 ml-1" />
              </Button>
            </div>
          </>)}
        {stage ==='payment' &&(
          <>
            <DialogHeader>
              <DialogTitle className="font-heading flex items-center gap-2">
                <CreditCard className="h-5 w-5"/> Payment
              </DialogTitle>
            </DialogHeader>
            <div className="flex items-center gap-1 text-xs text-muted-foreground">
              <span className="bg-primary/20 text-primary rounded-full w-5 h-5 flex items-center justify-center text-[10px]">&#10003;</span>
              <span className="text-muted-foreground">Address</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-primary text-primary-foreground rounded-full w-5 h-5 flex items-center justify-center text-[10px] font-bold">2</span>
              <span className="font-medium text-primary">Payment</span>
              <ChevronRight className="h-3 w-3" />
              <span className="bg-muted rounded-full w-5 h-5 flex items-center justify-center text-[10px]">3</span>
              <span>Done</span>
            </div>
            <div className="space-y-4">
              <div className="flex items-start gap-2 bg-muted/50 rounded-lg p-2 text-xs">
                <MapPin className="h-3.5 w-3.5 mt-0.5 text-muted-foreground"/>
                <div className="flex-1">
                  <span className="font-medium">{name}</span>-{phone}<br/>
                  <span className="text-muted-foreground">{address}, {city} - {pincode}</span>
                </div>
                <Button variant="ghost" size="sm" className="h-6 text-xs" onClick={()=>setStage('address')}>
                  <ChevronLeft className="h-3 w-3 mr-0.5"/>Edit
                </Button>
              </div>
              <div className="grid grid-cols-3 gap-2">
                {METHODS.map(m=>{
                  const Icon=m.icon;
                  return (
                    <button key={m.key}
                      onClick={()=>{setMethod(m.key);setQrExpired(false);}}
                      className={`flex flex-col items-center gap-1.5 p-3 rounded-xl border text-center transition-all ${
                        method ===m.key
                          ? 'border-green-500 bg-green-50 text-green-700'
                          : 'border-gray-200 hover:border-gray-300 text-gray-500'
                      }`}>
                      <Icon className={`h-5 w-5 ${method ===m.key ? 'text-green-600' :'text-gray-400'}`} />
                      <span className="text-xs font-semibold leading-tight">{m.label}</span>
                      <span className="text-[10px] text-gray-400 leading-tight hidden sm:block">{m.desc}</span>
                    </button>
                  );
                })}
              </div>
              {method ==='upi' &&(
                <div className="space-y-3">
                  <div className="flex gap-3">
                    <div ref={qrRef} className="relative shrink-0">
                      <div className={`p-2 rounded-xl border-2 bg-white transition-all ${qrExpired ? 'border-red-200 opacity-40 grayscale' : 'border-green-200'}`}>
                        <QRCodeCanvas value={upiString} size={110} level="H" fgColor="#111827"/>
                      </div>
                      {qrExpired && (
                        <button onClick={()=>setQrExpired(false)}
                          className="absolute inset-0 flex flex-col items-center justify-center gap-1 rounded-xl bg-black/5">
                          <RefreshCw className="h-5 w-5 text-gray-600" />
                          <span className="text-[10px] font-semibold text-gray-600">Refresh</span>
                        </button>
                      )}
                    </div>
                    <div className="flex-1 space-y-3">
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide">Amount</p>
                        <p className="text-xl font-bold text-gray-900">{formatPrice(finalAmount)}</p>
                      </div>
                      <div>
                        <p className="text-xs text-gray-400 font-medium uppercase tracking-wide mb-1">UPI ID</p>
                        <button onClick={copyUpi}
                          className="flex items-center gap-1.5 bg-gray-50 border border-gray-200 rounded-lg px-2.5 py-1.5 text-xs font-mono text-gray-700 hover:bg-gray-100 transition-colors w-full justify-between">
                          <span>{UPI_ID}</span>
                          {copied ? <CheckCheck className="h-3 w-3 text-green-600 shrink-0" />:<Copy className="h-3 w-3 text-gray-400 shrink-0" />}
                        </button>
                      </div>
                    </div>
                  </div>
                  <QrTimer key={String(qrExpired)} seconds={300} onExpire={()=>setQrExpired(true)} />
                  <div className="flex items-center gap-1 text-xs text-gray-400">
                    <ShieldCheck className="h-3.5 w-3.5 text-green-600"/>
                    <span>Secured by UPI -Amount:<strong className="text-foreground">{formatPrice(finalAmount)}</strong></span>
                  </div>
                </div>
              )}
              {method ==='card'&&(
                <div className="space-y-3">
                  <div className="bg-linear-to-br from-gray-800 to-gray-900 rounded-2xl p-4 text-white shadow-lg">
                    <div className="flex justify-between items-start mb-4">
                      <Leaf className="h-5 w-5 text-green-400" />
                      <p className="text-[10px] uppercase tracking-widest text-gray-400">Frutify Pay</p>
                    </div>
                    <p className="font-mono text-sm tracking-widest mb-3 text-gray-200">{cardNumber||'...  ...  ...  ...'}</p>
                    <div className="flex justify-between items-end text-xs">
                      <div>
                        <p className="text-gray-400 uppercase tracking-wide text-[9px]">Card Holder</p>
                        <p className="font-medium mt-0.5">{cardName||'YOUR NAME'}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-gray-400 uppercase tracking-wide text-[9px]">Expires</p>
                        <p className="font-medium mt-0.5">{expiry||'MM/YY'}</p>
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Card Number</Label>
                    <Input placeholder="1234 5678 9012 3456" value={cardNumber}
                      onChange={e=>setCardNumber(fmtCard(e.target.value))} className="font-mono tracking-wide rounded-lg"/>
                  </div>
                  <div className="space-y-1.5">
                    <Label className="text-xs">Name on Card</Label>
                    <Input placeholder="Full name" value={cardName}
                      onChange={e=>setCardName(e.target.value)} className="rounded-lg" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1.5">
                      <Label className="text-xs">Expiry</Label>
                      <Input placeholder="MM/YY" value={expiry} maxLength={5}
                        onChange={e=>setExpiry(fmtExpiry(e.target.value))} className="rounded-lg"/>
                    </div>
                    <div className="space-y-1.5">
                      <Label className="text-xs">CVV</Label>
                      <Input type="password" placeholder="..." value={cvv} maxLength={3}
                        onChange={e=>setCvv(e.target.value.replace(/\D/g,'').slice(0,3))} className="rounded-lg" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-gray-400">
                    <Shield className="h-3.5 w-3.5 text-green-500 shrink-0" />
                    256-bit SSL encrypted and 3D Secure protected
                  </div>
                </div>
              )}
              {method === 'cod'&&(
                <div className="flex items-start gap-2 bg-amber-50 border border-amber-200 rounded-xl p-3">
                  <Banknote className="h-5 w-5 text-amber-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="text-sm font-semibold text-amber-800">Cash on Delivery</p>
                    <p className="text-xs text-amber-700 mt-0.5">Keep<strong>{formatPrice(finalAmount)}</strong>ready when your order arrives.</p>
                  </div>
                </div>
              )}
              <OrderSummary cartProducts={cartProducts} subtotal={subtotal} discount={discount} label="Total" />
              <div className="flex gap-2">
                <Button variant="outline" className="rounded-full" onClick={()=>setStage('address')}>
                  <ChevronLeft className="h-4 w-4 mr-1" />Back
                </Button>
                <Button className="flex-1 rounded-full bg-green-600 hover:bg-green-700 text-white"
                  disabled={!canPay} onClick={handlePay}>
                  {method ==='card'&&`Pay ${formatPrice(finalAmount)}`}
                  {method ==='upi'&&`I've Completed Payment`}
                  {method ==='cod'&&`Place Order ${formatPrice(finalAmount)}`}
                </Button>
              </div>
            </div>
          </>
        )}
        {stage === 'processing' &&(
          <div className="flex flex-col items-center justify-center py-12 gap-4">
            <Loader2 className="h-12 w-12 text-primary animate-spin"/>
            <p className="text-lg font-heading font-semibold">Processing Order...</p>
            <p className="text-sm text-muted-foreground">Please wait while we confirm your order.</p>
          </div>
        )}
        {stage ==='success'&&(
          <div className="flex flex-col items-center py-6 gap-4">
            <div className="w-20 h-20 rounded-full bg-primary/10 flex items-center justify-center">
              <Check className="h-10 w-10 text-primary" />
            </div>
            <h3 className="font-heading text-xl font-bold">
              {paidMethod ==='cod' ?'Order Placed!':'Payment Successful!'}
            </h3>
            <div className="text-center space-y-1 text-sm text-muted-foreground">
              <p>Transaction ID: <span className="font-mono font-medium text-foreground">{txnId}</span></p>
              <p>Method:{paidMethod ==='card' ?'Credit Card' :paidMethod ==='upi' ?'UPI (QR)':'Cash on Delivery'}</p>
              <p>{new Date().toLocaleString()}</p>
            </div>
            <div className="w-full bg-muted/50 rounded-lg p-3 text-xs space-y-1">
              <div className="flex items-center gap-1.5 font-medium">
                <Truck className="h-3.5 w-3.5 text-primary"/>Delivering to
              </div>
              <p>{name}-{phone}</p>
              <p className="text-muted-foreground">{address},{city} -{pincode}</p>
            </div>
            <OrderSummary cartProducts={snapCart} subtotal={snapSubtotal} discount={snapDiscount} label="Total Paid" />
            <div className="flex gap-2 w-full">
              <Button variant="outline" className="flex-1 rounded-full" onClick={printReceipt}>
                <Printer className="h-4 w-4 mr-1" />Print
              </Button>
              <Button variant="outline" className="flex-1 rounded-full" onClick={downloadReceipt}>
                <Download className="h-4 w-4 mr-1" />Download
              </Button>
              {email &&(
                <Button variant="outline" className="flex-1 rounded-full" onClick={emailReceipt}>
                  <Mail className="h-4 w-4 mr-1"/>Email
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