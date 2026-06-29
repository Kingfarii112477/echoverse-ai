'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import {
  LayoutTemplate,
  Search,
  Users,
  Star,
  Crown,
  Mic,
  BookOpen,
  Headphones,
  GraduationCap,
  Moon,
  Megaphone,
  Briefcase,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { templateService } from '@/lib/supabase';
import { Button } from '@/components/ui/Button';
import { Card, CardContent } from '@/components/ui/Card';
import { Input } from '@/components/ui/Input';
import { Badge } from '@/components/ui/Badge';

const categories = [
  'All',
  'Podcast',
  'Story',
  'Audiobook',
  'Educational',
  'Islamic',
  'Marketing',
  'Corporate',
];

const templates = [
  {
    id: 1,
    name: 'Tech Podcast Script',
    category: 'Podcast',
    uses: 1200,
    featured: false,
    premium: false,
    icon: Mic,
  },
  {
    id: 2,
    name: 'Kids Story Template',
    category: 'Story',
    uses: 890,
    featured: true,
    premium: false,
    icon: BookOpen,
  },
  {
    id: 3,
    name: 'Quran Recitation Guide',
    category: 'Islamic',
    uses: 2100,
    featured: false,
    premium: true,
    icon: Moon,
  },
  {
    id: 4,
    name: 'Corporate Presentation',
    category: 'Corporate',
    uses: 567,
    featured: false,
    premium: false,
    icon: Briefcase,
  },
  {
    id: 5,
    name: 'Audiobook Chapter Layout',
    category: 'Audiobook',
    uses: 432,
    featured: false,
    premium: false,
    icon: Headphones,
  },
  {
    id: 6,
    name: 'Educational Lecture',
    category: 'Educational',
    uses: 789,
    featured: true,
    premium: false,
    icon: GraduationCap,
  },
  {
    id: 7,
    name: 'Marketing Video Script',
    category: 'Marketing',
    uses: 345,
    featured: false,
    premium: false,
    icon: Megaphone,
  },
  {
    id: 8,
    name: 'Interview Podcast',
    category: 'Podcast',
    uses: 1500,
    featured: false,
    premium: false,
    icon: Mic,
  },
  {
    id: 9,
    name: 'Urdu Poetry Collection',
    category: 'Story',
    uses: 678,
    featured: false,
    premium: true,
    icon: BookOpen,
  },
  {
    id: 10,
    name: 'Product Demo Script',
    category: 'Marketing',
    uses: 234,
    featured: false,
    premium: false,
    icon: Megaphone,
  },
  {
    id: 11,
    name: 'Islamic Lecture',
    category: 'Islamic',
    uses: 1800,
    featured: false,
    premium: false,
    icon: Moon,
  },
  {
    id: 12,
    name: "Children's Audiobook",
    category: 'Audiobook',
    uses: 543,
    featured: true,
    premium: false,
    icon: Headphones,
  },
];

const categoryColors: Record<string, string> = {
  Podcast: 'bg-[#aeecff]/20 text-[#aeecff] border-[#aeecff]/30',
  Story: 'bg-[#ccbdff]/20 text-[#ccbdff] border-[#ccbdff]/30',
  Audiobook: 'bg-[#00d8ff]/20 text-[#00d8ff] border-[#00d8ff]/30',
  Educational: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
  Islamic: 'bg-amber-500/20 text-amber-400 border-amber-500/30',
  Marketing: 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  Corporate: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
};

const categoryGradients: Record<string, string> = {
  Podcast: 'from-[#aeecff]/20 to-[#aeecff]/5',
  Story: 'from-[#ccbdff]/20 to-[#ccbdff]/5',
  Audiobook: 'from-[#00d8ff]/20 to-[#00d8ff]/5',
  Educational: 'from-emerald-500/20 to-emerald-500/5',
  Islamic: 'from-amber-500/20 to-amber-500/5',
  Marketing: 'from-pink-500/20 to-pink-500/5',
  Corporate: 'from-blue-500/20 to-blue-500/5',
};

