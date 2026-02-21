import { useState, useRef, useEffect } from 'react';
import { MessageCircle, X, Send, Bot, User } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { useAuth } from '@/contexts/AuthContext';
import { useProducts } from '@/contexts/ProductContext';

const greetings = [
  "Hi there! I'm FreshVeg Assistant. How can I help you today?",
  "You can ask me about products, orders, categories, or anything else!",
];

function getBotReply(msg, isAdmin, products) {
  const lower = msg.toLowerCase();

  if (lower.includes('hello') || lower.includes('hi') || lower.includes('hey'))
    return "Hello! How can I help you today? Ask me about products, prices, categories, or orders.";

  if (lower.includes('price') || lower.includes('cost')) {
    const match = products.find(p => lower.includes(p.name.toLowerCase()));
    if (match) return `${match.name} is priced at $${match.price.toFixed(2)}.`;
    return "Which product are you interested in? I can share the price details.";
  }

  if (lower.includes('stock') || lower.includes('available')) {
    const match = products.find(p => lower.includes(p.name.toLowerCase()));
    if (match) return `${match.name} has ${match.stock} units in stock.`;
    if (isAdmin) {
      const low = products.filter(p => p.stock <= 5);
      return low.length > 0
        ? `Low stock items: ${low.map(p => `${p.name} (${p.stock})`).join(', ')}`
        : "All products have good stock levels!";
    }
    return "Tell me the product name and I'll check availability for you.";
  }

  if (lower.includes('categor')) {
    const cats = [...new Set(products.map(p => p.category))];
    return `We have these categories: ${cats.join(', ')}. Browse them on the products page!`;
  }

  if (lower.includes('organic'))
    return `We have ${products.filter(p => p.organic).length} organic products. Use the organic filter on the products page!`;

  if (lower.includes('order') || lower.includes('delivery'))
    return "You can view your orders on the Order History page. We offer free delivery on all orders!";

  if (lower.includes('discount') || lower.includes('offer') || lower.includes('sale'))
    return `Currently ${products.filter(p => p.discount > 0).length} products are on sale. Check them out on the products page!`;

  if (isAdmin && (lower.includes('revenue') || lower.includes('total') || lower.includes('analytics')))
    return `Quick stats: ${products.length} products, total inventory value $${products.reduce((s, p) => s + p.price * p.stock, 0).toFixed(2)}, ${products.filter(p => p.stock <= 5).length} low-stock alerts.`;

  if (lower.includes('help'))
    return "I can help with:\n• Product info & prices\n• Stock availability\n• Categories\n• Order tracking\n• Discounts & offers" + (isAdmin ? "\n• Revenue & analytics" : "");

  return "I'm not sure about that. Try asking about products, prices, categories, or orders! Type 'help' for a list of topics.";
}

export default function Chatbot() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState([
    { id: 1, role: 'bot', text: greetings[0] },
    { id: 2, role: 'bot', text: greetings[1] },
  ]);
  const [input, setInput] = useState('');
  const scrollRef = useRef(null);
  const { user } = useAuth();
  const { products } = useProducts();

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: 'smooth' });
  }, [messages]);

  const send = () => {
    if (!input.trim()) return;
    const userMsg = { id: Date.now(), role: 'user', text: input.trim() };
    setMessages(prev => [...prev, userMsg]);
    setInput('');

    setTimeout(() => {
      const reply = getBotReply(userMsg.text, !!user?.isAdmin, products);
      setMessages(prev => [...prev, { id: Date.now(), role: 'bot', text: reply }]);
    }, 500);
  };

  return (
    <>
      {/* FAB */}
      <button
        onClick={() => setOpen(!open)}
        className="fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-primary text-primary-foreground shadow-lg hover:shadow-xl flex items-center justify-center transition-all duration-300 hover:scale-105"
      >
        {open ? <X className="h-6 w-6" /> : <MessageCircle className="h-6 w-6" />}
      </button>

      {/* Chat Window */}
      {open && (
        <div className="fixed bottom-24 right-6 z-50 w-87.5 max-h-125 rounded-2xl border bg-card shadow-2xl flex flex-col overflow-hidden animate-fade-in">
          {/* Header */}
          <div className="bg-primary text-primary-foreground px-4 py-3 flex items-center gap-3">
            <Bot className="h-6 w-6" />
            <div>
              <p className="font-heading font-semibold text-sm">FreshVeg Assistant</p>
              <p className="text-xs opacity-80">{user?.isAdmin ? 'Admin Mode' : 'Online'}</p>
            </div>
          </div>

          {/* Messages */}
          <div ref={scrollRef} className="flex-1 overflow-y-auto p-3 space-y-3 min-h-75">
            {messages.map(m => (
              <div key={m.id} className={`flex gap-2 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                {m.role === 'bot' && (
                  <div className="w-7 h-7 rounded-full bg-primary/10 flex items-center justify-center shrink-0">
                    <Bot className="h-4 w-4 text-primary" />
                  </div>
                )}
                <div className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm whitespace-pre-line ${
                  m.role === 'user'
                    ? 'bg-primary text-primary-foreground rounded-br-md'
                    : 'bg-muted text-foreground rounded-bl-md'
                }`}>
                  {m.text}
                </div>
                {m.role === 'user' && (
                  <div className="w-7 h-7 rounded-full bg-secondary/10 flex items-center justify-center shrink-0">
                    <User className="h-4 w-4 text-secondary" />
                  </div>
                )}
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t p-3 flex gap-2">
            <Input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && send()}
              placeholder="Type a message..."
              className="rounded-full text-sm"
            />
            <Button size="icon" className="rounded-full shrink-0" onClick={send} disabled={!input.trim()}>
              <Send className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </>
  );
}