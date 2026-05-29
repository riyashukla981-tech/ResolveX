// src/pages/LandingPage.tsx
import React from 'react';
import { useNavigate } from 'react-router-dom';
import {
  ShieldCheck, ArrowRight, CheckCircle, Clock, BarChart2,
  MessageSquare, Eye, Building2, BookOpen, Home, Utensils, Wrench
} from 'lucide-react';
import { Button } from '@/components/ui';
import { useAuth } from '@/hooks/useAuth';

const FEATURES = [
  { icon: <MessageSquare className="w-6 h-6" />, title: 'Easy Submission', desc: 'Submit complaints in minutes with detailed descriptions and optional image attachments.' },
  { icon: <Clock className="w-6 h-6" />, title: 'Real-time Tracking', desc: 'Track your complaint status from submission to resolution with live updates.' },
  { icon: <Eye className="w-6 h-6" />, title: 'Anonymous Option', desc: 'Submit complaints anonymously when privacy is a concern. Your identity stays protected.' },
  { icon: <BarChart2 className="w-6 h-6" />, title: 'Admin Analytics', desc: 'Administrators get insightful dashboards to monitor and resolve issues efficiently.' },
  { icon: <Building2 className="w-6 h-6" />, title: 'Department Routing', desc: 'Complaints are routed to the right department for faster resolution.' },
  { icon: <CheckCircle className="w-6 h-6" />, title: 'Audit Trail', desc: 'Full history of every status change and remark for transparency.' },
];

const CATEGORIES = [
  { icon: <Wrench className="w-5 h-5" />, label: 'Infrastructure', color: 'bg-purple-50 text-purple-600' },
  { icon: <BookOpen className="w-5 h-5" />, label: 'Academic', color: 'bg-blue-50 text-blue-600' },
  { icon: <Home className="w-5 h-5" />, label: 'Hostel', color: 'bg-pink-50 text-pink-600' },
  { icon: <Utensils className="w-5 h-5" />, label: 'Canteen', color: 'bg-amber-50 text-amber-600' },
];

const STEPS = [
  { n: '01', title: 'Sign Up', desc: 'Create your student account in seconds.' },
  { n: '02', title: 'Submit', desc: 'Describe your issue and choose a category.' },
  { n: '03', title: 'Track', desc: 'Monitor real-time status updates.' },
  { n: '04', title: 'Resolved', desc: 'Get notified when your complaint is resolved.' },
];

