import {useState,useMemo,useEffect} from "react";
import {Navigate,useSearchParams} from "react-router-dom";
import {useAuth} from "../contexts/AuthContext";
import {Sprout,PackagePlus,ClipboardList,CheckCircle2,Clock,XCircle,Send,Loader2,Apple,Leaf,Citrus,Banana,Cherry,Carrot,Flower2
} from "lucide-react";
import {toast} from "sonner";

const STORAGE_KEY="frutify_farmer_requests";
const CATEGORIES =[
  {label:"Citrus Fruits",icon:Citrus},
  {label:"Tropical Fruits",icon:Banana},
  {label:"Berries",icon:Cherry},
  {label:"Stone Fruits",icon:Apple},
  {label:"Leafy Greens",icon:Leaf},
  {label:"Root Vegetables",icon:Carrot},
  {label:"Gourds",icon:Sprout},
  {label:"Cruciferous",icon:Flower2},
];

const STATUS_CONFIG = {
  pending:{label:"Pending",icon:Clock,badge:"bg-amber-50 text-amber-700 border-amber-200",dot:"bg-amber-400"},
  approved:{label:"Approved",icon:CheckCircle2,badge:"bg-emerald-50 text-emerald-700 border-emerald-200",dot:"bg-emerald-500"},
  rejected:{label:"Rejected",icon:XCircle,badge:"bg-red-50 text-red-600 border-red-200",dot:"bg-red-400"},
};

function loadRequests(){
  try { return JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]"); }
  catch { return []; }
}

function saveRequests(reqs) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(reqs));
}

const EMPTY_FORM = { productName: "", category: "", type: "fruit", quantity: "", pricePerUnit: "" };

