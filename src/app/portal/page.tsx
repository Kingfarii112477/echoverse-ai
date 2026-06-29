'use client';

import { useState, useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import {
  Play,
  Mic,
  Users,
  Languages,
  Headphones,
  Copy,
  Heart,
  ArrowRight,
  Check,
  Menu,
  X,
  Infinity,
  MessageCircle,
  Link2,
  GitBranch,
  PlayCircle,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';

export default function PortalPage() {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const heroRef = useRef(null);
  const { scrollYProgress } = useScroll();

  return (
    <div className="min-h-screen bg-[--ev-bg] text-[--ev-on-surface]">
      {/* Navigation */}
      <nav className="sticky top-0 z-50 backdrop-blur-xl bg-[--ev-bg]/80 border-b border-[--ev-outline]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <svg
                width="32"
                height="32"
                viewBox="0 0 32 32"
                fill="none"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6z"
                  fill="url(#gradient)"
                />
                <path
                  d="M12 10c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.48 0 2.77-.81 3.46-2H20c1.1 0 2-.9 2-2s-.9-2-2-2h-4.54c-.69-1.19-1.98-2-3.46-2z"
                  fill="url(#gradient)"
                />
                <defs>
                  <linearGradient id="gradient" x1="4" y1="4" x2="28" y2="28">
                    <stop offset="0%" stopColor="#00d8ff" />
                    <stop offset="100%" stopColor="#aeecff" />
                  </linearGradient>
                </defs>
              </svg>
              <span className="text-xl font-bold">EchoVerse AI</span>
            </div>

            {/* Desktop Navigation */}
            <div className="hidden md:flex items-center gap-8">
              <a href="#features" className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                Features
              </a>
              <a href="#pricing" className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                Pricing
              </a>
              <a href="#about" className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                About
              </a>
            </div>

            <div className="hidden md:flex items-center gap-4">
              <button className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                Sign In
              </button>
              <Button>Get Started Free</Button>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="md:hidden p-2"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

          {/* Mobile Menu */}
          {mobileMenuOpen && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="md:hidden py-4 space-y-4"
            >
              <a href="#features" className="block text-[--ev-on-surface-variant] hover:text-[--ev-primary]">
                Features
              </a>
              <a href="#pricing" className="block text-[--ev-on-surface-variant] hover:text-[--ev-primary]">
                Pricing
              </a>
              <a href="#about" className="block text-[--ev-on-surface-variant] hover:text-[--ev-primary]">
                About
              </a>
              <div className="pt-4 space-y-2">
                <Button variant="outline" className="w-full">Sign In</Button>
                <Button className="w-full">Get Started Free</Button>
              </div>
            </motion.div>
          )}
        </div>
      </nav>

      {/* Hero Section */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated Waveform Background */}
        <div className="absolute inset-0 overflow-hidden opacity-30">
          <div className="flex gap-1 h-full items-center justify-center">
            {Array.from({ length: 50 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-1 bg-gradient-to-t from-[--ev-primary-container] to-[--ev-secondary]"
                animate={{
                  height: [
                    `${20 + Math.random() * 30}%`,
                    `${40 + Math.random() * 40}%`,
                    `${20 + Math.random() * 30}%`,
                  ],
                }}
                transition={{
                  duration: 1 + Math.random() * 2,
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.05,
                }}
              />
            ))}
          </div>
        </div>

        {/* Radial Gradient Overlay */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_center,transparent_0%,var(--ev-bg)_70%)]" />

        <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8 }}
          >
            <h1 className="text-5xl md:text-7xl font-bold mb-6 leading-tight">
              The Urdu-First AI
              <br />
              <span className="bg-gradient-to-r from-[--ev-primary] via-[--ev-primary-container] to-[--ev-secondary] bg-clip-text text-transparent">
                Voice Content OS
              </span>
            </h1>
            <p className="text-xl md:text-2xl text-[--ev-on-surface-variant] mb-8 max-w-3xl mx-auto">
              Create podcasts, audiobooks, stories, and more — all powered by AI voices in Urdu, Hindi, English, and Arabic.
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button size="lg" className="text-lg px-8">
                Start Free
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>
              <Button size="lg" variant="outline" className="text-lg px-8">
                <Play className="w-5 h-5 mr-2" />
                Watch Demo
              </Button>
            </div>
          </motion.div>

          {/* Floating Waveform Illustration */}
          <motion.div
            className="mt-16 flex gap-2 justify-center"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 1, delay: 0.5 }}
          >
            {Array.from({ length: 7 }).map((_, i) => (
              <motion.div
                key={i}
                className="w-3 bg-gradient-to-t from-[--ev-primary-container] to-[--ev-primary] rounded-full"
                animate={{
                  height: [
                    `${60 + Math.random() * 40}px`,
                    `${100 + Math.random() * 60}px`,
                    `${60 + Math.random() * 40}px`,
                  ],
                }}
                transition={{
                  duration: 1.5 + Math.random(),
                  repeat: Infinity,
                  ease: 'easeInOut',
                  delay: i * 0.1,
                }}
              />
            ))}
          </motion.div>
        </div>
      </section>

      {/* Features Section */}
      <section id="features" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">What You Can Create</h2>
            <p className="text-xl text-[--ev-on-surface-variant]">
              Powerful AI tools for every type of voice content
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Mic,
                title: 'Voice Studio',
                description: 'AI-powered voice generation with 25+ voices',
                color: 'cyan',
                gradient: 'from-cyan-500 to-cyan-300',
              },
              {
                icon: Users,
                title: 'Multi-Speaker',
                description: 'Create conversations with multiple AI speakers',
                color: 'purple',
                gradient: 'from-purple-500 to-purple-300',
              },
              {
                icon: Languages,
                title: 'Urdu AI',
                description: 'Native Urdu text-to-speech with emotional range',
                color: 'teal',
                gradient: 'from-teal-500 to-teal-300',
              },
              {
                icon: Headphones,
                title: 'Podcast Studio',
                description: 'Full podcast production with AI host and guests',
                color: 'purple',
                gradient: 'from-purple-500 to-purple-300',
              },
              {
                icon: Copy,
                title: 'Voice Cloning',
                description: 'Clone any voice with just 30 seconds of audio',
                color: 'cyan',
                gradient: 'from-cyan-500 to-cyan-300',
              },
              {
                icon: Heart,
                title: 'Emotion Engine',
                description: 'Add emotions and personality to AI voices',
                color: 'pink',
                gradient: 'from-pink-500 to-pink-300',
              },
            ].map((feature, index) => (
              <motion.div
                key={feature.title}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className="bg-[--ev-surface]/50 backdrop-blur-xl border-[--ev-outline] hover:border-[--ev-primary] transition-all duration-300 group h-full">
                  <CardContent className="p-6">
                    <div className={cn(
                      'w-12 h-12 rounded-lg bg-gradient-to-br mb-4 flex items-center justify-center',
                      feature.gradient
                    )}>
                      <feature.icon className="w-6 h-6 text-white" />
                    </div>
                    <h3 className="text-xl font-bold mb-2 group-hover:text-[--ev-primary] transition-colors">
                      {feature.title}
                    </h3>
                    <p className="text-[--ev-on-surface-variant]">{feature.description}</p>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* Social Proof */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-[--ev-surface]">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center"
          >
            <h2 className="text-3xl font-bold mb-12">Trusted by creators worldwide</h2>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-8">
              {[
                { value: '10K+', label: 'Users' },
                { value: '50M+', label: 'Minutes Generated' },
                { value: '150+', label: 'Voices' },
                { value: '4.9', label: 'Rating', suffix: '★' },
              ].map((stat, index) => (
                <AnimatedStat
                  key={stat.label}
                  value={stat.value}
                  label={stat.label}
                  suffix={stat.suffix}
                  delay={index * 0.1}
                />
              ))}
            </div>
          </motion.div>
        </div>
      </section>

      {/* Pricing Section */}
      <section id="pricing" className="py-24 px-4 sm:px-6 lg:px-8">
        <div className="max-w-7xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
            className="text-center mb-16"
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-4">Simple, Transparent Pricing</h2>
            <p className="text-xl text-[--ev-on-surface-variant]">
              Choose the plan that's right for you
            </p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              {
                name: 'Free',
                price: '$0',
                period: 'forever',
                features: ['5 projects', '10 min/month', 'Basic voices', 'Standard quality'],
              },
              {
                name: 'Starter',
                price: '$9',
                period: 'per month',
                features: ['20 projects', '100 min/month', 'All voices', 'HD quality'],
              },
              {
                name: 'Pro',
                price: '$29',
                period: 'per month',
                features: ['Unlimited projects', '500 min/month', 'Voice cloning', 'Priority support'],
                popular: true,
              },
              {
                name: 'Enterprise',
                price: 'Custom',
                period: 'contact us',
                features: ['Custom minutes', 'Dedicated support', 'API access', 'Custom voices'],
              },
            ].map((plan, index) => (
              <motion.div
                key={plan.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: index * 0.1 }}
              >
                <Card className={cn(
                  'bg-[--ev-surface] border-[--ev-outline] h-full relative',
                  plan.popular && 'border-[--ev-primary] border-2'
                )}>
                  {plan.popular && (
                    <div className="absolute -top-3 left-1/2 -translate-x-1/2">
                      <Badge className="bg-[--ev-primary-container] text-[--ev-bg]">Most Popular</Badge>
                    </div>
                  )}
                  <CardContent className="p-6">
                    <h3 className="text-xl font-bold mb-2">{plan.name}</h3>
                    <div className="mb-4">
                      <span className="text-4xl font-bold text-[--ev-primary]">{plan.price}</span>
                      {plan.price !== 'Custom' && <span className="text-[--ev-on-surface-variant]"> / {plan.period}</span>}
                    </div>
                    <ul className="space-y-3 mb-6">
                      {plan.features.map((feature) => (
                        <li key={feature} className="flex items-center gap-2 text-sm">
                          <Check className="w-4 h-4 text-[--ev-primary] flex-shrink-0" />
                          <span>{feature}</span>
                        </li>
                      ))}
                    </ul>
                    <Button
                      variant={plan.popular ? 'default' : 'outline'}
                      className="w-full"
                    >
                      Get Started
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            ))}
          </div>

          <motion.div
            initial={{ opacity: 0 }}
            whileInView={{ opacity: 1 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6, delay: 0.4 }}
            className="text-center mt-8"
          >
            <a href="#" className="text-[--ev-primary] hover:underline">
              See Full Pricing Details →
            </a>
          </motion.div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-24 px-4 sm:px-6 lg:px-8 bg-gradient-to-br from-[--ev-surface] to-[--ev-surface-high]">
        <div className="max-w-4xl mx-auto text-center">
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            transition={{ duration: 0.6 }}
          >
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Ready to amplify your voice?
            </h2>
            <p className="text-xl text-[--ev-on-surface-variant] mb-8">
              Join thousands of creators using AI to bring their stories to life
            </p>
            <Button size="lg" className="text-lg px-8 mb-4">
              Start Creating for Free
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <p className="text-sm text-[--ev-on-surface-variant]">
              No credit card required
            </p>
          </motion.div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 sm:px-6 lg:px-8 border-t border-[--ev-outline]">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-5 gap-8 mb-8">
            <div className="col-span-2">
              <div className="flex items-center gap-2 mb-4">
                <svg
                  width="32"
                  height="32"
                  viewBox="0 0 32 32"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M16 4C9.373 4 4 9.373 4 16s5.373 12 12 12 12-5.373 12-12S22.627 4 16 4zm0 2c5.523 0 10 4.477 10 10s-4.477 10-10 10S6 21.523 6 16 10.477 6 16 6z"
                    fill="url(#gradient2)"
                  />
                  <path
                    d="M12 10c-2.21 0-4 1.79-4 4s1.79 4 4 4c1.48 0 2.77-.81 3.46-2H20c1.1 0 2-.9 2-2s-.9-2-2-2h-4.54c-.69-1.19-1.98-2-3.46-2z"
                    fill="url(#gradient2)"
                  />
                  <defs>
                    <linearGradient id="gradient2" x1="4" y1="4" x2="28" y2="28">
                      <stop offset="0%" stopColor="#00d8ff" />
                      <stop offset="100%" stopColor="#aeecff" />
                    </linearGradient>
                  </defs>
                </svg>
                <span className="text-xl font-bold">EchoVerse AI</span>
              </div>
              <p className="text-sm text-[--ev-on-surface-variant] mb-4">
                The Urdu-first AI voice content operating system
              </p>
              <div className="flex gap-4">
                <a href="#" className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                  <MessageCircle className="w-5 h-5" />
                </a>
                <a href="#" className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                  <Link2 className="w-5 h-5" />
                </a>
                <a href="#" className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                  <GitBranch className="w-5 h-5" />
                </a>
                <a href="#" className="text-[--ev-on-surface-variant] hover:text-[--ev-primary] transition-colors">
                  <PlayCircle className="w-5 h-5" />
                </a>
              </div>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Product</h4>
              <ul className="space-y-2 text-sm text-[--ev-on-surface-variant]">
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Features</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Pricing</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">API</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Changelog</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Company</h4>
              <ul className="space-y-2 text-sm text-[--ev-on-surface-variant]">
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">About</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Blog</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Careers</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Contact</a></li>
              </ul>
            </div>

            <div>
              <h4 className="font-semibold mb-4">Legal</h4>
              <ul className="space-y-2 text-sm text-[--ev-on-surface-variant]">
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Privacy</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Terms</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Security</a></li>
                <li><a href="#" className="hover:text-[--ev-primary] transition-colors">Cookies</a></li>
              </ul>
            </div>
          </div>

          <div className="pt-8 border-t border-[--ev-outline] text-center text-sm text-[--ev-on-surface-variant]">
            <p>© 2024 EchoVerse AI. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

