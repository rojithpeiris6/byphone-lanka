"use client";

import React, { useState } from 'react';
import { X, Mail, Lock, User, Phone, ArrowRight, Loader2 } from 'lucide-react';
import { useAuth } from '@/lib/auth';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useNavigate } from '@tanstack/react-router';
import { cn } from '@/lib/utils';

type AuthMode = 'login' | 'register';

export function AuthModal({ open, onOpenChange }: { open: boolean; onOpenChange: (open: boolean) => void }) {
  const navigate = useNavigate();
  const { user, signIn, signUp } = useAuth();
  const [mode, setMode] = useState<AuthMode>('login');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  
  const [form, setForm] = useState({
    email: '',
    password: '',
    fullName: '',
    phone: '',
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setForm(prev => ({ ...prev, [e.target.name]: e.target.value }));
  };

  async function handleLogin(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    const result = await signIn(form.email, form.password);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Welcome back!");
      onOpenChange(false);
      navigate({ to: '/account' });
    }
  }

  async function handleRegisterStep1(e: React.FormEvent) {
    e.preventDefault();
    if (!form.fullName || !form.email || !form.password) {
      toast.error("Please fill in all required fields");
      return;
    }
    setStep(2);
  }

  async function handleRegisterStep2(e: React.FormEvent) {
    e.preventDefault();
    if (!form.phone) {
      toast.error("Phone number is required to complete your account");
      return;
    }
    setLoading(true);
    const result = await signUp(form.email, form.password, form.fullName, form.phone);
    setLoading(false);
    if (result.error) {
      toast.error(result.error);
    } else {
      toast.success("Account created successfully!");
      onOpenChange(false);
      navigate({ to: '/account' });
    }
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md p-0 overflow-hidden border-none rounded-3xl">
        <div className="p-6 sm:p-8">
          <DialogHeader className="text-left mb-8">
            <DialogTitle className="text-2xl font-extrabold tracking-tight">
              {mode === 'login' ? 'Welcome Back' : step === 1 ? 'Create Account' : 'Complete Profile'}
            </DialogTitle>
            <p className="text-sm text-muted-foreground">
              {mode === 'login' 
                ? 'Sign in to access your account' 
                : step === 1 
                  ? 'Join buyphone.lk for a better shopping experience' 
                  : 'Almost there! Just one more detail.'}
            </p>
          </DialogHeader>

          {mode === 'login' ? (
            <form onSubmit={handleLogin} className="space-y-4">
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    name="email" type="email" required value={form.email} onChange={handleInputChange}
                    placeholder="john@example.com"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Password</label>
                <div className="relative">
                  <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                  <input 
                    name="password" type="password" required value={form.password} onChange={handleInputChange}
                    placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                    className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                  />
                </div>
              </div>
              <button 
                disabled={loading}
                className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="size-4 animate-spin" /> : <>Sign In <ArrowRight className="size-4" /></>}
              </button>
            </form>
          ) : (
            <>
              {step === 1 ? (
                <form onSubmit={handleRegisterStep1} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Full Name</label>
                    <div className="relative">
                      <User className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        name="fullName" required value={form.fullName} onChange={handleInputChange}
                        placeholder="John Doe"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Email</label>
                    <div className="relative">
                      <Mail className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        name="email" type="email" required value={form.email} onChange={handleInputChange}
                        placeholder="john@example.com"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Password</label>
                    <div className="relative">
                      <Lock className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        name="password" type="password" required value={form.password} onChange={handleInputChange}
                        placeholder="â€¢â€¢â€¢â€¢â€¢â€¢â€¢â€¢"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <button 
                    className="w-full py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2"
                  >
                    Next <ArrowRight className="size-4" />
                  </button>
                </form>
              ) : (
                <form onSubmit={handleRegisterStep2} className="space-y-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold uppercase tracking-wider text-muted-foreground block">Phone Number</label>
                    <div className="relative">
                      <Phone className="absolute left-3 top-1/2 -translate-y-1/2 size-4 text-muted-foreground" />
                      <input 
                        name="phone" required value={form.phone} onChange={handleInputChange}
                        placeholder="07X XXX XXXX"
                        className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-border bg-background text-sm focus:ring-2 focus:ring-primary/20 focus:border-primary outline-none transition-all"
                      />
                    </div>
                  </div>
                  <div className="flex gap-3">
                    <button 
                      type="button"
                      onClick={() => setStep(1)}
                      className="flex-1 py-3 border border-border rounded-xl text-sm font-bold hover:bg-accent transition-all"
                    >
                      Back
                    </button>
                    <button 
                      disabled={loading}
                      className="flex-[2] py-3 bg-primary text-primary-foreground rounded-xl font-bold text-sm hover:bg-primary-dark transition-all flex items-center justify-center gap-2 disabled:opacity-50"
                    >
                      {loading ? <Loader2 className="size-4 animate-spin" /> : <>Complete Account <ArrowRight className="size-4" /></>}
                    </button>
                  </div>
                </form>
              )}
            </>
          )}

          <div className="mt-8 pt-6 border-t border-border text-center">
            <p className="text-sm text-muted-foreground">
              {mode === 'login' ? "Don't have an account?" : "Already have an account?"}
              <button 
                onClick={() => {
                  setMode(mode === 'login' ? 'register' : 'login');
                  setStep(1);
                }}
                className="ml-1 text-primary font-bold hover:underline"
              >
                {mode === 'login' ? 'Create one' : 'Sign in'}
              </button>
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}