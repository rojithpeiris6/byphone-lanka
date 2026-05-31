import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle2 } from "lucide-react";
import { toast } from "sonner";
import { sendContactMessage } from "@/lib/api/contact.functions";

export const Route = createFileRoute("/contact")({
  head: () => ({
    meta: [
      { title: "Contact Us — byphone.lk" },
      { name: "description", content: "Get in touch with byphone.lk. We're here to help you with any questions about our products or orders." },
    ],
  }),
  component: ContactPage,
});

function ContactPage() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [form, setForm] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const result = await sendContactMessage({ data: form });
      toast.success(result.message);
      setIsSubmitted(true);
      setForm({ name: "", email: "", subject: "", message: "" });
    } catch (error: any) {
      toast.error(error.message || "Something went wrong. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-7xl px-4 py-12">
      <div className="text-center mb-16">
        <h1 className="text-3xl sm:text-5xl font-extrabold tracking-tight">Contact Us</h1>
        <p className="mt-4 text-muted-foreground max-w-xl mx-auto">
          Have a question about a product, an order, or just want to say hello? We'd love to hear from you.
        </p>
      </div>

      <div className="grid lg:grid-cols-2 gap-12">
        {/* Contact Info */}
        <div className="space-y-8">
          <div className="bg-primary-soft rounded-3xl p-8 border border-primary/10">
            <h2 className="text-2xl font-bold mb-6">Get in Touch</h2>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-white text-primary grid place-items-center shadow-sm">
                  <Mail className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Email Us</p>
                  <p className="text-lg font-semibold">support@byphone.lk</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-white text-primary grid place-items-center shadow-sm">
                  <Phone className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Call Us</p>
                  <p className="text-lg font-semibold">+94 11 234 5678</p>
                </div>
              </div>
              <div className="flex items-start gap-4">
                <div className="size-12 rounded-2xl bg-white text-primary grid place-items-center shadow-sm">
                  <MapPin className="size-6" />
                </div>
                <div>
                  <p className="text-sm font-bold uppercase tracking-wide text-muted-foreground">Visit Store</p>
                  <p className="text-lg font-semibold">123 Tech Lane, Colombo 03, Sri Lanka</p>
                </div>
              </div>
            </div>
          </div>

          <div className="rounded-3xl border border-border bg-card p-8">
            <h3 className="text-xl font-bold mb-4">Business Hours</h3>
            <div className="space-y-3 text-sm">
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Monday - Friday</span>
                <span className="font-semibold">9:00 AM - 8:00 PM</span>
              </div>
              <div className="flex justify-between py-2 border-b border-border">
                <span className="text-muted-foreground">Saturday</span>
                <span className="font-semibold">10:00 AM - 6:00 PM</span>
              </div>
              <div className="flex justify-between py-2">
                <span className="text-muted-foreground">Sunday</span>
                <span className="font-semibold text-rose-500">Closed</span>
              </div>
            </div>
          </div>
        </div>

        {/* Contact Form */}
        <div className="bg-card border border-border rounded-3xl p-8 shadow-sm">
          {isSubmitted ? (
            <div className="h-full flex flex-col items-center justify-center text-center py-12 space-y-4">
              <div className="size-20 rounded-full bg-emerald-100 text-emerald-600 grid place-items-center">
                <CheckCircle2 className="size-10" />
              </div>
              <h3 className="text-2xl font-bold">Message Sent!</h3>
              <p className="text-muted-foreground">Thank you for reaching out. We'll get back to you as soon as possible.</p>
              <button 
                onClick={() => setIsSubmitted(false)} 
                className="mt-4 text-primary font-bold hover:underline"
              >
                Send another message
              </button>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-5">
              <div className="grid sm:grid-cols-2 gap-5">
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Name *</label>
                  <input 
                    required
                    value={form.name} 
                    onChange={(e) => setForm(f => ({ ...f, name: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-primary outline-none transition-all" 
                    placeholder="John Doe"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-semibold">Email *</label>
                  <input 
                    required
                    type="email"
                    value={form.email} 
                    onChange={(e) => setForm(f => ({ ...f, email: e.target.value }))}
                    className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-primary outline-none transition-all" 
                    placeholder="john@example.com"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Subject *</label>
                <input 
                  required
                  value={form.subject} 
                  onChange={(e) => setForm(f => ({ ...f, subject: e.target.value }))}
                  className="w-full h-11 px-4 rounded-xl border border-border bg-background focus:border-primary outline-none transition-all" 
                  placeholder="How can we help?"
                />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-semibold">Message *</label>
                <textarea 
                  required
                  rows={5}
                  value={form.message} 
                  onChange={(e) => setForm(f => ({ ...f, message: e.target.value }))}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background focus:border-primary outline-none transition-all resize-none" 
                  placeholder="Your message here..."
                />
              </div>
              <button 
                disabled={isSubmitting}
                className="w-full h-12 bg-primary text-primary-foreground rounded-xl font-bold hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <Loader2 className="size-5 animate-spin" />
                ) : (
                  <>
                    Send Message <Send className="size-4" />
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>
  );
}