export const LandingPage: React.FC = () => {
  const navigate = useNavigate();
  const { isAuthenticated, user } = useAuth();

  const handleCTA = () => {
    if (isAuthenticated) {
      navigate(user?.role === 'admin' ? '/admin' : '/dashboard');
    } else {
      navigate('/register');
    }
  };

  return (
    <div className="min-h-screen bg-white font-sans">
      {/* Navbar */}
      <header className="sticky top-0 z-40 bg-white/90 backdrop-blur border-b border-gray-100">
        <div className="max-w-6xl mx-auto px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-primary-600 to-teal-500 flex items-center justify-center">
              <ShieldCheck className="w-4.5 h-4.5 text-white" />
            </div>
            <span className="text-xl font-bold">
              <span className="text-primary-800">Resolve</span>
              <span className="text-teal-500">X</span>
            </span>
          </div>
          <div className="flex items-center gap-3">
            {isAuthenticated ? (
              <Button onClick={() => navigate(user?.role === 'admin' ? '/admin' : '/dashboard')}>
                Go to Dashboard <ArrowRight className="w-4 h-4" />
              </Button>
            ) : (
              <>
                <Button variant="ghost" onClick={() => navigate('/login')}>Sign In</Button>
                <Button onClick={() => navigate('/register')}>Get Started</Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* Hero */}
      <section className="relative overflow-hidden bg-gradient-to-br from-primary-900 via-primary-800 to-primary-700 text-white">
        <div className="absolute inset-0 opacity-10"
          style={{ backgroundImage: 'radial-gradient(circle at 20% 50%, #14B8A6 0%, transparent 50%), radial-gradient(circle at 80% 20%, #3B82F6 0%, transparent 40%)' }} />
        <div className="relative max-w-6xl mx-auto px-6 py-24 lg:py-32">
          <div className="max-w-2xl">
            <div className="inline-flex items-center gap-2 bg-teal-500/20 border border-teal-400/30 rounded-full px-4 py-1.5 text-sm text-teal-300 mb-6">
              <CheckCircle className="w-4 h-4" /> Secure & Transparent Complaint Portal
            </div>
            <h1 className="text-5xl lg:text-6xl font-extrabold leading-tight mb-6">
              Your Voice,<br />
              <span className="text-teal-400">Heard & Resolved</span>
            </h1>
            <p className="text-lg text-primary-200 mb-8 leading-relaxed">
              ResolveX is the official student complaint management system. Submit, track, and resolve campus issues with full transparency and accountability.
            </p>
            <div className="flex flex-wrap gap-4">
              <Button size="lg" variant="teal" onClick={handleCTA}>
                {isAuthenticated ? 'Go to Dashboard' : 'Submit a Complaint'} <ArrowRight className="w-5 h-5" />
              </Button>
              {!isAuthenticated && (
                <Button size="lg" variant="secondary" onClick={() => navigate('/login')} className="bg-white/10 border-white/20 text-white hover:bg-white/20">
                  Admin Login
                </Button>
              )}
            </div>
          </div>
        </div>

        {/* Wave */}
        <div className="absolute bottom-0 left-0 right-0">
          <svg viewBox="0 0 1440 60" fill="none" xmlns="http://www.w3.org/2000/svg">
            <path d="M0 60L1440 60L1440 0C1440 0 1080 60 720 60C360 60 0 0 0 0L0 60Z" fill="white" />
          </svg>
        </div>
      </section>

      {/* Categories */}
      <section className="py-16 max-w-6xl mx-auto px-6">
        <p className="text-center text-sm font-semibold text-gray-400 uppercase tracking-widest mb-8">Complaint Categories</p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          {CATEGORIES.map((cat) => (
            <div key={cat.label} className={`flex flex-col items-center gap-3 p-6 rounded-2xl ${cat.color} border border-current/10`}>
              {cat.icon}
              <span className="font-semibold text-sm">{cat.label}</span>
            </div>
          ))}
        </div>
      </section>

      {/* Features */}
      <section className="py-16 bg-gray-50">
        <div className="max-w-6xl mx-auto px-6">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold text-gray-900">Everything you need</h2>
            <p className="text-gray-500 mt-2">A complete complaint management platform for students and staff</p>
          </div>
          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {FEATURES.map((f) => (
              <div key={f.title} className="bg-white rounded-xl p-6 shadow-card border border-gray-100 hover:shadow-card-hover transition-shadow">
                <div className="w-12 h-12 rounded-xl bg-primary-50 text-primary-600 flex items-center justify-center mb-4">
                  {f.icon}
                </div>
                <h3 className="font-semibold text-gray-900 mb-1">{f.title}</h3>
                <p className="text-sm text-gray-500 leading-relaxed">{f.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* How it works */}
      <section className="py-20 max-w-6xl mx-auto px-6">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900">How it works</h2>
        </div>
        <div className="grid md:grid-cols-4 gap-6 relative">
          <div className="hidden md:block absolute top-8 left-[12.5%] right-[12.5%] h-0.5 bg-gradient-to-r from-primary-200 via-teal-300 to-primary-200" />
          {STEPS.map((s) => (
            <div key={s.n} className="flex flex-col items-center text-center relative">
              <div className="w-16 h-16 rounded-2xl bg-gradient-to-br from-primary-600 to-teal-500 text-white flex items-center justify-center text-lg font-bold mb-4 shadow-glow relative z-10">
                {s.n}
              </div>
              <h3 className="font-semibold text-gray-900 mb-1">{s.title}</h3>
              <p className="text-sm text-gray-500">{s.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* CTA Banner */}
      <section className="py-16 bg-gradient-to-r from-primary-800 to-teal-600 text-white">
        <div className="max-w-3xl mx-auto px-6 text-center">
          <h2 className="text-3xl font-bold mb-3">Ready to resolve your issue?</h2>
          <p className="text-primary-200 mb-8">Join thousands of students who trust ResolveX to get campus issues resolved fast.</p>
          <Button size="lg" variant="secondary" onClick={handleCTA} className="bg-white text-primary-800 hover:bg-primary-50 border-0">
            Get Started Free <ArrowRight className="w-5 h-5" />
          </Button>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-8 border-t border-gray-100 text-center text-sm text-gray-400">
        <p>© {new Date().getFullYear()} ResolveX · Student Complaint Management System</p>
      </footer>
    </div>
  );
};