// Animated Stat Component
function AnimatedStat({
  value,
  label,
  suffix = '',
  delay = 0,
}: {
  value: string;
  label: string;
  suffix?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const isInView = useInView(ref, { once: true });
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!isInView) return;

    const numericValue = parseInt(value.replace(/[^\d]/g, ''));
    if (isNaN(numericValue)) {
      setCount(0);
      return;
    }

    const duration = 2000;
    const steps = 60;
    const increment = numericValue / steps;
    let current = 0;

    const timer = setInterval(() => {
      current += increment;
      if (current >= numericValue) {
        setCount(numericValue);
        clearInterval(timer);
      } else {
        setCount(Math.floor(current));
      }
    }, duration / steps);

    return () => clearInterval(timer);
  }, [isInView, value]);

  const formatValue = (val: number) => {
    if (value.includes('K')) return `${(val / 1000).toFixed(1)}K`;
    if (value.includes('M')) return `${(val / 1000000).toFixed(1)}M`;
    return val.toString();
  };

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 20 }}
      animate={isInView ? { opacity: 1, y: 0 } : {}}
      transition={{ duration: 0.6, delay }}
    >
      <div className="text-4xl font-bold text-[--ev-primary] mb-2">
        {value.match(/^\d/) ? formatValue(count) : value}
        {suffix}
      </div>
      <div className="text-[--ev-on-surface-variant]">{label}</div>
    </motion.div>
  );
}
