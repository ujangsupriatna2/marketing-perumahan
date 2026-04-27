"use client";

import React, { useEffect, useState, useRef, useCallback, Suspense } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { motion, AnimatePresence } from "framer-motion";
import { useSettingsStore } from "@/lib/settings-store";
import { usePropertyStore, type Property } from "@/lib/property-store";
import { useBlogStore, type BlogArticle } from "@/lib/blog-store";
import { useTestimonialStore, type Testimonial } from "@/lib/testimonial-store";
import { useGalleryStore, type GalleryItem } from "@/lib/gallery-store";
import { useBankStore, type BankItem } from "@/lib/bank-store";
import Chatbot from "@/components/chatbot";
import MapWrapper from "@/components/map-wrapper";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Separator } from "@/components/ui/separator";
import {
  Home,
  Users,
  Building2,
  BookOpen,
  Phone,
  Mail,
  MapPin,
  Star,
  ChevronRight,
  ArrowRight,
  Menu,
  X,
  Search,
  Eye,
  Clock,
  Heart,
  Shield,
  Award,
  Target,
  CheckCircle2,
  Quote,
  Send,
  MessageCircle,
  Instagram,
  Facebook,
  Youtube,
  ChevronLeft,
  Sparkles,
  TrendingUp,
  Lock,
  BedDouble,
  Bath,
  Maximize2,
  Tag,
  Navigation,
  ArrowUpRight,
  BadgeCheck,
  LandPlot,
  HandshakeIcon,
  Lightbulb,
  Gem,
  CircleDot,
  ChevronDown,
  ExternalLink,
} from "lucide-react";

/* ═══════════════════════════════════════════════════════════════
   HELPERS
   ═══════════════════════════════════════════════════════════════ */

type ViewName = "beranda" | "tentang" | "mitra" | "blog" | "kontak";

function formatRupiah(num: number): string {
  if (!num && num !== 0) return "Hubungi Kami";
  return new Intl.NumberFormat("id-ID", {
    style: "currency",
    currency: "IDR",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(num);
}

function useCountUp(end: number, duration: number = 2000) {
  const [count, setCount] = useState(0);
  const ref = useRef<HTMLDivElement>(null);
  const hasAnimated = useRef(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (entry.isIntersecting && !hasAnimated.current) {
          hasAnimated.current = true;
          const startTime = performance.now();
          const step = (now: number) => {
            const elapsed = now - startTime;
            const progress = Math.min(elapsed / duration, 1);
            const eased = 1 - Math.pow(1 - progress, 3);
            setCount(Math.floor(eased * end));
            if (progress < 1) requestAnimationFrame(step);
          };
          requestAnimationFrame(step);
        }
      },
      { threshold: 0.3 }
    );
    observer.observe(el);
    return () => observer.disconnect();
  }, [end, duration]);

  return { count, ref };
}

/* ═══════════════════════════════════════════════════════════════
   SHARED COMPONENTS
   ═══════════════════════════════════════════════════════════════ */

const fadeUp = {
  hidden: { opacity: 0, y: 24 },
  visible: (i: number = 0) => ({
    opacity: 1,
    y: 0,
    transition: { delay: i * 0.1, duration: 0.5, ease: "easeOut" },
  }),
};

const pageTransition = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0, transition: { duration: 0.4, ease: "easeOut" } },
  exit: { opacity: 0, y: -12, transition: { duration: 0.25, ease: "easeIn" } },
};