export default function TemplatesPage() {
  const [selectedCategory, setSelectedCategory] = useState('All');
  const [searchQuery, setSearchQuery] = useState('');
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState('');

  const filteredTemplates = dbTemplates.filter((template) => {
    const matchesCategory =
      selectedCategory === 'All' || template.category === selectedCategory;
    const matchesSearch = template.name
      .toLowerCase()
      .includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const handleUseTemplate = (templateName: string) => {
    setToastMessage(`Opening "${templateName}" in studio...`);
    setShowToast(true);
    setTimeout(() => setShowToast(false), 3000);
  };

  return (
    <div className="min-h-screen bg-[#0e1417] text-[#dde4e6] p-6 md:p-8">
      {/* Header */}
      <div className="max-w-7xl mx-auto">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-8">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-[#1a2123] rounded-lg">
              <LayoutTemplate className="w-6 h-6 text-[#aeecff]" />
            </div>
            <h1 className="text-3xl font-bold">Templates</h1>
          </div>

          {/* Search */}
          <div className="relative w-full md:w-96">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[#859398]" />
            <Input
              type="text"
              placeholder="Search templates..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-[#131c1f] border-[#3c494d] text-[#dde4e6] placeholder:text-[#859398]"
            />
          </div>
        </div>

        {/* Category Filter Tabs */}
        <div className="mb-8 overflow-x-auto pb-2">
          <div className="flex gap-2 min-w-max">
            {categories.map((category) => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                className={cn(
                  'px-4 py-2 rounded-lg border transition-all duration-200',
                  selectedCategory === category
                    ? 'bg-[#aeecff]/20 text-[#aeecff] border-[#aeecff]'
                    : 'bg-[#131c1f] text-[#859398] border-[#3c494d] hover:border-[#859398]'
                )}
              >
                {category}
              </button>
            ))}
          </div>
        </div>

        {/* Template Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredTemplates.map((template, index) => {
            const Icon = template.icon;
            return (
              <motion.div
                key={template.id}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: index * 0.05 }}
              >
                <Card
                  className="bg-[#131c1f] border-[#3c494d] overflow-hidden hover:scale-[1.02] hover:shadow-lg hover:shadow-[#aeecff]/10 transition-all duration-300 cursor-pointer group"
                  onClick={() => handleUseTemplate(template.name)}
                >
                  {/* Gradient Thumbnail */}
                  <div
                    className={cn(
                      'h-32 bg-gradient-to-br relative',
                      categoryGradients[template.category]
                    )}
                  >
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Icon className="w-12 h-12 text-[#dde4e6]/60" />
                    </div>

                    {/* Badges */}
                    <div className="absolute top-3 right-3 flex gap-2">
                      {template.featured && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-yellow-500/20 border border-yellow-500/30">
                          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
                          <span className="text-xs text-yellow-400 font-medium">
                            Featured
                          </span>
                        </div>
                      )}
                      {template.premium && (
                        <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-purple-500/20 border border-purple-500/30">
                          <Crown className="w-3 h-3 text-purple-400 fill-purple-400" />
                          <span className="text-xs text-purple-400 font-medium">
                            Premium
                          </span>
                        </div>
                      )}
                    </div>
                  </div>

                  <CardContent className="p-4">
                    <h3 className="text-lg font-semibold mb-2 group-hover:text-[#aeecff] transition-colors">
                      {template.name}
                    </h3>

                    <div className="flex items-center justify-between mb-4">
                      <Badge
                        className={cn(
                          'border',
                          categoryColors[template.category]
                        )}
                      >
                        {template.category}
                      </Badge>

                      <div className="flex items-center gap-1 text-[#859398] text-sm">
                        <Users className="w-4 h-4" />
                        <span>{template.uses.toLocaleString()}</span>
                      </div>
                    </div>

                    <Button
                      className="w-full bg-[#aeecff] text-[#0e1417] hover:bg-[#00d8ff]"
                      onClick={(e) => {
                        e.stopPropagation();
                        handleUseTemplate(template.name);
                      }}
                    >
                      Use Template
                    </Button>
                  </CardContent>
                </Card>
              </motion.div>
            );
          })}
        </div>

        {/* No Results */}
        {filteredTemplates.length === 0 && (
          <div className="text-center py-12">
            <LayoutTemplate className="w-16 h-16 text-[#859398] mx-auto mb-4" />
            <h3 className="text-xl font-semibold mb-2">No templates found</h3>
            <p className="text-[#859398]">
              Try adjusting your search or category filter
            </p>
          </div>
        )}
      </div>

      {/* Toast Notification */}
      {showToast && (
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 50 }}
          className="fixed bottom-6 right-6 bg-[#1a2123] border border-[#aeecff] rounded-lg px-6 py-4 shadow-lg shadow-[#aeecff]/20"
        >
          <p className="text-[#aeecff] font-medium">{toastMessage}</p>
        </motion.div>
      )}
    </div>
  );
}
