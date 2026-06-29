'use client';

import { useState, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  Check,
  X,
  Zap,
  Crown,
  Building2,
  Sparkles,
  ChevronDown,
  ChevronUp,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { Badge } from '@/components/ui/Badge';
import { cn } from '@/lib/utils';
import { useAuthStore } from '@/stores/authStore';

interface PricingTier {
  id: string;
  name: string;
  icon: any;
  price: {
    monthly: number;
    annual: number;
  };
  period: string;
  popular?: boolean;
  features: string[];
  buttonText: string;
  buttonVariant: 'outline' | 'primary' | 'secondary';
  glowColor?: string;
}

interface FeatureRow {
  category: string;
  features: {
    name: string;
    free: string | boolean;
    pro: string | boolean;
    studio: string | boolean;
    enterprise: string | boolean;
  }[];
}

export default function PricingPage() {
  const { user } = useAuthStore();
  const [isAnnual, setIsAnnual] = useState(false);
  const [expandedFaq, setExpandedFaq] = useState<string | null>(null);
  const [isCheckingOut, setIsCheckingOut] = useState<string | null>(null);
  const [checkoutError, setCheckoutError] = useState('');

  // Paddle price IDs — replace with real IDs from your Paddle dashboard
  const PADDLE_PRICE_IDS: Record<string, string> = {
    pro_monthly:    process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_MONTHLY || '',
    pro_annual:     process.env.NEXT_PUBLIC_PADDLE_PRICE_PRO_ANNUAL || '',
    studio_monthly: process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO_MONTHLY || '',
    studio_annual:  process.env.NEXT_PUBLIC_PADDLE_PRICE_STUDIO_ANNUAL || '',
  };

  const handleUpgrade = useCallback(async (planId: string) => {
    if (planId === 'free') return;
    if (planId === 'enterprise') {
      window.location.href = 'mailto:sales@echoverse.ai?subject=Enterprise Plan Inquiry';
      return;
    }
    if (!user) {
      window.location.href = '/auth?next=/pricing';
      return;
    }

    const priceKey = planId + (isAnnual ? '_annual' : '_monthly');
    const priceId = PADDLE_PRICE_IDS[priceKey];

    if (!priceId) {
      setCheckoutError('Checkout not available yet. Please contact support.');
      return;
    }

    setIsCheckingOut(planId);
    setCheckoutError('');

    try {
      // Use Paddle.js client-side checkout
      if (typeof window !== 'undefined' && (window as any).Paddle) {
        (window as any).Paddle.Checkout.open({
          items: [{ priceId, quantity: 1 }],
          customer: { email: user.email },
          customData: { user_id: user.id },
          settings: { theme: 'dark', locale: 'en' },
        });
      } else {
        // Fallback: redirect to Paddle hosted checkout
        const res = await fetch('/api/checkout', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ priceId, planId }),
        });
        const data = await res.json();
        if (!res.ok) throw new Error(data.error);
        window.location.href = data.url;
      }
    } catch (err: any) {
      setCheckoutError(err.message || 'Checkout failed. Please try again.');
    } finally {
      setIsCheckingOut(null);
    }
  }, [user, isAnnual, PADDLE_PRICE_IDS]);

  const pricingTiers: PricingTier[] = [
    {
      id: 'free',
      name: 'Free',
      icon: Sparkles,
      price: { monthly: 0, annual: 0 },
      period: 'forever',
      features: [
        '5 minutes/day TTS',
        '3 basic voices',
        '1 project',
        'Email support',
        'Community access',
      ],
      buttonText: 'Start Free',
      buttonVariant: 'outline',
    },
    {
      id: 'pro',
      name: 'Pro',
      icon: Zap,
      price: { monthly: 19, annual: 15 },
      period: 'mo',
      popular: true,
      features: [
        'Unlimited TTS',
        '25 premium voices',
        'Unlimited projects',
        'Podcast Generator',
        'Story Studio access',
        'Priority email support',
      ],
      buttonText: 'Upgrade to Pro',
      buttonVariant: 'primary',
      glowColor: 'rgba(0, 216, 255, 0.3)',
    },
    {
      id: 'studio',
      name: 'Studio',
      icon: Crown,
      price: { monthly: 49, annual: 39 },
      period: 'mo',
      features: [
        'Everything in Pro',
        'Voice Cloning (5 clones)',
        'Team Workspace (5 members)',
        'API Access (10K calls/day)',
        'Audiobook Studio',
        'Video Studio',
        'Dedicated support',
      ],
      buttonText: 'Upgrade to Studio',
      buttonVariant: 'secondary',
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      icon: Building2,
      price: { monthly: 0, annual: 0 },
      period: 'custom',
      features: [
        'Everything in Studio',
        'Unlimited voice clones',
        'Unlimited team members',
        'Custom AI models',
        'White label option',
        'Dedicated infrastructure',
        'SLA guarantee',
        'Account manager',
      ],
      buttonText: 'Contact Sales',
      buttonVariant: 'outline',
    },
  ];

  const featureComparison: FeatureRow[] = [
    {
      category: 'Generation',
      features: [
        { name: 'TTS Minutes/Day', free: '5', pro: 'Unlimited', studio: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Voice Quality', free: 'Standard', pro: 'Premium', studio: 'Premium', enterprise: 'Custom' },
        { name: 'Concurrent Generations', free: '1', pro: '3', studio: '10', enterprise: 'Unlimited' },
        { name: 'Export Formats', free: 'MP3', pro: 'MP3, WAV', studio: 'MP3, WAV, FLAC', enterprise: 'All formats' },
      ],
    },
    {
      category: 'Voices',
      features: [
        { name: 'Basic Voices', free: true, pro: true, studio: true, enterprise: true },
        { name: 'Premium Voices', free: false, pro: true, studio: true, enterprise: true },
        { name: 'Voice Cloning', free: false, pro: false, studio: '5 clones', enterprise: 'Unlimited' },
        { name: 'Custom Voice Training', free: false, pro: false, studio: false, enterprise: true },
      ],
    },
    {
      category: 'Studios',
      features: [
        { name: 'Podcast Generator', free: false, pro: true, studio: true, enterprise: true },
        { name: 'Story Studio', free: false, pro: true, studio: true, enterprise: true },
        { name: 'Audiobook Studio', free: false, pro: false, studio: true, enterprise: true },
        { name: 'Video Studio', free: false, pro: false, studio: true, enterprise: true },
      ],
    },
    {
      category: 'Collaboration',
      features: [
        { name: 'Projects', free: '1', pro: 'Unlimited', studio: 'Unlimited', enterprise: 'Unlimited' },
        { name: 'Team Members', free: '1', pro: '1', studio: '5', enterprise: 'Unlimited' },
        { name: 'Team Workspace', free: false, pro: false, studio: true, enterprise: true },
        { name: 'Role-based Access', free: false, pro: false, studio: true, enterprise: true },
      ],
    },
    {
      category: 'Support',
      features: [
        { name: 'Community Support', free: true, pro: true, studio: true, enterprise: true },
        { name: 'Email Support', free: 'Standard', pro: 'Priority', studio: 'Dedicated', enterprise: '24/7' },
        { name: 'Phone Support', free: false, pro: false, studio: false, enterprise: true },
        { name: 'Account Manager', free: false, pro: false, studio: false, enterprise: true },
      ],
    },
    {
      category: 'API',
      features: [
        { name: 'API Access', free: false, pro: false, studio: true, enterprise: true },
        { name: 'API Calls/Day', free: '-', pro: '-', studio: '10,000', enterprise: 'Custom' },
        { name: 'Webhook Support', free: false, pro: false, studio: true, enterprise: true },
        { name: 'Custom Integration', free: false, pro: false, studio: false, enterprise: true },
      ],
    },
  ];

  const faqs = [
    {
      id: '1',
      question: 'Can I switch between plans?',
      answer:
        'Yes! You can upgrade or downgrade your plan at any time. When upgrading, you\'ll be charged a prorated amount for the remainder of your billing cycle. When downgrading, the change will take effect at the start of your next billing cycle.',
    },
    {
      id: '2',
      question: 'What happens if I exceed my limits?',
      answer:
        'For the Free plan, generation will be paused until the next day. For paid plans, we\'ll send you a notification when you reach 80% of your limits. You can upgrade at any time to increase your limits.',
    },
    {
      id: '3',
      question: 'Is there a free trial for paid plans?',
      answer:
        'Pro and Studio plans come with a 14-day free trial, no credit card required. You\'ll have full access to all features during the trial period. Enterprise plans include a custom trial period.',
    },
    {
      id: '4',
      question: 'What payment methods do you accept?',
      answer:
        'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise plans. All payments are processed securely through Stripe.',
    },
  ];

  const renderValue = (value: string | boolean) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="w-5 h-5 text-green-400 mx-auto" />
      ) : (
        <X className="w-5 h-5 text-gray-500 mx-auto" />
      );
    }
    return <span className="text-ev-on-surface">{value}</span>;
  };

  return (
    <div className="min-h-screen bg-ev-bg py-12 px-6">
      <div className="max-w-7xl mx-auto space-y-16">
        {/* Header */}
        <div className="text-center space-y-6">
          <motion.h1
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-5xl font-bold text-ev-on-surface"
          >
            Pricing
          </motion.h1>
          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="text-xl text-ev-on-surface-variant"
          >
            Choose the plan that's right for you
          </motion.p>

          {/* Billing Toggle */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="flex items-center justify-center gap-4"
          >
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                !isAnnual ? 'text-ev-on-surface' : 'text-ev-on-surface-variant'
              )}
            >
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={cn(
                'relative w-14 h-7 rounded-full transition-colors',
                isAnnual ? 'bg-ev-primary-container' : 'bg-ev-surface-high'
              )}
            >
              <motion.div
                animate={{ x: isAnnual ? 28 : 2 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
                className="absolute top-1 w-5 h-5 bg-ev-on-surface rounded-full"
              />
            </button>
            <span
              className={cn(
                'text-sm font-medium transition-colors',
                isAnnual ? 'text-ev-on-surface' : 'text-ev-on-surface-variant'
              )}
            >
              Annual
            </span>
            {isAnnual && (
              <Badge className="bg-green-500/20 text-green-400 text-xs">Save 20%</Badge>
            )}
          </motion.div>
        </div>

        {/* Pricing Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {pricingTiers.map((tier, index) => {
            const Icon = tier.icon;
            const price = isAnnual ? tier.price.annual : tier.price.monthly;

            return (
              <motion.div
                key={tier.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.1 }}
                className="relative"
              >
                {tier.popular && (
                  <div className="absolute -top-4 left-0 right-0 flex justify-center z-10">
                    <Badge className="bg-ev-primary-container text-ev-bg px-4 py-1">
                      Popular
                    </Badge>
                  </div>
                )}
                <Card
                  className={cn(
                    'relative h-full bg-ev-surface/80 backdrop-blur-sm border-ev-outline overflow-hidden',
                    tier.popular && 'border-ev-primary-container border-2'
                  )}
                  style={
                    tier.popular
                      ? {
                          boxShadow: `0 0 40px ${tier.glowColor}`,
                        }
                      : undefined
                  }
                >
                  {tier.popular && (
                    <div
                      className="absolute inset-0 opacity-10"
                      style={{
                        background: `radial-gradient(circle at 50% 0%, ${tier.glowColor}, transparent 70%)`,
                      }}
                    />
                  )}
                  <CardHeader className="relative">
                    <div className="flex items-center gap-3 mb-4">
                      <div className="p-2 bg-ev-surface-container rounded-lg">
                        <Icon className="w-6 h-6 text-ev-primary" />
                      </div>
                      <CardTitle className="text-2xl text-ev-on-surface">{tier.name}</CardTitle>
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-baseline gap-1">
                        {tier.period === 'custom' ? (
                          <span className="text-4xl font-bold text-ev-on-surface">Custom</span>
                        ) : (
                          <>
                            <span className="text-4xl font-bold text-ev-on-surface">
                              ${price}
                            </span>
                            <span className="text-ev-on-surface-variant">/{tier.period}</span>
                          </>
                        )}
                      </div>
                      {isAnnual && tier.price.annual > 0 && tier.price.monthly !== tier.price.annual && (
                        <div className="text-sm text-ev-on-surface-variant">
                          <span className="line-through">${tier.price.monthly}/mo</span>
                        </div>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent className="relative space-y-6">
                    <ul className="space-y-3">
                      {tier.features.map((feature, i) => (
                        <motion.li
                          key={i}
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: index * 0.1 + i * 0.05 }}
                          className="flex items-start gap-3"
                        >
                          <Check className="w-5 h-5 text-ev-primary flex-shrink-0 mt-0.5" />
                          <span className="text-ev-on-surface-variant text-sm">{feature}</span>
                        </motion.li>
                      ))}
                    </ul>
                    <Button
                      className={cn(
                        'w-full',
                        tier.buttonVariant === 'primary' &&
                          'bg-ev-primary-container text-ev-bg hover:bg-ev-primary',
                        tier.buttonVariant === 'secondary' &&
                          'bg-ev-secondary/20 text-ev-secondary hover:bg-ev-secondary/30 border border-ev-secondary',
                        tier.buttonVariant === 'outline' &&
                          'bg-transparent text-ev-on-surface border border-ev-outline hover:bg-ev-surface-container'
                      )}
                    >
                      {tier.buttonText}
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* Feature Comparison Table */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-ev-on-surface text-center">
            Feature Comparison
          </h2>
          <Card className="bg-ev-surface border-ev-outline overflow-hidden">
            <CardContent className="p-0">
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead>
                    <tr className="border-b border-ev-outline bg-ev-surface-container">
                      <th className="text-left py-4 px-6 text-ev-on-surface font-semibold sticky left-0 bg-ev-surface-container z-10">
                        Features
                      </th>
                      <th className="text-center py-4 px-6 text-ev-on-surface font-semibold min-w-[120px]">
                        Free
                      </th>
                      <th className="text-center py-4 px-6 text-ev-on-surface font-semibold min-w-[120px]">
                        Pro
                      </th>
                      <th className="text-center py-4 px-6 text-ev-on-surface font-semibold min-w-[120px]">
                        Studio
                      </th>
                      <th className="text-center py-4 px-6 text-ev-on-surface font-semibold min-w-[120px]">
                        Enterprise
                      </th>
                    </tr>
                  </thead>
                  <tbody>
                    {featureComparison.map((section, sectionIndex) => (
                      <>
                        <tr key={`category-${sectionIndex}`} className="bg-ev-surface-high">
                          <td
                            colSpan={5}
                            className="py-3 px-6 text-ev-primary font-semibold text-sm sticky left-0 bg-ev-surface-high z-10"
                          >
                            {section.category}
                          </td>
                        </tr>
                        {section.features.map((feature, featureIndex) => (
                          <tr
                            key={`feature-${sectionIndex}-${featureIndex}`}
                            className="border-b border-ev-outline/50 hover:bg-ev-surface-container transition-colors"
                          >
                            <td className="py-3 px-6 text-ev-on-surface-variant sticky left-0 bg-ev-surface hover:bg-ev-surface-container transition-colors z-10">
                              {feature.name}
                            </td>
                            <td className="py-3 px-6 text-center">{renderValue(feature.free)}</td>
                            <td className="py-3 px-6 text-center">{renderValue(feature.pro)}</td>
                            <td className="py-3 px-6 text-center">{renderValue(feature.studio)}</td>
                            <td className="py-3 px-6 text-center">
                              {renderValue(feature.enterprise)}
                            </td>
                          </tr>
                        ))}
                      </>
                    ))}
                  </tbody>
                </table>
              </div>
            </CardContent>
          </Card>
        </motion.div>

        {/* FAQ Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="space-y-6"
        >
          <h2 className="text-3xl font-bold text-ev-on-surface text-center">
            Frequently Asked Questions
          </h2>
          <div className="max-w-3xl mx-auto space-y-3">
            {faqs.map((faq) => (
              <Card key={faq.id} className="bg-ev-surface border-ev-outline overflow-hidden">
                <button
                  onClick={() => setExpandedFaq(expandedFaq === faq.id ? null : faq.id)}
                  className="w-full flex items-center justify-between p-6 text-left hover:bg-ev-surface-container transition-colors"
                >
                  <span className="text-lg font-semibold text-ev-on-surface pr-4">
                    {faq.question}
                  </span>
                  {expandedFaq === faq.id ? (
                    <ChevronUp className="w-5 h-5 text-ev-on-surface-variant flex-shrink-0" />
                  ) : (
                    <ChevronDown className="w-5 h-5 text-ev-on-surface-variant flex-shrink-0" />
                  )}
                </button>
                {expandedFaq === faq.id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: 'auto', opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="border-t border-ev-outline"
                  >
                    <div className="p-6 pt-4">
                      <p className="text-ev-on-surface-variant leading-relaxed">{faq.answer}</p>
                    </div>
                  </motion.div>
                )}
              </Card>
            ))}
          </div>
        </motion.div>

        {/* CTA Section */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="text-center space-y-6 py-12"
        >
          <h2 className="text-3xl font-bold text-ev-on-surface">
            Ready to get started?
          </h2>
          <p className="text-xl text-ev-on-surface-variant max-w-2xl mx-auto">
            Join thousands of creators using EchoVerse AI to bring their stories to life
          </p>
          <div className="flex items-center justify-center gap-4">
            <Button className="bg-ev-primary-container text-ev-bg hover:bg-ev-primary px-8 py-3 text-lg">
              Start Free Trial
            </Button>
            <Button className="bg-transparent text-ev-on-surface border border-ev-outline hover:bg-ev-surface-container px-8 py-3 text-lg">
              Contact Sales
            </Button>
          </div>
        </motion.div>
      </div>
    </div>
  );
}