function FadeIn({
  children,
  delay = 0,
  className = "",
}: {
  children: React.ReactNode;
  delay?: number;
  className?: string;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-40px" }}
      transition={{ delay, duration: 0.5, ease: "easeOut" }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

function StatCounter({
  value,
  label,
  suffix = "+",
  icon: Icon,
}: {
  value: number;
  label: string;
  suffix?: string;
  icon: React.ElementType;
}) {
  const { count, ref } = useCountUp(value);
  return (
    <div ref={ref} className="text-center p-4">
      <div className="inline-flex items-center justify-center w-12 h-12 rounded-xl bg-indigo-50 text-indigo-600 mb-3">
        <Icon className="w-6 h-6" />
      </div>
      <div className="text-3xl sm:text-4xl font-bold text-gray-900">
        {count.toLocaleString("id-ID")}
        {suffix}
      </div>
      <div className="text-sm text-gray-500 mt-1">{label}</div>
    </div>
  );
}

/* ─── Navbar ─── */
function Navbar({
  activeView,
  navigate,
}: {
  activeView: ViewName;
  navigate: (v: ViewName) => void;
}) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const S = useSettingsStore((s) => s.settings);

  const links: { label: string; view: ViewName }[] = [
    { label: "Beranda", view: "beranda" },
    { label: "Tentang", view: "tentang" },
    { label: "Mitra", view: "mitra" },
    { label: "Blog", view: "blog" },
    { label: "Kontak", view: "kontak" },
  ];

  const handleNav = (v: ViewName) => {
    navigate(v);
    setMobileOpen(false);
  };

  return (
    <nav className="glass-nav sticky top-0 z-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          {/* Logo */}
          <button
            onClick={() => handleNav("beranda")}
            className="flex items-center gap-2.5 shrink-0"
          >
            {S.logo_url ? (
              <img
                src={S.logo_url}
                alt={S.company_name}
                className="h-9 w-9 rounded-lg object-cover"
              />
            ) : (
              <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center">
                <Building2 className="w-5 h-5 text-white" />
              </div>
            )}
            <span className="font-bold text-lg text-gray-900 hidden sm:block">
              {S.company_name}
            </span>
          </button>

          {/* Desktop links */}
          <div className="hidden md:flex items-center gap-1">
            {links.map((l) => (
              <button
                key={l.view}
                onClick={() => handleNav(l.view)}
                className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 ${
                  activeView === l.view
                    ? "text-indigo-600 bg-indigo-50"
                    : "text-gray-600 hover:text-indigo-600 hover:bg-gray-50"
                }`}
              >
                {l.label}
              </button>
            ))}
            <Button
              size="sm"
              onClick={() => {
                window.open(
                  `https://wa.me/${S.contact_wa}?text=Halo, saya tertarik dengan properti di ${S.company_name}`,
                  "_blank"
                );
              }}
              className="ml-3 gradient-accent btn-glow text-white text-sm"
            >
              <MessageCircle className="w-4 h-4 mr-1.5" />
              WhatsApp
            </Button>
          </div>

          {/* Mobile toggle */}
          <button
            className="md:hidden p-2 rounded-lg hover:bg-gray-100 transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle menu"
          >
            {mobileOpen ? (
              <X className="w-5 h-5 text-gray-700" />
            ) : (
              <Menu className="w-5 h-5 text-gray-700" />
            )}
          </button>
        </div>
      </div>

      {/* Mobile menu */}
      <AnimatePresence>
        {mobileOpen && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.25 }}
            className="md:hidden overflow-hidden border-t border-gray-100"
          >
            <div className="px-4 py-3 space-y-1 bg-white/95 backdrop-blur-xl">
              {links.map((l) => (
                <button
                  key={l.view}
                  onClick={() => handleNav(l.view)}
                  className={`block w-full text-left px-4 py-2.5 rounded-lg text-sm font-medium transition-all ${
                    activeView === l.view
                      ? "text-indigo-600 bg-indigo-50"
                      : "text-gray-600 hover:bg-gray-50"
                  }`}
                >
                  {l.label}
                </button>
              ))}
              <Button
                size="sm"
                className="w-full mt-2 gradient-accent text-white"
                onClick={() => {
                  window.open(
                    `https://wa.me/${S.contact_wa}?text=Halo, saya tertarik dengan properti di ${S.company_name}`,
                    "_blank"
                  );
                  setMobileOpen(false);
                }}
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                WhatsApp
              </Button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </nav>
  );
}

/* ─── Footer ─── */
function Footer({ navigate }: { navigate: (v: ViewName) => void }) {
  const S = useSettingsStore((s) => s.settings);

  const navLinks = [
    { label: "Beranda", view: "beranda" as ViewName },
    { label: "Tentang Kami", view: "tentang" as ViewName },
    { label: "Mitra & Proyek", view: "mitra" as ViewName },
    { label: "Blog", view: "blog" as ViewName },
    { label: "Kontak", view: "kontak" as ViewName },
  ];

  return (
    <footer className="gradient-footer text-gray-300 mt-auto">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12 lg:py-16">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-10">
          {/* Brand */}
          <div>
            <div className="flex items-center gap-2.5 mb-4">
              {S.logo_url ? (
                <img
                  src={S.logo_url}
                  alt={S.company_name}
                  className="h-9 w-9 rounded-lg object-cover"
                />
              ) : (
                <div className="h-9 w-9 rounded-lg gradient-accent flex items-center justify-center">
                  <Building2 className="w-5 h-5 text-white" />
                </div>
              )}
              <span className="font-bold text-lg text-white">
                {S.company_name}
              </span>
            </div>
            <p className="text-sm text-gray-400 leading-relaxed">
              Mitra terpercaya dalam menyediakan hunian berkualitas dan investasi
              properti terbaik di kawasan Bandung dan sekitarnya.
            </p>
          </div>

          {/* Navigation */}
          <div>
            <h4 className="font-semibold text-white mb-4">Navigasi</h4>
            <ul className="space-y-2.5">
              {navLinks.map((l) => (
                <li key={l.view}>
                  <button
                    onClick={() => {
                      navigate(l.view);
                      window.scrollTo({ top: 0, behavior: "smooth" });
                    }}
                    className="text-sm text-gray-400 hover:text-indigo-400 transition-colors"
                  >
                    {l.label}
                  </button>
                </li>
              ))}
            </ul>
          </div>

          {/* Contact */}
          <div>
            <h4 className="font-semibold text-white mb-4">Kontak</h4>
            <ul className="space-y-3">
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Phone className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                {S.contact_phone}
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <Mail className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                {S.contact_email}
              </li>
              <li className="flex items-start gap-2.5 text-sm text-gray-400">
                <MapPin className="w-4 h-4 mt-0.5 shrink-0 text-indigo-400" />
                {S.contact_address}
              </li>
            </ul>
          </div>

          {/* Social */}
          <div>
            <h4 className="font-semibold text-white mb-4">Ikuti Kami</h4>
            <div className="flex items-center gap-3">
              {S.social_instagram && (
                <a
                  href={`https://instagram.com/${S.social_instagram}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-indigo-500/20 flex items-center justify-center transition-colors"
                  aria-label="Instagram"
                >
                  <Instagram className="w-4 h-4" />
                </a>
              )}
              {S.social_facebook && (
                <a
                  href={S.social_facebook}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-indigo-500/20 flex items-center justify-center transition-colors"
                  aria-label="Facebook"
                >
                  <Facebook className="w-4 h-4" />
                </a>
              )}
              {S.social_youtube && (
                <a
                  href={S.social_youtube}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-indigo-500/20 flex items-center justify-center transition-colors"
                  aria-label="YouTube"
                >
                  <Youtube className="w-4 h-4" />
                </a>
              )}
              {S.social_tiktok && (
                <a
                  href={`https://tiktok.com/@${S.social_tiktok}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="w-10 h-10 rounded-lg bg-white/10 hover:bg-indigo-500/20 flex items-center justify-center transition-colors"
                  aria-label="TikTok"
                >
                  <svg
                    className="w-4 h-4"
                    viewBox="0 0 24 24"
                    fill="currentColor"
                  >
                    <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.3a8.2 8.2 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.73z" />
                  </svg>
                </a>
              )}
            </div>
            <div className="mt-6">
              <Button
                size="sm"
                className="gradient-accent text-white"
                onClick={() =>
                  window.open(
                    `https://wa.me/${S.contact_wa}?text=Halo, saya tertarik dengan properti di ${S.company_name}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="w-4 h-4 mr-1.5" />
                Hubungi Kami
              </Button>
            </div>
          </div>
        </div>

        <Separator className="my-8 bg-white/10" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-3 text-xs text-gray-500">
          <p>&copy; {new Date().getFullYear()} {S.company_name}. All rights reserved.</p>
          <p>{S.company_legal_name}</p>
        </div>
      </div>
    </footer>
  );
}

/* ─── Page Header ─── */
function PageHeader({
  title,
  subtitle,
  navigate,
}: {
  title: string;
  subtitle: string;
  navigate?: (v: ViewName) => void;
}) {
  return (
    <div className="relative bg-gradient-to-br from-gray-900 via-slate-800 to-gray-900 text-white py-16 sm:py-20 overflow-hidden">
      {/* Decorative orbs */}
      <div className="hero-orb w-64 h-64 bg-indigo-500 top-[-5rem] right-[-5rem]" />
      <div className="hero-orb w-48 h-48 bg-indigo-400 bottom-[-4rem] left-[-3rem]" />

      <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <motion.h1
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4"
        >
          {title}
        </motion.h1>
        <motion.p
          initial={{ opacity: 0, y: 16 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.15 }}
          className="text-gray-300 max-w-2xl mx-auto text-base sm:text-lg"
        >
          {subtitle}
        </motion.p>
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.5, delay: 0.3 }}
          className="mt-6"
        >
          <nav className="flex items-center justify-center gap-2 text-sm text-gray-400">
            <button
              onClick={() => {
                if (navigate) navigate("beranda");
              }}
              className="hover:text-indigo-400 transition-colors"
            >
              Beranda
            </button>
            <ChevronRight className="w-4 h-4" />
            <span className="text-indigo-400">{title}</span>
          </nav>
        </motion.div>
      </div>
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BERANDA VIEW
   ═══════════════════════════════════════════════════════════════ */

function BerandaView({ navigate }: { navigate: (v: ViewName) => void }) {
  const S = useSettingsStore((s) => s.settings);
  const { properties } = usePropertyStore();
  const { articles } = useBlogStore();
  const { testimonials } = useTestimonialStore();

  const featuredProperties = properties.filter((p) => p.isFeatured);
  const latestArticles = articles.slice(0, 3);
  const totalUnits = parseInt(S.total_units_sold) || 500;

  return (
    <motion.div {...pageTransition} className="overflow-hidden">
      {/* ─── Hero ─── */}
      <section className="relative min-h-[85vh] sm:min-h-[90vh] flex items-center overflow-hidden">
        {/* Background image from settings */}
        {S.hero_bg_image && (
          <img
            src={S.hero_bg_image}
            alt=""
            className="absolute inset-0 w-full h-full object-cover"
          />
        )}
        {/* Gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-r from-gray-900/90 via-gray-900/70 to-gray-900/50" />

        {/* Decorative orbs */}
        <div className="hero-orb w-72 h-72 bg-indigo-500 top-[10%] right-[15%]" />
        <div className="hero-orb w-48 h-48 bg-indigo-400 bottom-[10%] right-[30%]" />

        <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 sm:py-28">
          <div className="max-w-2xl">
            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.1 }}
              className="inline-flex items-center gap-2 bg-indigo-500/10 border border-indigo-500/20 rounded-full px-4 py-1.5 mb-6"
            >
              <Sparkles className="w-4 h-4 text-indigo-400" />
              <span className="text-sm text-indigo-300 font-medium">
                Hunian Premium di Bandung
              </span>
            </motion.div>

            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.2 }}
              className="text-4xl sm:text-5xl lg:text-6xl font-bold text-white leading-tight mb-6"
            >
              Temukan Hunian{" "}
              <span className="text-gradient-accent">Impian Anda</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.35 }}
              className="text-lg text-gray-300 leading-relaxed mb-8 max-w-xl"
            >
              {S.company_name} — Mitra terpercaya dalam menyediakan hunian
              berkualitas dengan lokasi strategis, desain modern, dan harga
              terjangkau untuk keluarga Indonesia.
            </motion.p>

            <motion.div
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.6, delay: 0.5 }}
              className="flex flex-wrap gap-3"
            >
              <Button
                size="lg"
                className="gradient-accent text-white btn-glow font-semibold"
                onClick={() =>
                  window.open(
                    `https://wa.me/${S.contact_wa}?text=Halo, saya tertarik dengan properti di ${S.company_name}`,
                    "_blank"
                  )
                }
              >
                <MessageCircle className="w-5 h-5 mr-2" />
                Hubungi via WhatsApp
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/30 text-white hover:bg-white/10 hover:text-white font-semibold"
                onClick={() => navigate("mitra")}
              >
                Lihat Proyek
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>
            </motion.div>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-14 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCounter
              value={totalUnits}
              label="Unit Terjual"
              suffix="+"
              icon={Home}
            />
            <StatCounter
              value={properties.length}
              label="Proyek Properti"
              icon={Building2}
            />
            <StatCounter
              value={testimonials.length}
              label="Klien Puas"
              suffix="+"
              icon={Users}
            />
            <StatCounter
              value={15}
              label="Tahun Pengalaman"
              suffix="+"
              icon={Award}
            />
          </div>
        </div>
      </section>

      {/* ─── Trust Marquee ─── */}
      <section className="py-6 bg-silver-50 border-y border-silver-200/60">
        <div className="marquee-container">
          <div className="marquee-track">
            {[...Array(2)].map((_, idx) => (
              <div key={idx} className="flex items-center gap-8 px-4">
                {[
                  "Lokasi Strategis",
                  "Desain Modern",
                  "Fasilitas Lengkap",
                  "Skema Pembayaran Fleksibel",
                  "Keamanan 24 Jam",
                  "Investasi Menguntungkan",
                  "Legalitas Terjamin",
                  " Lingkungan Asri",
                ].map((item, i) => (
                  <div
                    key={i}
                    className="flex items-center gap-2 text-sm font-medium text-gray-400 whitespace-nowrap"
                  >
                    <CheckCircle2 className="w-4 h-4 text-indigo-400" />
                    {item}
                  </div>
                ))}
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Services Grid ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <Badge
                variant="secondary"
                className="bg-indigo-50 text-indigo-600 mb-3"
              >
                <Star className="w-3.5 h-3.5 mr-1" />
                Keunggulan Kami
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Kenapa Memilih{" "}
                <span className="text-gradient-accent">{S.company_name}</span>?
              </h2>
              <p className="text-gray-500 max-w-2xl mx-auto">
                Kami memberikan lebih dari sekadar rumah — kami memberikan kualitas
                hidup terbaik untuk keluarga Anda.
              </p>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                icon: Navigation,
                title: "Lokasi Strategis",
                desc: "Terletak di kawasan berkembang dengan akses mudah ke fasilitas publik, pendidikan, dan pusat bisnis.",
              },
              {
                icon: Sparkles,
                title: "Desain Modern",
                desc: "Arsitektur kontemporer yang elegan dengan material premium dan tata ruang yang fungsional.",
              },
              {
                icon: Home,
                title: "Fasilitas Lengkap",
                desc: "Dilengkapi taman, keamanan 24 jam, area bermain anak, dan infrastruktur modern.",
              },
              {
                icon: TrendingUp,
                title: "Investasi Menguntungkan",
                desc: "Nilai properti yang terus meningkat di lokasi premium Bandung dan sekitarnya.",
              },
              {
                icon: HandshakeIcon,
                title: "Skema Pembayaran Fleksibel",
                desc: "Pilihan pembayaran KPR, syariah, dan cicilan ringan yang disesuaikan kemampuan Anda.",
              },
              {
                icon: Shield,
                title: "Legalitas Terjamin",
                desc: "Sertifikat lengkap dan legalitas jelas, memberikan rasa aman untuk investasi jangka panjang.",
              },
            ].map((service, i) => (
              <FadeIn key={service.title} delay={i * 0.08}>
                <Card className="card-lift border-silver-200/60 bg-white hover:border-indigo-200 h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                      <service.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {service.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {service.desc}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Featured Properties ─── */}
      {featuredProperties.length > 0 && (
        <section className="py-16 sm:py-20 bg-silver-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-50 text-indigo-600 mb-3"
                  >
                    <Building2 className="w-3.5 h-3.5 mr-1" />
                    Properti Unggulan
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Proyek <span className="text-gradient-accent">Pilihan</span>
                  </h2>
                </div>
                <Button
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => navigate("mitra")}
                >
                  Lihat Semua
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {featuredProperties.slice(0, 6).map((prop, i) => (
                <FadeIn key={prop.id} delay={i * 0.08}>
                  <Card className="card-lift border-silver-200/60 bg-white overflow-hidden h-full group cursor-pointer">
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={prop.image || prop.images?.[0] || "/images/placeholder-property.jpg"}
                        alt={prop.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {prop.tag && (
                          <Badge className="gradient-accent text-white text-xs border-0">
                            {prop.tag}
                          </Badge>
                        )}
                        {prop.category && (
                          <Badge className="bg-white/90 text-gray-700 text-xs border-0">
                            {prop.category.replace(/_/g, " ")}
                          </Badge>
                        )}
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                        {prop.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin className="w-3.5 h-3.5" />
                        {prop.location}
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        {prop.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5" />
                            {prop.bedrooms} KT
                          </span>
                        )}
                        {prop.bathrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" />
                            {prop.bathrooms} KM
                          </span>
                        )}
                        {prop.landArea > 0 && (
                          <span className="flex items-center gap-1">
                            <Maximize2 className="w-3.5 h-3.5" />
                            {prop.landArea} m²
                          </span>
                        )}
                      </div>
                      <div className="flex items-center justify-between pt-3 border-t border-silver-200/60">
                        <span className="font-bold text-indigo-600 text-sm">
                          {formatRupiah(prop.price)}
                        </span>
                        <button
                          onClick={() => navigate("mitra")}
                          className="text-xs text-indigo-500 hover:text-indigo-700 flex items-center gap-1 font-medium"
                        >
                          Detail
                          <ChevronRight className="w-3.5 h-3.5" />
                        </button>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Blog Preview ─── */}
      {latestArticles.length > 0 && (
        <section className="py-16 sm:py-20 bg-white">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="flex flex-col sm:flex-row items-start sm:items-end justify-between mb-10 gap-4">
                <div>
                  <Badge
                    variant="secondary"
                    className="bg-indigo-50 text-indigo-600 mb-3"
                  >
                    <BookOpen className="w-3.5 h-3.5 mr-1" />
                    Artikel Terbaru
                  </Badge>
                  <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                    Tips &{" "}
                    <span className="text-gradient-accent">Insight</span>
                  </h2>
                </div>
                <Button
                  variant="outline"
                  className="border-indigo-200 text-indigo-600 hover:bg-indigo-50"
                  onClick={() => navigate("blog")}
                >
                  Semua Artikel
                  <ArrowRight className="w-4 h-4 ml-1.5" />
                </Button>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              {latestArticles.map((article, i) => (
                <FadeIn key={article.id} delay={i * 0.08}>
                  <Card className="card-lift border-silver-200/60 bg-white overflow-hidden h-full group cursor-pointer">
                    <div className="relative h-44 overflow-hidden">
                      <img
                        src={article.images?.[0] || "/images/placeholder-blog.jpg"}
                        alt={article.title}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      {article.category && (
                        <Badge className="absolute top-3 left-3 gradient-accent text-white text-xs border-0">
                          {article.category}
                        </Badge>
                      )}
                    </div>
                    <CardContent className="p-5">
                      <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />
                          {article.readTime}
                        </span>
                        <span className="flex items-center gap-1">
                          <Eye className="w-3 h-3" />
                          {article.views}
                        </span>
                      </div>
                      <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                        {article.title}
                      </h3>
                      <p className="text-sm text-gray-500 line-clamp-2">
                        {article.excerpt}
                      </p>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── Testimonials ─── */}
      {testimonials.length > 0 && (
        <section className="py-16 sm:py-20 bg-silver-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <FadeIn>
              <div className="text-center mb-12">
                <Badge
                  variant="secondary"
                  className="bg-indigo-50 text-indigo-600 mb-3"
                >
                  <Heart className="w-3.5 h-3.5 mr-1" />
                  Testimoni Klien
                </Badge>
                <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                  Apa Kata{" "}
                  <span className="text-gradient-accent">Mereka</span>?
                </h2>
                <p className="text-gray-500 max-w-2xl mx-auto">
                  Kepuasan klien adalah prioritas utama kami. Berikut testimoni
                  dari mereka yang telah mempercayakan huniannya kepada kami.
                </p>
              </div>
            </FadeIn>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {testimonials.slice(0, 6).map((t, i) => (
                <FadeIn key={t.id} delay={i * 0.08}>
                  <Card className="card-lift border-silver-200/60 bg-white h-full">
                    <CardContent className="p-6">
                      <Quote className="w-8 h-8 text-indigo-200 mb-4" />
                      <p className="text-sm text-gray-600 leading-relaxed mb-5 line-clamp-4">
                        &ldquo;{t.text}&rdquo;
                      </p>
                      <div className="flex items-center gap-3 pt-4 border-t border-silver-200/60">
                        <div className="w-10 h-10 rounded-full gradient-accent flex items-center justify-center text-white font-semibold text-sm">
                          {t.name.charAt(0).toUpperCase()}
                        </div>
                        <div>
                          <p className="font-semibold text-sm text-gray-900">
                            {t.name}
                          </p>
                          <p className="text-xs text-gray-400">{t.role}</p>
                        </div>
                        <div className="ml-auto flex items-center gap-0.5">
                          {Array.from({ length: 5 }).map((_, si) => (
                            <Star
                              key={si}
                              className={`w-3.5 h-3.5 ${
                                si < t.rating
                                  ? "text-amber-400 fill-amber-400"
                                  : "text-gray-200"
                              }`}
                            />
                          ))}
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ─── CTA Banner ─── */}
      <section className="py-16 sm:py-20">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="relative gradient-accent rounded-2xl sm:rounded-3xl overflow-hidden px-6 py-12 sm:px-12 sm:py-16 text-center text-white">
              <div className="hero-orb w-48 h-48 bg-white top-[-3rem] right-[-2rem]" />
              <div className="hero-orb w-32 h-32 bg-white bottom-[-2rem] left-[-1rem]" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl lg:text-4xl font-bold mb-4">
                  Siap Menemukan Hunian Impian Anda?
                </h2>
                <p className="text-indigo-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
                  Konsultasikan kebutuhan properti Anda dengan tim ahli kami.
                  Gratis, tanpa komitmen.
                </p>
                <div className="flex flex-wrap justify-center gap-3">
                  <Button
                    size="lg"
                    className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold"
                    onClick={() =>
                      window.open(
                        `https://wa.me/${S.contact_wa}?text=Halo, saya tertarik dengan properti di ${S.company_name}`,
                        "_blank"
                      )
                    }
                  >
                    <MessageCircle className="w-5 h-5 mr-2" />
                    Hubungi via WhatsApp
                  </Button>
                  <Button
                    size="lg"
                    variant="outline"
                    className="border-white/40 text-white hover:bg-white/10 hover:text-white"
                    onClick={() => navigate("kontak")}
                  >
                    <Phone className="w-4 h-4 mr-1.5" />
                    Hubungi Kami
                  </Button>
                </div>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   TENTANG VIEW
   ═══════════════════════════════════════════════════════════════ */

function TentangView({ navigate }: { navigate: (v: ViewName) => void }) {
  const S = useSettingsStore((s) => s.settings);
  const { properties, testimonials } = usePropertyStore();
  const { testimonials: tList } = useTestimonialStore();

  const totalUnits = parseInt(S.total_units_sold) || 500;

  const values = [
    {
      icon: Shield,
      title: "Integritas",
      desc: "Jujur dan transparan dalam setiap transaksi dan komunikasi.",
    },
    {
      icon: Gem,
      title: "Kualitas",
      desc: "Material terbaik dan standar bangunan tinggi untuk setiap proyek.",
    },
    {
      icon: Lightbulb,
      title: "Inovasi",
      desc: "Selalu menghadirkan desain dan teknologi terbaru dalam industri properti.",
    },
    {
      icon: HandshakeIcon,
      title: "Kepercayaan",
      desc: "Membangun hubungan jangka panjang berbasis kepercayaan dan kepuasan.",
    },
    {
      icon: Target,
      title: "Ketepatan Waktu",
      desc: "Serah terima tepat waktu sesuai yang telah dijanjikan.",
    },
    {
      icon: Heart,
      title: "Kepedulian",
      desc: "Mengutamakan kebutuhan dan kenyamanan setiap keluarga.",
    },
  ];

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        title="Tentang Kami"
        subtitle="Mengenal lebih dekat perjalanan dan komitmen kami dalam menghadirkan hunian berkualitas."
        navigate={navigate}
      />

      {/* ─── Cerita Kami ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            <FadeIn>
              <Badge
                variant="secondary"
                className="bg-indigo-50 text-indigo-600 mb-4"
              >
                <BookOpen className="w-3.5 h-3.5 mr-1" />
                Cerita Kami
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-6">
                Membangun Hunian,{" "}
                <span className="text-gradient-accent">Membangun Masa Depan</span>
              </h2>
              <div className="space-y-4 text-gray-600 leading-relaxed">
                <p>
                  <strong>{S.company_name}</strong> adalah perusahaan pengembang
                  properti yang berdedikasi untuk menghadirkan hunian berkualitas
                  tinggi di kawasan Bandung dan sekitarnya. Dengan pengalaman
                  lebih dari satu dekade, kami telah membantu ratusan keluarga
                  menemukan rumah impian mereka.
                </p>
                <p>
                  Didirikan dengan visi menjadi developer properti terdepan yang
                  mengedepankan kualitas, inovasi, dan kepuasan pelanggan,{" "}
                  {S.company_name} terus berkembang dengan berbagai proyek
                  hunian yang tersebar di lokasi-lokasi strategis.
                </p>
                <p>
                  Setiap proyek yang kami kembangkan dirancang dengan memperhatikan
                  detail — mulai dari pemilihan lokasi yang strategis, desain
                  arsitektur yang modern, hingga ketersediaan fasilitas pendukung
                  yang lengkap.
                </p>
              </div>
            </FadeIn>

            <FadeIn delay={0.2}>
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-br from-indigo-100 to-silver-100 rounded-3xl opacity-60" />
                <img
                  src={S.tentangkami_image}
                  alt={`Tentang ${S.company_name}`}
                  className="relative w-full h-[400px] sm:h-[480px] object-cover rounded-2xl shadow-xl"
                />
              </div>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Core Values ─── */}
      <section className="py-16 sm:py-20 bg-silver-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <Badge
                variant="secondary"
                className="bg-indigo-50 text-indigo-600 mb-3"
              >
                <Gem className="w-3.5 h-3.5 mr-1" />
                Nilai Inti
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900 mb-3">
                Prinsip yang{" "}
                <span className="text-gradient-accent">Kami Pegang</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
            {values.map((v, i) => (
              <FadeIn key={v.title} delay={i * 0.08}>
                <Card className="card-lift border-silver-200/60 bg-white h-full">
                  <CardContent className="p-6">
                    <div className="w-12 h-12 rounded-xl bg-indigo-50 flex items-center justify-center mb-4">
                      <v.icon className="w-6 h-6 text-indigo-600" />
                    </div>
                    <h3 className="font-semibold text-gray-900 text-lg mb-2">
                      {v.title}
                    </h3>
                    <p className="text-sm text-gray-500 leading-relaxed">
                      {v.desc}
                    </p>
                  </CardContent>
                </Card>
              </FadeIn>
            ))}
          </div>
        </div>
      </section>

      {/* ─── Vision & Mission ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-12">
              <Badge
                variant="secondary"
                className="bg-indigo-50 text-indigo-600 mb-3"
              >
                <Target className="w-3.5 h-3.5 mr-1" />
                Visi & Misi
              </Badge>
              <h2 className="text-3xl sm:text-4xl font-bold text-gray-900">
                Arah & <span className="text-gradient-accent">Tujuan Kami</span>
              </h2>
            </div>
          </FadeIn>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <FadeIn>
              <Card className="h-full border-silver-200/60 bg-gradient-to-br from-indigo-50 to-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl gradient-accent flex items-center justify-center mb-5">
                    <Sparkles className="w-7 h-7 text-white" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Visi
                  </h3>
                  <p className="text-gray-600 leading-relaxed">
                    Menjadi pengembang properti terdepan dan terpercaya di Indonesia
                    yang menghadirkan hunian berkualitas dengan desain inovatif,
                    lingkungan asri, dan nilai investasi terbaik untuk setiap
                    keluarga Indonesia.
                  </p>
                </CardContent>
              </Card>
            </FadeIn>

            <FadeIn delay={0.1}>
              <Card className="h-full border-silver-200/60 bg-white">
                <CardContent className="p-8">
                  <div className="w-14 h-14 rounded-2xl bg-silver-100 flex items-center justify-center mb-5">
                    <Target className="w-7 h-7 text-indigo-600" />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-4">
                    Misi
                  </h3>
                  <ul className="space-y-3">
                    {[
                      "Membangun hunian berkualitas dengan material terbaik dan standar tinggi.",
                      "Memberikan pelayanan profesional dan transparan kepada setiap klien.",
                      "Mengembangkan proyek di lokasi strategis dengan aksesibilitas mudah.",
                      "Menciptakan komunitas yang harmonis dan berkelanjutan.",
                      "Menghadirkan solusi pembiayaan yang fleksibel dan terjangkau.",
                    ].map((misi, i) => (
                      <li
                        key={i}
                        className="flex items-start gap-2.5 text-sm text-gray-600"
                      >
                        <CheckCircle2 className="w-4 h-4 text-indigo-500 mt-0.5 shrink-0" />
                        {misi}
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            </FadeIn>
          </div>
        </div>
      </section>

      {/* ─── Stats ─── */}
      <section className="py-14 bg-silver-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCounter
              value={totalUnits}
              label="Unit Terjual"
              suffix="+"
              icon={Home}
            />
            <StatCounter
              value={properties.length}
              label="Proyek Properti"
              icon={Building2}
            />
            <StatCounter
              value={tList.length}
              label="Klien Puas"
              suffix="+"
              icon={Users}
            />
            <StatCounter
              value={15}
              label="Tahun Pengalaman"
              suffix="+"
              icon={Award}
            />
          </div>
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="relative gradient-accent rounded-2xl sm:rounded-3xl overflow-hidden px-6 py-12 sm:px-12 sm:py-16 text-center text-white">
              <div className="hero-orb w-48 h-48 bg-white top-[-3rem] right-[-2rem]" />
              <div className="relative">
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Tertarik Bermitra dengan Kami?
                </h2>
                <p className="text-indigo-100 max-w-xl mx-auto mb-8">
                  Mari bersama-sama membangun hunian impian. Hubungi kami untuk
                  konsultasi gratis.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold"
                  onClick={() => navigate("kontak")}
                >
                  <Phone className="w-5 h-5 mr-2" />
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   MITRA VIEW
   ═══════════════════════════════════════════════════════════════ */

function MitraView({ navigate }: { navigate: (v: ViewName) => void }) {
  const S = useSettingsStore((s) => s.settings);
  const { properties, loading } = usePropertyStore();

  const [search, setSearch] = useState("");
  const [category, setCategory] = useState("all");
  const [selectedProp, setSelectedProp] = useState<Property | null>(null);

  const categories = [
    { value: "all", label: "Semua Kategori" },
    { value: "inden", label: "Inden" },
    { value: "kavling", label: "Kavling" },
    { value: "siap_huni", label: "Siap Huni" },
  ];

  const filtered = properties.filter((p) => {
    const matchSearch =
      p.name.toLowerCase().includes(search.toLowerCase()) ||
      p.location.toLowerCase().includes(search.toLowerCase());
    const matchCat = category === "all" || p.category === category;
    return matchSearch && matchCat;
  });

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        title="Mitra & Proyek"
        subtitle="Temukan properti terbaik dari koleksi proyek kami yang tersebar di lokasi strategis."
        navigate={navigate}
      />

      {/* ─── Search & Filter ─── */}
      <section className="py-10 bg-white border-b border-silver-200/60">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col sm:flex-row gap-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
              <Input
                placeholder="Cari properti berdasarkan nama atau lokasi..."
                className="pl-10 h-11"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />
            </div>
            <Select value={category} onValueChange={setCategory}>
              <SelectTrigger className="w-full sm:w-48 h-11">
                <SelectValue placeholder="Kategori" />
              </SelectTrigger>
              <SelectContent>
                {categories.map((c) => (
                  <SelectItem key={c.value} value={c.value}>
                    {c.label}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div className="mt-4 flex items-center gap-4 text-sm text-gray-500">
            <span>
              Menampilkan <strong className="text-gray-900">{filtered.length}</strong> properti
            </span>
          </div>
        </div>
      </section>

      {/* ─── Property Grid ─── */}
      <section className="py-12 sm:py-16 bg-silver-50 min-h-[40vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {loading ? (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {[...Array(6)].map((_, i) => (
                <div key={i} className="skeleton-shimmer rounded-2xl h-80" />
              ))}
            </div>
          ) : filtered.length === 0 ? (
            <div className="text-center py-20">
              <Search className="w-12 h-12 text-gray-300 mx-auto mb-4" />
              <h3 className="text-lg font-semibold text-gray-700 mb-2">
                Properti Tidak Ditemukan
              </h3>
              <p className="text-sm text-gray-400">
                Coba ubah kata kunci pencarian atau filter kategori Anda.
              </p>
            </div>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
              {filtered.map((prop, i) => (
                <FadeIn key={prop.id} delay={Math.min(i * 0.06, 0.4)}>
                  <Card
                    className="card-lift border-silver-200/60 bg-white overflow-hidden h-full group cursor-pointer"
                    onClick={() => setSelectedProp(prop)}
                  >
                    <div className="relative h-52 overflow-hidden">
                      <img
                        src={prop.image || prop.images?.[0] || "/images/placeholder-property.jpg"}
                        alt={prop.name}
                        className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                      />
                      <div className="absolute top-3 left-3 flex gap-2">
                        {prop.isFeatured && (
                          <Badge className="bg-amber-500 text-white text-xs border-0">
                            <Star className="w-3 h-3 mr-0.5" />
                            Unggulan
                          </Badge>
                        )}
                        {prop.tag && (
                          <Badge className="gradient-accent text-white text-xs border-0">
                            {prop.tag}
                          </Badge>
                        )}
                      </div>
                      <div className="absolute bottom-3 right-3">
                        <Badge className="bg-white/90 text-gray-700 text-xs border-0">
                          {prop.category ? prop.category.replace(/_/g, " ") : "Properti"}
                        </Badge>
                      </div>
                    </div>
                    <CardContent className="p-5">
                      <h3 className="font-semibold text-gray-900 text-lg mb-1 line-clamp-1">
                        {prop.name}
                      </h3>
                      <p className="text-sm text-gray-500 flex items-center gap-1 mb-3">
                        <MapPin className="w-3.5 h-3.5 shrink-0" />
                        <span className="line-clamp-1">{prop.location}</span>
                      </p>
                      <div className="flex items-center gap-4 text-xs text-gray-400 mb-4">
                        {prop.bedrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <BedDouble className="w-3.5 h-3.5" />
                            {prop.bedrooms} KT
                          </span>
                        )}
                        {prop.bathrooms > 0 && (
                          <span className="flex items-center gap-1">
                            <Bath className="w-3.5 h-3.5" />
                            {prop.bathrooms} KM
                          </span>
                        )}
                        {prop.landArea > 0 && (
                          <span className="flex items-center gap-1">
                            <LandPlot className="w-3.5 h-3.5" />
                            {prop.landArea}/{prop.buildingArea} m²
                          </span>
                        )}
                      </div>
                      <Separator className="mb-3 bg-silver-200/60" />
                      <div className="flex items-center justify-between">
                        <span className="font-bold text-indigo-600">
                          {prop.price > 0 ? formatRupiah(prop.price) : "Hubungi Kami"}
                        </span>
                        <span className="text-xs text-indigo-500 flex items-center gap-1 font-medium">
                          Lihat Detail
                          <ChevronRight className="w-3.5 h-3.5" />
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              ))}
            </div>
          )}
        </div>
      </section>

      {/* ─── CTA ─── */}
      <section className="py-16 sm:py-20 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="relative gradient-accent rounded-2xl sm:rounded-3xl overflow-hidden px-6 py-12 sm:px-12 sm:py-16 text-center text-white">
              <div className="hero-orb w-48 h-48 bg-white top-[-3rem] right-[-2rem]" />
              <div className="relative">
                <HandshakeIcon className="w-10 h-10 mx-auto mb-4 opacity-80" />
                <h2 className="text-2xl sm:text-3xl font-bold mb-4">
                  Jadi Mitra Kami
                </h2>
                <p className="text-indigo-100 max-w-xl mx-auto mb-8 text-sm sm:text-base">
                  Bergabunglah sebagai mitra pengembang atau agen properti kami.
                  Dapatkan keuntungan eksklusif dan dukungan penuh dari tim
                  profesional.
                </p>
                <Button
                  size="lg"
                  className="bg-white text-indigo-600 hover:bg-indigo-50 font-semibold"
                  onClick={() =>
                    window.open(
                      `https://wa.me/${S.contact_wa}?text=Halo, saya tertarik untuk menjadi mitra ${S.company_name}`,
                      "_blank"
                    )
                  }
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Hubungi Kami
                </Button>
              </div>
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── Property Detail Dialog ─── */}
      <Dialog
        open={!!selectedProp}
        onOpenChange={() => setSelectedProp(null)}
      >
        <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto p-0">
          {selectedProp && (
            <>
              {/* Image */}
              <div className="relative h-64 sm:h-80 overflow-hidden rounded-t-xl">
                <img
                  src={
                    selectedProp.images?.[0] || selectedProp.image || "/images/placeholder-property.jpg"
                  }
                  alt={selectedProp.name}
                  className="w-full h-full object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent" />
                <div className="absolute bottom-4 left-4 right-4 flex items-end justify-between">
                  <div>
                    {selectedProp.tag && (
                      <Badge className="gradient-accent text-white text-xs border-0 mb-2">
                        {selectedProp.tag}
                      </Badge>
                    )}
                    <h2 className="text-xl sm:text-2xl font-bold text-white">
                      {selectedProp.name}
                    </h2>
                  </div>
                </div>
              </div>

              <div className="p-6 sm:p-8">
                <DialogHeader className="sr-only">
                  <DialogTitle>{selectedProp.name}</DialogTitle>
                  <DialogDescription>
                    Detail properti {selectedProp.name}
                  </DialogDescription>
                </DialogHeader>

                {/* Price & Location */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
                  <div className="bg-indigo-50 rounded-xl p-4">
                    <p className="text-xs text-indigo-500 font-medium mb-1">
                      Harga
                    </p>
                    <p className="text-xl font-bold text-indigo-700">
                      {selectedProp.price > 0
                        ? formatRupiah(selectedProp.price)
                        : "Hubungi Kami"}
                    </p>
                  </div>
                  <div className="bg-silver-50 rounded-xl p-4">
                    <p className="text-xs text-gray-500 font-medium mb-1">
                      Lokasi
                    </p>
                    <p className="text-sm font-semibold text-gray-800 flex items-center gap-1.5">
                      <MapPin className="w-4 h-4 text-gray-400" />
                      {selectedProp.location}
                    </p>
                  </div>
                </div>

                {/* Specs */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-6">
                  {selectedProp.bedrooms > 0 && (
                    <div className="text-center p-3 bg-silver-50 rounded-lg">
                      <BedDouble className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-800">
                        {selectedProp.bedrooms}
                      </p>
                      <p className="text-xs text-gray-400">Kamar Tidur</p>
                    </div>
                  )}
                  {selectedProp.bathrooms > 0 && (
                    <div className="text-center p-3 bg-silver-50 rounded-lg">
                      <Bath className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-800">
                        {selectedProp.bathrooms}
                      </p>
                      <p className="text-xs text-gray-400">Kamar Mandi</p>
                    </div>
                  )}
                  {selectedProp.landArea > 0 && (
                    <div className="text-center p-3 bg-silver-50 rounded-lg">
                      <LandPlot className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-800">
                        {selectedProp.landArea} m²
                      </p>
                      <p className="text-xs text-gray-400">Luas Tanah</p>
                    </div>
                  )}
                  {selectedProp.buildingArea > 0 && (
                    <div className="text-center p-3 bg-silver-50 rounded-lg">
                      <Maximize2 className="w-5 h-5 text-indigo-500 mx-auto mb-1" />
                      <p className="text-lg font-bold text-gray-800">
                        {selectedProp.buildingArea} m²
                      </p>
                      <p className="text-xs text-gray-400">Luas Bangunan</p>
                    </div>
                  )}
                </div>

                {/* Description */}
                {selectedProp.description && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Deskripsi</h4>
                    <p className="text-sm text-gray-600 leading-relaxed">
                      {selectedProp.description}
                    </p>
                  </div>
                )}

                {/* Features */}
                {selectedProp.features && selectedProp.features.length > 0 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Fitur</h4>
                    <div className="flex flex-wrap gap-2">
                      {selectedProp.features.map((f, fi) => (
                        <Badge
                          key={fi}
                          variant="secondary"
                          className="bg-silver-50 text-gray-600 text-xs"
                        >
                          <CheckCircle2 className="w-3 h-3 mr-1 text-indigo-400" />
                          {f}
                        </Badge>
                      ))}
                    </div>
                  </div>
                )}

                {/* Installment */}
                {selectedProp.installment && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-2">Cicilan</h4>
                    <p className="text-sm text-gray-600">{selectedProp.installment}</p>
                  </div>
                )}

                {/* Gallery */}
                {selectedProp.images && selectedProp.images.length > 1 && (
                  <div className="mb-6">
                    <h4 className="font-semibold text-gray-900 mb-3">Galeri</h4>
                    <div className="grid grid-cols-3 gap-2">
                      {selectedProp.images.map((img, gi) => (
                        <img
                          key={gi}
                          src={img}
                          alt={`${selectedProp.name} ${gi + 1}`}
                          className="w-full h-24 object-cover rounded-lg"
                        />
                      ))}
                    </div>
                  </div>
                )}

                {/* CTA */}
                <Button
                  className="w-full gradient-accent text-white btn-glow font-semibold"
                  size="lg"
                  onClick={() => {
                    window.open(
                      `https://wa.me/${S.contact_wa}?text=Halo, saya tertarik dengan properti ${selectedProp.name} (${formatRupiah(selectedProp.price)})`,
                      "_blank"
                    );
                  }}
                >
                  <MessageCircle className="w-5 h-5 mr-2" />
                  Tanyakan via WhatsApp
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   BLOG VIEW
   ═══════════════════════════════════════════════════════════════ */

function BlogView({ navigate }: { navigate: (v: ViewName) => void }) {
  const S = useSettingsStore((s) => s.settings);
  const { articles, loading } = useBlogStore();
  const [page, setPage] = useState(1);
  const perPage = 6;

  const totalPages = Math.ceil(articles.length / perPage);
  const paged = articles.slice((page - 1) * perPage, page * perPage);
  const featured = page === 1 ? paged[0] : null;
  const remaining = page === 1 ? paged.slice(1) : paged;

  const popular = [...articles].sort((a, b) => b.views - a.views).slice(0, 5);

  // Reset page when articles change (only if current page would be empty)
  const safePage = Math.min(page, Math.max(1, Math.ceil(articles.length / perPage)));
  if (safePage !== page) setPage(safePage);

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        title="Blog"
        subtitle="Artikel, tips, dan insight seputar properti, investasi, dan gaya hidup modern."
        navigate={navigate}
      />

      <section className="py-12 sm:py-16 bg-silver-50 min-h-[50vh]">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* ─── Main Content ─── */}
            <div className="lg:col-span-2 space-y-6">
              {loading ? (
                <div className="space-y-6">
                  <div className="skeleton-shimmer rounded-2xl h-72" />
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {[...Array(4)].map((_, i) => (
                      <div key={i} className="skeleton-shimmer rounded-2xl h-72" />
                    ))}
                  </div>
                </div>
              ) : articles.length === 0 ? (
                <div className="text-center py-20">
                  <BookOpen className="w-12 h-12 text-gray-300 mx-auto mb-4" />
                  <h3 className="text-lg font-semibold text-gray-700 mb-2">
                    Belum Ada Artikel
                  </h3>
                  <p className="text-sm text-gray-400">
                    Artikel akan segera tersedia. Nantikan informasi menarik dari kami.
                  </p>
                </div>
              ) : (
                <>
                  {/* Featured Article */}
                  {featured && (
                    <FadeIn>
                      <Card className="card-lift border-silver-200/60 bg-white overflow-hidden group cursor-pointer">
                        <div className="grid grid-cols-1 sm:grid-cols-2">
                          <div className="relative h-56 sm:h-full overflow-hidden">
                            <img
                              src={featured.images?.[0] || "/images/placeholder-blog.jpg"}
                              alt={featured.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            <Badge className="absolute top-3 left-3 gradient-accent text-white text-xs border-0">
                              Featured
                            </Badge>
                          </div>
                          <CardContent className="p-6 flex flex-col justify-center">
                            {featured.category && (
                              <Badge
                                variant="secondary"
                                className="bg-indigo-50 text-indigo-600 text-xs w-fit mb-3"
                              >
                                {featured.category}
                              </Badge>
                            )}
                            <h3 className="text-xl font-bold text-gray-900 mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {featured.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-3 mb-4">
                              {featured.excerpt}
                            </p>
                            <div className="flex items-center gap-4 text-xs text-gray-400">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {featured.readTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {featured.views} views
                              </span>
                              <span>{featured.author}</span>
                            </div>
                          </CardContent>
                        </div>
                      </Card>
                    </FadeIn>
                  )}

                  {/* Blog Grid */}
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                    {remaining.map((article, i) => (
                      <FadeIn key={article.id} delay={i * 0.06}>
                        <Card className="card-lift border-silver-200/60 bg-white overflow-hidden h-full group cursor-pointer">
                          <div className="relative h-44 overflow-hidden">
                            <img
                              src={article.images?.[0] || "/images/placeholder-blog.jpg"}
                              alt={article.title}
                              className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                            />
                            {article.category && (
                              <Badge className="absolute top-3 left-3 gradient-accent text-white text-xs border-0">
                                {article.category}
                              </Badge>
                            )}
                          </div>
                          <CardContent className="p-5">
                            <div className="flex items-center gap-3 text-xs text-gray-400 mb-2.5">
                              <span className="flex items-center gap-1">
                                <Clock className="w-3 h-3" />
                                {article.readTime}
                              </span>
                              <span className="flex items-center gap-1">
                                <Eye className="w-3 h-3" />
                                {article.views}
                              </span>
                            </div>
                            <h3 className="font-semibold text-gray-900 text-base mb-2 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {article.title}
                            </h3>
                            <p className="text-sm text-gray-500 line-clamp-2">
                              {article.excerpt}
                            </p>
                          </CardContent>
                        </Card>
                      </FadeIn>
                    ))}
                  </div>

                  {/* Pagination */}
                  {totalPages > 1 && (
                    <FadeIn>
                      <div className="flex items-center justify-center gap-2 pt-4">
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page <= 1}
                          onClick={() => setPage(page - 1)}
                          className="border-silver-200"
                        >
                          <ChevronLeft className="w-4 h-4 mr-1" />
                          Prev
                        </Button>
                        {Array.from({ length: totalPages }).map((_, i) => (
                          <Button
                            key={i}
                            variant={page === i + 1 ? "default" : "outline"}
                            size="sm"
                            onClick={() => setPage(i + 1)}
                            className={
                              page === i + 1
                                ? "gradient-accent text-white border-0"
                                : "border-silver-200"
                            }
                          >
                            {i + 1}
                          </Button>
                        ))}
                        <Button
                          variant="outline"
                          size="sm"
                          disabled={page >= totalPages}
                          onClick={() => setPage(page + 1)}
                          className="border-silver-200"
                        >
                          Next
                          <ChevronRight className="w-4 h-4 ml-1" />
                        </Button>
                      </div>
                    </FadeIn>
                  )}
                </>
              )}
            </div>

            {/* ─── Sidebar ─── */}
            <div className="space-y-6">
              {/* Popular Posts */}
              <FadeIn delay={0.1}>
                <Card className="border-silver-200/60 bg-white">
                  <CardContent className="p-5">
                    <h4 className="font-semibold text-gray-900 mb-4 flex items-center gap-2">
                      <TrendingUp className="w-4 h-4 text-indigo-500" />
                      Postingan Populer
                    </h4>
                    <div className="space-y-4">
                      {popular.map((a, i) => (
                        <button
                          key={a.id}
                          className="flex items-start gap-3 text-left w-full group"
                        >
                          <span className="text-2xl font-bold text-silver-200 w-7 shrink-0">
                            {String(i + 1).padStart(2, "0")}
                          </span>
                          <div className="min-w-0">
                            <p className="text-sm font-medium text-gray-800 line-clamp-2 group-hover:text-indigo-600 transition-colors">
                              {a.title}
                            </p>
                            <span className="text-xs text-gray-400 flex items-center gap-1 mt-1">
                              <Eye className="w-3 h-3" />
                              {a.views}
                            </span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* CTA Sidebar */}
              <FadeIn delay={0.2}>
                <Card className="border-silver-200/60 gradient-accent text-white overflow-hidden">
                  <CardContent className="p-6">
                    <MessageCircle className="w-8 h-8 mb-3 opacity-80" />
                    <h4 className="font-bold text-lg mb-2">
                      Butuh Konsultasi?
                    </h4>
                    <p className="text-indigo-100 text-sm mb-5 leading-relaxed">
                      Tim ahli kami siap membantu Anda menemukan properti yang
                      tepat. Konsultasi gratis!
                    </p>
                    <Button
                      className="w-full bg-white text-indigo-600 hover:bg-indigo-50 font-semibold"
                      onClick={() =>
                        window.open(
                          `https://wa.me/${S.contact_wa}?text=Halo, saya ingin konsultasi properti di ${S.company_name}`,
                          "_blank"
                        )
                      }
                    >
                      <MessageCircle className="w-4 h-4 mr-1.5" />
                      Chat WhatsApp
                    </Button>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>
          </div>
        </div>
      </section>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   KONTAK VIEW
   ═══════════════════════════════════════════════════════════════ */

function KontakView({ navigate }: { navigate: (v: ViewName) => void }) {
  const S = useSettingsStore((s) => s.settings);
  const [form, setForm] = useState({
    name: "",
    phone: "",
    email: "",
    message: "",
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const text = `Halo, saya ${form.name}.\n\nPhone: ${form.phone}\nEmail: ${form.email}\n\n${form.message}`;
    window.open(`https://wa.me/${S.contact_wa}?text=${encodeURIComponent(text)}`, "_blank");
  };

  return (
    <motion.div {...pageTransition}>
      <PageHeader
        title="Kontak Kami"
        subtitle="Hubungi kami untuk konsultasi, pertanyaan, atau informasi lebih lanjut tentang properti kami."
        navigate={navigate}
      />

      <section className="py-12 sm:py-16 bg-silver-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
            {/* ─── Contact Form ─── */}
            <div className="lg:col-span-3">
              <FadeIn>
                <Card className="border-silver-200/60 bg-white">
                  <CardContent className="p-6 sm:p-8">
                    <h3 className="text-xl font-bold text-gray-900 mb-2">
                      Kirim Pesan
                    </h3>
                    <p className="text-sm text-gray-500 mb-6">
                      Isi formulir di bawah ini dan kami akan menghubungi Anda
                      melalui WhatsApp.
                    </p>

                    <form onSubmit={handleSubmit} className="space-y-5">
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                        <div className="space-y-2">
                          <Label htmlFor="name">Nama Lengkap</Label>
                          <Input
                            id="name"
                            placeholder="Masukkan nama Anda"
                            value={form.name}
                            onChange={(e) =>
                              setForm({ ...form, name: e.target.value })
                            }
                            required
                          />
                        </div>
                        <div className="space-y-2">
                          <Label htmlFor="phone">Nomor Telepon</Label>
                          <Input
                            id="phone"
                            placeholder="08xx-xxxx-xxxx"
                            value={form.phone}
                            onChange={(e) =>
                              setForm({ ...form, phone: e.target.value })
                            }
                            required
                          />
                        </div>
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="email">Email</Label>
                        <Input
                          id="email"
                          type="email"
                          placeholder="email@contoh.com"
                          value={form.email}
                          onChange={(e) =>
                            setForm({ ...form, email: e.target.value })
                          }
                          required
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="message">Pesan</Label>
                        <Textarea
                          id="message"
                          placeholder="Tulis pesan Anda di sini..."
                          rows={5}
                          value={form.message}
                          onChange={(e) =>
                            setForm({ ...form, message: e.target.value })
                          }
                          required
                        />
                      </div>
                      <Button
                        type="submit"
                        size="lg"
                        className="w-full sm:w-auto gradient-accent text-white btn-glow font-semibold"
                      >
                        <Send className="w-4 h-4 mr-2" />
                        Kirim via WhatsApp
                      </Button>
                    </form>
                  </CardContent>
                </Card>
              </FadeIn>
            </div>

            {/* ─── Info Cards ─── */}
            <div className="lg:col-span-2 space-y-5">
              {/* Phone */}
              <FadeIn delay={0.1}>
                <Card className="card-lift border-silver-200/60 bg-white">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Phone className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">
                        Telepon
                      </p>
                      <a
                        href={`tel:${S.contact_phone}`}
                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        {S.contact_phone}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Email */}
              <FadeIn delay={0.15}>
                <Card className="card-lift border-silver-200/60 bg-white">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <Mail className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">
                        Email
                      </p>
                      <a
                        href={`mailto:${S.contact_email}`}
                        className="text-sm text-gray-500 hover:text-indigo-600 transition-colors"
                      >
                        {S.contact_email}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* WhatsApp */}
              <FadeIn delay={0.2}>
                <Card className="card-lift border-silver-200/60 bg-white">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-green-50 flex items-center justify-center shrink-0">
                      <MessageCircle className="w-5 h-5 text-green-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">
                        WhatsApp
                      </p>
                      <a
                        href={`https://wa.me/${S.contact_wa}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="text-sm text-gray-500 hover:text-green-600 transition-colors"
                      >
                        +{S.contact_wa}
                      </a>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Address */}
              <FadeIn delay={0.25}>
                <Card className="card-lift border-silver-200/60 bg-white">
                  <CardContent className="p-5 flex items-start gap-4">
                    <div className="w-11 h-11 rounded-xl bg-indigo-50 flex items-center justify-center shrink-0">
                      <MapPin className="w-5 h-5 text-indigo-600" />
                    </div>
                    <div>
                      <p className="font-semibold text-gray-900 text-sm mb-0.5">
                        Alamat
                      </p>
                      <p className="text-sm text-gray-500">{S.contact_address}</p>
                    </div>
                  </CardContent>
                </Card>
              </FadeIn>

              {/* Social Media */}
              {(S.social_instagram || S.social_facebook || S.social_youtube || S.social_tiktok) && (
                <FadeIn delay={0.3}>
                  <Card className="border-silver-200/60 bg-white">
                    <CardContent className="p-5">
                      <h4 className="font-semibold text-gray-900 text-sm mb-4">
                        Media Sosial
                      </h4>
                      <div className="flex items-center gap-3">
                        {S.social_instagram && (
                          <a
                            href={`https://instagram.com/${S.social_instagram}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-silver-50 hover:bg-indigo-50 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
                            aria-label="Instagram"
                          >
                            <Instagram className="w-5 h-5" />
                          </a>
                        )}
                        {S.social_facebook && (
                          <a
                            href={S.social_facebook}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-silver-50 hover:bg-indigo-50 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
                            aria-label="Facebook"
                          >
                            <Facebook className="w-5 h-5" />
                          </a>
                        )}
                        {S.social_youtube && (
                          <a
                            href={S.social_youtube}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-silver-50 hover:bg-indigo-50 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
                            aria-label="YouTube"
                          >
                            <Youtube className="w-5 h-5" />
                          </a>
                        )}
                        {S.social_tiktok && (
                          <a
                            href={`https://tiktok.com/@${S.social_tiktok}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="w-10 h-10 rounded-xl bg-silver-50 hover:bg-indigo-50 flex items-center justify-center text-gray-500 hover:text-indigo-600 transition-colors"
                            aria-label="TikTok"
                          >
                            <svg
                              className="w-5 h-5"
                              viewBox="0 0 24 24"
                              fill="currentColor"
                            >
                              <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1v-3.5a6.37 6.37 0 00-.79-.05A6.34 6.34 0 003.15 15.2a6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.34-6.34V9.3a8.2 8.2 0 004.76 1.52v-3.4a4.85 4.85 0 01-1-.73z" />
                            </svg>
                          </a>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                </FadeIn>
              )}
            </div>
          </div>
        </div>
      </section>

      {/* ─── Map ─── */}
      <section className="py-12 sm:py-16 bg-white">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <h3 className="text-2xl font-bold text-gray-900 mb-6 text-center">
              Lokasi <span className="text-gradient-accent">Kami</span>
            </h3>
          </FadeIn>
          <FadeIn delay={0.1}>
            <div className="rounded-2xl overflow-hidden shadow-lg border border-silver-200/60">
              <MapWrapper
                latitude={S.map_latitude}
                longitude={S.map_longitude}
                companyName={S.company_name}
              />
            </div>
          </FadeIn>
        </div>
      </section>

      {/* ─── FAQ ─── */}
      <section className="py-12 sm:py-16 bg-silver-50">
        <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8">
          <FadeIn>
            <div className="text-center mb-10">
              <h3 className="text-2xl font-bold text-gray-900 mb-2">
                Pertanyaan <span className="text-gradient-accent">Umum</span>
              </h3>
              <p className="text-sm text-gray-500">
                Jawaban untuk pertanyaan yang sering diajukan.
              </p>
            </div>
          </FadeIn>

          <FadeIn delay={0.1}>
            <Accordion type="single" collapsible className="space-y-3">
              {[
                {
                  q: "Bagaimana cara membeli properti di sini?",
                  a: "Anda dapat langsung menghubungi tim sales kami melalui WhatsApp atau mengunjungi kantor pemasaran kami. Tim kami akan membantu Anda dari proses pemilihan unit hingga serah terima kunci.",
                },
                {
                  q: "Apakah tersedia skema pembayaran cicilan?",
                  a: "Ya, kami menyediakan berbagai pilihan skema pembayaran mulai dari KPR Bank, pembayaran syariah, hingga cicilan langsung ke developer dengan tenor yang fleksibel.",
                },
                {
                  q: "Bagaimana status legalitas sertifikat?",
                  a: "Seluruh properti kami memiliki legalitas yang jelas dan lengkap, termasuk sertifikat SHM/SHGB, IMB, dan dokumen perizinan lainnya sesuai ketentuan pemerintah.",
                },
                {
                  q: "Apakah bisa melakukan kunjungan ke lokasi?",
                  a: "Tentu saja! Anda bisa menjadwalkan kunjungan ke lokasi proyek kami. Hubungi tim marketing untuk membuat janji dan kami akan mengatur kunjungan Anda.",
                },
                {
                  q: "Berapa lama proses serah terima?",
                  a: "Waktu serah terima bervariasi tergantung tipe unit dan kondisi proyek. Untuk unit ready stock, serah terima bisa dilakukan dalam waktu 1-2 bulan setelah proses administrasi selesai.",
                },
              ].map((faq, i) => (
                <AccordionItem
                  key={i}
                  value={`faq-${i}`}
                  className="bg-white border border-silver-200/60 rounded-xl px-5 overflow-hidden"
                >
                  <AccordionTrigger className="text-sm font-semibold text-gray-900 hover:no-underline py-4">
                    {faq.q}
                  </AccordionTrigger>
                  <AccordionContent className="text-sm text-gray-500 leading-relaxed pb-4">
                    {faq.a}
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </FadeIn>
        </div>
      </section>
    </motion.div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   PAGE CONTENT (Router + View Switcher)
   ═══════════════════════════════════════════════════════════════ */

function PageContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const activeView = (searchParams.get("beranda") !== null
    ? "beranda"
    : searchParams.get("tentang") !== null
    ? "tentang"
    : searchParams.get("mitra") !== null
    ? "mitra"
    : searchParams.get("blog") !== null
    ? "blog"
    : searchParams.get("kontak") !== null
    ? "kontak"
    : "beranda") as ViewName;

  const { fetchSettings } = useSettingsStore();
  const { fetchProperties } = usePropertyStore();
  const { fetchArticles } = useBlogStore();
  const { fetchTestimonials } = useTestimonialStore();

  const navigate = useCallback(
    (view: ViewName) => {
      router.push(`/?${view}`);
      window.scrollTo({ top: 0, behavior: "smooth" });
    },
    [router]
  );

  useEffect(() => {
    fetchSettings();
    fetchProperties();
    fetchArticles();
    fetchTestimonials();
  }, [fetchSettings, fetchProperties, fetchArticles, fetchTestimonials]);

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <Navbar activeView={activeView} navigate={navigate} />

      <main className="flex-1">
        <AnimatePresence mode="wait">
          {activeView === "beranda" && (
            <BerandaView key="beranda" navigate={navigate} />
          )}
          {activeView === "tentang" && (
            <TentangView key="tentang" navigate={navigate} />
          )}
          {activeView === "mitra" && (
            <MitraView key="mitra" navigate={navigate} />
          )}
          {activeView === "blog" && <BlogView key="blog" navigate={navigate} />}
          {activeView === "kontak" && (
            <KontakView key="kontak" navigate={navigate} />
          )}
        </AnimatePresence>
      </main>

      <Footer navigate={navigate} />

      <Chatbot />
    </div>
  );
}

/* ═══════════════════════════════════════════════════════════════
   DEFAULT EXPORT
   ═══════════════════════════════════════════════════════════════ */

export default function HomePage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-background">
          <div className="text-center">
            <div className="inline-block w-10 h-10 border-4 border-indigo-200 border-t-indigo-600 rounded-full animate-spin mb-3" />
            <p className="text-sm text-gray-400">Memuat halaman...</p>
          </div>
        </div>
      }
    >
      <PageContent />
    </Suspense>
  );
}