export default function FarmerDashboard() {
  const { user } = useAuth();
  const [searchParams, setSearchParams] = useSearchParams();
  const [requests, setRequests]   = useState(loadRequests);
  const [form, setForm]           = useState(EMPTY_FORM);
  const [submitting, setSubmitting] = useState(false);

  const activeTab = searchParams.get("tab") || "sell";
  useEffect(() => {
    const onStorage = () => setRequests(loadRequests());
    window.addEventListener("storage", onStorage);
    return () => window.removeEventListener("storage", onStorage);
  }, []);

  const myRequests = useMemo(
    () => requests.filter(r => r.farmerName === user?.username).sort((a, b) => b.submittedAt - a.submittedAt),
    [requests, user?.username]
  );

  const stats = useMemo(() => {
    const pending  = myRequests.filter(r => r.status === "pending").length;
    const approved = myRequests.filter(r => r.status === "approved").length;
    const earnings = myRequests
      .filter(r => r.status === "approved")
      .reduce((sum, r) => sum + r.quantity * r.pricePerUnit, 0);
    return { total: myRequests.length, pending, approved, earnings };
  }, [myRequests]);
  if (user?.role !== "farmer") return <Navigate to="/" replace />;
  const setTab = (tab) => setSearchParams({ tab }, { replace: true });

  const handleChange = (e) =>
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));

  const handleSubmit = (e) => {
    e.preventDefault();
    const { productName, category, type, quantity, pricePerUnit } = form;
    if (!productName.trim() || !category || !quantity || !pricePerUnit) {
      toast.error("Please fill all fields.");
      return;
    }
    const qty = Number(quantity);
    const price = Number(pricePerUnit);
    if (qty <= 0 || price <= 0) {
      toast.error("Quantity and price must be positive.");
      return;
    }

    setSubmitting(true);
    setTimeout(() => {
      const newReq = {
        id: `FR-${Date.now()}`,
        farmerName: user.username,
        productName: productName.trim(),
        category,
        type,
        quantity: qty,
        pricePerUnit: price,
        status: "pending",
        submittedAt: Date.now(),
      };
      const updated = [...loadRequests(), newReq];
      saveRequests(updated);
      setRequests(updated);
      setForm(EMPTY_FORM);
      setSubmitting(false);
      toast.success("Supply request submitted!", {
        description: `${productName} · ${qty} kg @ ₹${price}/kg`,
      });
      setTab("requests");
    }, 600);
  };

  const catObj   = CATEGORIES.find(c => c.label === form.category);
  const hasTotal = form.quantity && form.pricePerUnit;
  const estTotal = hasTotal ? Number(form.quantity) * Number(form.pricePerUnit) : 0;

  return (
    <div className="min-h-full bg-gray-50/60">
      <div className="bg-white border-b border-gray-100 px-6 py-5">
        <div className="flex items-center justify-between flex-wrap gap-4">
          <div className="flex items-center gap-4">
            <div className="w-12 h-12 rounded-2xl bg-lime-500 flex items-center justify-center shadow-md shadow-lime-200">
              <Sprout className="h-6 w-6 text-white" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-gray-900 leading-none">Farmer Portal</h1>
              <p className="text-sm text-gray-400 mt-0.5">Welcome back, <span className="font-semibold text-lime-600">{user?.username}</span></p>
            </div>
          </div>
          <div className="flex items-center gap-6">
            {[
              { label: "Total", value: stats.total,    color: "text-gray-900" },
              { label: "Pending",  value: stats.pending,  color: "text-amber-500" },
              { label: "Approved", value: stats.approved, color: "text-emerald-600" },
            ].map((s, i) => (
              <div key={i} className="text-center">
                <p className={`text-xl font-extrabold leading-none ${s.color}`}>{s.value}</p>
                <p className="text-[11px] text-gray-400 mt-0.5 font-medium">{s.label}</p>
              </div>
            ))}
            <div className="w-px h-8 bg-gray-100" />
            <div className="text-center">
              <p className="text-xl font-extrabold leading-none text-lime-600">₹{stats.earnings.toLocaleString("en-IN")}</p>
              <p className="text-[11px] text-gray-400 mt-0.5 font-medium">Earnings</p>
            </div>
          </div>
        </div>
        <div className="flex gap-0 mt-5 border-b border-gray-100 -mb-px">
          {[
            { key: "sell",     label: "Sell Produce", icon: PackagePlus  },
            { key: "requests", label: "My Requests",  icon: ClipboardList },
          ].map(t => (
            <button key={t.key} onClick={() => setTab(t.key)}
              className={`flex items-center gap-2 px-5 py-2.5 text-sm font-semibold border-b-2 transition-all -mb-px ${
                activeTab === t.key
                  ? "border-lime-500 text-lime-600"
                  : "border-transparent text-gray-400 hover:text-gray-700"
              }`}>
              <t.icon className="h-4 w-4 shrink-0" />
              {t.label}
              {t.key === "requests" && myRequests.length > 0 && (
                <span className="ml-1 px-1.5 py-0.5 text-[10px] font-bold bg-gray-100 text-gray-500 rounded-full">{myRequests.length}</span>
              )}
            </button>
          ))}
        </div>
      </div>
      {activeTab === "sell" && (
        <div className="p-6">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 max-w-5xl">
            <div className="lg:col-span-3 bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
              <div className="px-6 py-4 border-b border-gray-50 bg-gray-50/50">
                <h2 className="text-sm font-bold text-gray-800">New Supply Request</h2>
                <p className="text-xs text-gray-400 mt-0.5">Tell the warehouse what you have available to sell.</p>
              </div>

              <form onSubmit={handleSubmit} className="p-6 space-y-5">
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Product Name</label>
                  <input name="productName" value={form.productName} onChange={handleChange}
                    placeholder="e.g. Alphonso Mango"
                    className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition" />
                </div>

                {/* Type toggle */}
                <div className="space-y-1.5">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Type</label>
                  <div className="grid grid-cols-2 gap-2 p-1 bg-gray-100 rounded-xl">
                    {[{value:"fruit",label:"Fruit",Icon:Apple},{value:"vegetable",label:"Vegetable",Icon:Leaf}].map(({value,label,Icon}) => (
                      <button type="button" key={value}
                        onClick={() => setForm(prev => ({ ...prev, type: value }))}
                        className={`flex items-center justify-center gap-2 py-2 rounded-lg text-sm font-semibold transition-all ${
                          form.type === value
                            ? "bg-white text-lime-700 shadow-sm"
                            : "text-gray-400 hover:text-gray-600"
                        }`}>
                        <Icon className="h-3.5 w-3.5 shrink-0" />
                        {label}
                      </button>
                    ))}
                  </div>
                </div>
                <div className="space-y-2">
                  <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Category</label>
                  <div className="flex flex-wrap gap-2">
                    {CATEGORIES.map(({ label, icon: Icon }) => {
                      const sel = form.category === label;
                      return (
                        <button type="button" key={label}
                          onClick={() => setForm(prev => ({ ...prev, category: label }))}
                          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-xs font-semibold border transition-all ${
                            sel
                              ? "bg-lime-500 border-lime-500 text-white shadow-sm"
                              : "bg-white border-gray-200 text-gray-500 hover:border-gray-300 hover:bg-gray-50"
                          }`}>
                          <Icon className="h-3.5 w-3.5 shrink-0" />
                          {label}
                        </button>
                      );
                    })}
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Qty (kg)</label>
                    <input name="quantity" type="number" min={1} value={form.quantity} onChange={handleChange}
                      placeholder="100"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition" />
                  </div>
                  <div className="space-y-1.5">
                    <label className="text-xs font-bold text-gray-500 uppercase tracking-widest">Price / kg (₹)</label>
                    <input name="pricePerUnit" type="number" min={1} value={form.pricePerUnit} onChange={handleChange}
                      placeholder="80"
                      className="w-full border border-gray-200 rounded-xl px-4 py-2.5 text-sm font-medium placeholder:text-gray-300 focus:outline-none focus:ring-2 focus:ring-lime-400/30 focus:border-lime-400 transition" />
                  </div>
                </div>

                <button type="submit" disabled={submitting}
                  className="w-full flex items-center justify-center gap-2 bg-lime-500 hover:bg-lime-600 active:scale-[0.98] disabled:opacity-50 text-white font-bold py-3 rounded-xl text-sm transition-all shadow-md shadow-lime-200">
                  {submitting
                    ? <><Loader2 className="h-4 w-4 animate-spin" /> Submitting…</>
                    : <><Send className="h-4 w-4" /> Submit Request</>}
                </button>
              </form>
            </div>

            <div className="lg:col-span-2 space-y-4">
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden">
                <div className="px-5 py-4 border-b border-gray-50 bg-gray-50/50">
                  <p className="text-xs font-bold text-gray-500 uppercase tracking-widest">Request Preview</p>
                </div>
                <div className="p-5 space-y-3">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-xl bg-lime-50 flex items-center justify-center shrink-0">
                      {catObj
                        ? <catObj.icon className="h-5 w-5 text-lime-600" />
                        : <Sprout className="h-5 w-5 text-lime-300" />}
                    </div>
                    <div className="min-w-0">
                      <p className="text-sm font-bold text-gray-900 truncate">{form.productName || <span className="text-gray-300 font-normal">Product name…</span>}</p>
                      <p className="text-xs text-gray-400 capitalize">{form.type} {form.category && `· ${form.category}`}</p>
                    </div>
                  </div>
                  <div className="h-px bg-gray-50" />
                  <div className="space-y-2">
                    {[
                      { label: "Quantity",   value: form.quantity    ? `${form.quantity} kg`   : "—" },
                      { label: "Rate",       value: form.pricePerUnit ? `₹${form.pricePerUnit}/kg` : "—" },
                    ].map(row => (
                      <div key={row.label} className="flex items-center justify-between text-sm">
                        <span className="text-gray-400">{row.label}</span>
                        <span className="font-semibold text-gray-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                  {hasTotal && (
                    <>
                      <div className="h-px bg-gray-100" />
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-bold text-gray-700">Total Value</span>
                        <span className="text-lg font-extrabold text-lime-600">₹{estTotal.toLocaleString("en-IN")}</span>
                      </div>
                    </>
                  )}
                </div>
              </div>

            </div>
          </div>
        </div>
      )}
      {activeTab === "requests" && (
        <div className="p-6">
          <div className="flex items-center justify-between mb-5">
            <div>
              <h2 className="text-sm font-bold text-gray-800">My Supply Requests</h2>
              <p className="text-xs text-gray-400 mt-0.5">{myRequests.length} total · {stats.pending} pending</p>
            </div>
            <button onClick={() => setTab("sell")}
              className="flex items-center gap-2 px-4 py-2 bg-lime-500 text-white text-xs font-bold rounded-xl hover:bg-lime-600 transition-colors shadow-sm shadow-lime-200">
              <PackagePlus className="h-3.5 w-3.5" />
              New Request
            </button>
          </div>

          {myRequests.length === 0 ? (
            <div className="bg-white rounded-2xl border border-gray-100 flex flex-col items-center justify-center py-20 gap-3 text-gray-400">
              <div className="w-14 h-14 rounded-2xl bg-gray-50 flex items-center justify-center">
                <Sprout className="h-7 w-7 text-gray-200" />
              </div>
              <p className="text-sm font-semibold text-gray-500">No requests yet</p>
              <p className="text-xs text-gray-400">Submit your first supply request to get started.</p>
              <button onClick={() => setTab("sell")}
                className="mt-1 px-5 py-2 bg-lime-500 text-white text-xs font-bold rounded-xl hover:bg-lime-600 transition-colors">
                Sell Produce
              </button>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
              {myRequests.map(req => {
                const sc      = STATUS_CONFIG[req.status] || STATUS_CONFIG.pending;
                const cat     = CATEGORIES.find(c => c.label === req.category);
                const CatIcon = cat?.icon || Sprout;
                const total   = req.quantity * req.pricePerUnit;
                return (
                  <div key={req.id} className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-shadow overflow-hidden">
                    <div className="px-4 pt-4 pb-3 flex items-start gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gray-50 flex items-center justify-center shrink-0">
                        <CatIcon className="h-5 w-5 text-gray-400" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-gray-900 truncate">{req.productName}</p>
                        <p className="text-xs text-gray-400 capitalize">{req.type} · {req.category}</p>
                      </div>
                      <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-bold border shrink-0 ${sc.badge}`}>
                        <sc.icon className="h-3 w-3" />
                        {sc.label}
                      </span>
                    </div>
                    <div className="px-4 pb-4 border-t border-gray-50 pt-3 grid grid-cols-3 gap-2">
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Qty</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">{req.quantity} kg</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Rate</p>
                        <p className="text-sm font-bold text-gray-800 mt-0.5">₹{req.pricePerUnit}</p>
                      </div>
                      <div>
                        <p className="text-[10px] text-gray-400 font-medium uppercase tracking-wide">Total</p>
                        <p className="text-sm font-bold text-lime-600 mt-0.5">₹{total.toLocaleString("en-IN")}</p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
  