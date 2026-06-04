import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { requestOtpFn, verifyOtpFn } from "@/lib/api/ideamart.functions";
import { toast } from "sonner";
import { Loader2, Smartphone, ShieldCheck } from "lucide-react";
import heroDefault from "@/assets/hero-phones.jpg";

export const Route = createFileRoute("/")({
  component: IndexPage,
});

function IndexPage() {
  const [phone, setPhone] = useState("");
  const [step, setStep] = useState<"REQUEST" | "VERIFY">("REQUEST");
  const [otpCode, setOtpCode] = useState("");
  const [otpRef, setOtpRef] = useState("");
  const [appId, setAppId] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (step === "REQUEST" && !phone.trim()) return;
    if (step === "VERIFY" && !otpCode.trim()) return;

    setIsSubmitting(true);
    try {
      if (step === "REQUEST") {
        const res = await requestOtpFn({ data: { subscriberId: phone } });
        if (res.success) {
          setOtpRef(res.referenceNo);
          setAppId(res.applicationId);
          setStep("VERIFY");
          toast.success("OTP sent to your phone");
        }
      } else {
        const res = await verifyOtpFn({
          data: {
            otp: otpCode,
            applicationId: appId,
            referenceNo: otpRef,
            phone: phone
          }
        });

        if (res.success) {
          toast.success("Successfully verified!");
          setPhone("");
          setOtpCode("");
          setStep("REQUEST");
        }
      }
    } catch (error: any) {
      toast.error(error.message || "Failed to process request");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <main className="min-h-[100dvh] w-full bg-primary flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-4xl bg-card border border-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col md:flex-row">

        {/* Left Side: Image */}
        <div className="w-full md:w-1/2 h-48 sm:h-64 md:h-auto relative bg-primary-soft">
          <img
            src={heroDefault}
            alt="Latest mobile phones"
            className="absolute inset-0 w-full h-full object-cover"
          />
          {/* Optional gradient overlay to make it look premium */}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent md:bg-gradient-to-r md:from-transparent md:to-black/20" />


        </div>

        {/* Right Side: Form */}
        <div className="w-full md:w-1/2 p-6 sm:p-10 lg:p-12 relative flex flex-col justify-center">
          {/* Background blobs for premium feel */}
          <div className="absolute -top-24 -right-24 size-48 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute -bottom-24 -left-24 size-48 bg-blue-500/5 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10 text-center md:text-left space-y-2 mb-8">

            <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight">
              {step === "REQUEST" ? "Mobile Phone Deals" : "Enter OTP Code"}
            </h1>
            <p className="text-sm text-muted-foreground leading-relaxed">
              {step === "REQUEST"
                ? "Get the latest mobile phone deals delivered straight to your phone."
                : `We've sent a 6-digit code to ${phone}`
              }
            </p>
          </div>

          <form onSubmit={handleSubmit} className="relative z-10 space-y-5">
            {step === "REQUEST" ? (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1 text-foreground/80">Mobile Number</label>
                  <input
                    type="tel"
                    required
                    maxLength={10}
                    placeholder="e.g. 0771234567"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full h-14 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-lg shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : "Continue"}
                </button>
              </div>
            ) : (
              <div className="space-y-5">
                <div className="space-y-2">
                  <label className="text-sm font-bold ml-1 text-foreground/80">6-Digit OTP</label>
                  <input
                    type="text"
                    required
                    maxLength={6}
                    placeholder="------"
                    value={otpCode}
                    onChange={(e) => setOtpCode(e.target.value.replace(/\D/g, '').slice(0, 6))}
                    className="w-full h-14 px-4 rounded-xl bg-background border border-input focus:border-primary focus:ring-2 focus:ring-primary/20 outline-none transition-all text-center tracking-[0.5em] text-2xl font-bold shadow-sm"
                  />
                </div>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="w-full h-14 bg-primary text-primary-foreground font-bold rounded-xl hover:bg-primary/90 transition-all active:scale-[0.98] shadow-lg shadow-primary/25 disabled:opacity-50 disabled:pointer-events-none flex items-center justify-center gap-2"
                >
                  {isSubmitting ? <Loader2 className="size-5 animate-spin" /> : "Verify & Subscribe"}
                </button>

                <div className="flex items-center justify-between pt-2">
                  <button
                    type="button"
                    onClick={() => setStep("REQUEST")}
                    className="text-sm text-muted-foreground hover:text-foreground font-medium transition-colors"
                  >
                    Change Number
                  </button>
                  <button
                    type="button"
                    disabled={isSubmitting}
                    onClick={async () => {
                      setIsSubmitting(true);
                      try {
                        const res = await requestOtpFn({ data: { subscriberId: phone } });
                        if (res.success) {
                          setOtpRef(res.referenceNo);
                          setAppId(res.applicationId);
                          toast.success("OTP resent successfully");
                        }
                      } catch (error: any) {
                        toast.error(error.message || "Failed to resend OTP");
                      } finally {
                        setIsSubmitting(false);
                      }
                    }}
                    className="text-sm text-primary hover:text-primary/80 font-bold transition-colors"
                  >
                    Resend OTP
                  </button>
                </div>
              </div>
            )}
          </form>

          <div className="mt-8 pt-6 border-t border-border/50 text-center md:text-left">
            <p className="text-xs text-muted-foreground leading-relaxed relative z-10">
              Rs 5+tax p/d. We respect your privacy.<br className="hidden md:block" /> You can unsubscribe at any time.
            </p>
          </div>
        </div>
      </div>
    </main>
  );
}
