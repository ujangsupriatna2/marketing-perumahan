"use client";

import { useState, useMemo, useCallback } from "react";
import {
  Calculator,
  Building2,
  Percent,
  Clock,
  Banknote,
  TrendingDown,
  TrendingUp,
  Copy,
  Check,
  RotateCcw,
  ArrowRight,
  Info,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "sonner";

// ──── Helpers ────
function formatRupiah(amount: number): string {
  return new Intl.NumberFormat("id-ID").format(Math.round(amount));
}

function formatJuta(amount: number): string {
  return (amount / 1_000_000).toFixed(1);
}

// KPR flat rate calculation
function calcKPRMonthlyFlat(
  loanAmount: number,
  annualRate: number,
  tenorYears: number
): number {
  const totalMonths = tenorYears * 12;
  const totalInterest = loanAmount * (annualRate / 100) * tenorYears;
  return (loanAmount + totalInterest) / totalMonths;
}

// KPR annuity (effective rate) — more realistic
function calcKPRMonthlyAnnuity(
  loanAmount: number,
  annualRate: number,
  tenorYears: number
): number {
  const monthlyRate = annualRate / 100 / 12;
  const totalMonths = tenorYears * 12;
  if (monthlyRate === 0) return loanAmount / totalMonths;
  return (
    (loanAmount * monthlyRate * Math.pow(1 + monthlyRate, totalMonths)) /
    (Math.pow(1 + monthlyRate, totalMonths) - 1)
  );
}

// Syariah: flat profit margin
function calcSyariahMonthly(
  propertyPrice: number,
  dpPercent: number,
  profitMarginPercent: number,
  tenorYears: number
): number {
  const dpAmount = propertyPrice * (dpPercent / 100);
  const sellingPrice = propertyPrice * (1 + profitMarginPercent / 100);
  const loanAmount = sellingPrice - dpAmount;
  const totalMonths = tenorYears * 12;
  return loanAmount / totalMonths;
}

// ──── KPR Calculator Component ────
function KPRCalculator() {
  const [price, setPrice] = useState<string>("575000000");
  const [dpPercent, setDpPercent] = useState<string>("20");
  const [tenor, setTenor] = useState<string>("10");
  const [rate, setRate] = useState<string>("8.5");
  const [rateType, setRateType] = useState<"flat" | "annuity">("annuity");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(price) || 0;
    const dp = parseFloat(dpPercent) || 0;
    const t = parseFloat(tenor) || 1;
    const r = parseFloat(rate) || 0;

    const dpAmount = p * (dp / 100);
    const loanAmount = p - dpAmount;
    const monthly =
      rateType === "flat"
        ? calcKPRMonthlyFlat(loanAmount, r, t)
        : calcKPRMonthlyAnnuity(loanAmount, r, t);

    const totalPayment = monthly * t * 12;
    const totalInterest = totalPayment - loanAmount;

    return {
      propertyPrice: p,
      dpAmount,
      dpPercent: dp,
      loanAmount,
      monthly,
      tenorYears: t,
      totalPayment,
      totalInterest,
      annualRate: r,
    };
  }, [price, dpPercent, tenor, rate, rateType]);

  const copyResult = () => {
    const text = `KPR ${rateType.toUpperCase()} — ${formatJuta(result.propertyPrice)}jt, DP ${result.dpPercent}% (${formatRupiah(result.dpAmount)}), ${result.tenorYears}thn @${result.annualRate}% → Cicilan: Rp ${formatRupiah(result.monthly)}/bln`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetForm = () => {
    setPrice("575000000");
    setDpPercent("20");
    setTenor("10");
    setRate("8.5");
    setRateType("annuity");
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-red-100 flex items-center justify-center">
              <Banknote className="w-4 h-4 text-red-600" />
            </div>
            KPR Bank
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Harga Properti (Rp)
              </Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(parseFloat(price) || 0)} ({formatJuta(parseFloat(price) || 0)} jt)
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Percent className="w-3.5 h-3.5 text-gray-400" />
                Uang Muka (DP)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={dpPercent}
                  onChange={(e) => setDpPercent(e.target.value)}
                  className="text-lg font-semibold"
                />
                <span className="text-gray-400 font-medium">%</span>
              </div>
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(result.dpAmount)} ({formatJuta(result.dpAmount)} jt)
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Jangka Waktu (Tenor)
              </Label>
              <div className="flex items-center gap-2">
                <Select value={tenor} onValueChange={setTenor}>
                  <SelectTrigger className="text-lg font-semibold">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {[5, 10, 15, 20, 25, 30].map((t) => (
                      <SelectItem key={t} value={String(t)}>
                        {t} Tahun ({t * 12} bulan)
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                Suku Bunga Pertahun
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.1"
                  value={rate}
                  onChange={(e) => setRate(e.target.value)}
                  className="text-lg font-semibold"
                />
                <span className="text-gray-400 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Rate type */}
          <div className="flex items-center gap-4 p-3 bg-red-50 rounded-lg">
            <span className="text-xs font-medium text-red-700">Tipe Bunga:</span>
            <div className="flex gap-2">
              {(["flat", "annuity"] as const).map((t) => (
                <button
                  key={t}
                  onClick={() => setRateType(t)}
                  className={`px-3 py-1.5 rounded-md text-xs font-medium transition-all ${
                    rateType === t
                      ? "bg-red-600 text-white shadow-sm"
                      : "bg-white text-red-600 border border-red-200 hover:bg-red-100"
                  }`}
                >
                  {t === "flat" ? "Flat" : "Anuitas (Efektif)"}
                </button>
              ))}
            </div>
            <div className="flex items-start gap-1 ml-auto">
              <Info className="w-3.5 h-3.5 text-red-400 mt-0.5 shrink-0" />
              <p className="text-[11px] text-red-600 leading-relaxed">
                {rateType === "flat"
                  ? "Flat: cicilan tetap, bunga dihitung dari pinjaman awal"
                  : "Anuitas: cicilan tetap, bunga dihitung dari sisa pinjaman (lebih realistis)"}
              </p>
            </div>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center mr-1">Preset:</span>
            {[
              { label: "Bunga 7%", rate: "7" },
              { label: "Bunga 8.5%", rate: "8.5" },
              { label: "Bunga 10%", rate: "10" },
              { label: "Bunga 12%", rate: "12" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setRate(preset.rate)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  rate === preset.rate
                    ? "bg-red-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-red-600 via-red-700 to-rose-800 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-red-200 text-sm font-medium">Cicilan per Bulan</p>
              <p className="text-3xl font-bold mt-1">
                Rp {formatRupiah(result.monthly)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyResult}
                className="text-red-200 hover:text-white hover:bg-red-500/30"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="text-red-200 hover:text-white hover:bg-red-500/30"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Harga Properti</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.propertyPrice)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Uang Muka</p>
              <p className="text-sm font-semibold mt-0.5">{result.dpPercent}% ({formatJuta(result.dpAmount)} jt)</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Jumlah Pinjaman</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.loanAmount)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-red-200 text-[11px]">Total Bayar</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.totalPayment)} jt</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-red-500/20 rounded-lg px-3 py-2">
            <TrendingUp className="w-4 h-4 text-red-300" />
            <p className="text-sm">
              Total bunga: <span className="font-bold">Rp {formatRupiah(result.totalInterest)}</span> ({formatJuta(result.totalInterest)} jt) selama {result.tenorYears} tahun
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Comparison Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="w-4 h-4 text-gray-400" />
            Perbandingan Cepat — Sama-sama DP {dpPercent}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-left">Tenor</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">5 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">10 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">15 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">20 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">25 thn</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700 text-xs">Cicilan/bln</td>
                  {[5, 10, 15, 20, 25].map((t) => {
                    const dp = parseFloat(dpPercent) || 0;
                    const p = parseFloat(price) || 0;
                    const r = parseFloat(rate) || 0;
                    const loan = p - p * (dp / 100);
                    const monthly =
                      rateType === "flat"
                        ? calcKPRMonthlyFlat(loan, r, t)
                        : calcKPRMonthlyAnnuity(loan, r, t);
                    return (
                      <td key={t} className="px-4 py-3 text-center font-semibold text-gray-800">
                        {formatJuta(monthly)} jt
                      </td>
                    );
                  })}
                </tr>
                <tr className="border-t border-gray-100 bg-gray-50/50">
                  <td className="px-4 py-2.5 font-medium text-gray-500 text-xs">Total bunga</td>
                  {[5, 10, 15, 20, 25].map((t) => {
                    const dp = parseFloat(dpPercent) || 0;
                    const p = parseFloat(price) || 0;
                    const r = parseFloat(rate) || 0;
                    const loan = p - p * (dp / 100);
                    const monthly =
                      rateType === "flat"
                        ? calcKPRMonthlyFlat(loan, r, t)
                        : calcKPRMonthlyAnnuity(loan, r, t);
                    const totalPay = monthly * t * 12;
                    const interest = totalPay - loan;
                    return (
                      <td key={t} className="px-4 py-2.5 text-center text-xs text-red-500">
                        {formatJuta(interest)} jt
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Bunga {rate}% ({rateType === "flat" ? "flat" : "anuitas"}), harga Rp {formatRupiah(parseFloat(price) || 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ──── Syariah Calculator Component ────
function SyariahCalculator() {
  const [price, setPrice] = useState<string>("575000000");
  const [dpPercent, setDpPercent] = useState<string>("30");
  const [tenor, setTenor] = useState<string>("5");
  const [margin, setMargin] = useState<string>("15");
  const [copied, setCopied] = useState(false);

  const result = useMemo(() => {
    const p = parseFloat(price) || 0;
    const dp = parseFloat(dpPercent) || 0;
    const t = parseFloat(tenor) || 1;
    const m = parseFloat(margin) || 0;

    const dpAmount = p * (dp / 100);
    const sellingPrice = p * (1 + m / 100);
    const loanAmount = sellingPrice - dpAmount;
    const monthly = loanAmount / (t * 12);
    const totalPayment = loanAmount;
    const profitAmount = p * (m / 100);

    return {
      propertyPrice: p,
      dpAmount,
      dpPercent: dp,
      sellingPrice,
      loanAmount,
      monthly,
      tenorYears: t,
      totalPayment,
      profitAmount,
      marginPercent: m,
    };
  }, [price, dpPercent, tenor, margin]);

  const copyResult = () => {
    const text = `Syariah — ${formatJuta(result.propertyPrice)}jt, DP ${result.dpPercent}% ({formatJuta(result.dpAmount)}jt), ${result.tenorYears}thn margin ${result.marginPercent}% → Cicilan: Rp ${formatRupiah(result.monthly)}/bln`;
    navigator.clipboard.writeText(text).then(() => {
      setCopied(true);
      toast.success("Disalin ke clipboard!");
      setTimeout(() => setCopied(false), 2000);
    });
  };

  const resetForm = () => {
    setPrice("575000000");
    setDpPercent("30");
    setTenor("5");
    setMargin("15");
  };

  return (
    <div className="space-y-6">
      {/* Input Card */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-4">
          <CardTitle className="flex items-center gap-2 text-lg">
            <div className="w-8 h-8 rounded-lg bg-amber-100 flex items-center justify-center">
              <Building2 className="w-4 h-4 text-amber-600" />
            </div>
            Pembiayaan Syariah (Murabahah)
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Building2 className="w-3.5 h-3.5 text-gray-400" />
                Harga Properti (Rp)
              </Label>
              <Input
                type="number"
                value={price}
                onChange={(e) => setPrice(e.target.value)}
                className="text-lg font-semibold"
              />
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(parseFloat(price) || 0)} ({formatJuta(parseFloat(price) || 0)} jt)
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Percent className="w-3.5 h-3.5 text-gray-400" />
                Uang Muka (DP)
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  value={dpPercent}
                  onChange={(e) => setDpPercent(e.target.value)}
                  className="text-lg font-semibold"
                />
                <span className="text-gray-400 font-medium">%</span>
              </div>
              <p className="text-xs text-gray-400">
                Rp {formatRupiah(result.dpAmount)} ({formatJuta(result.dpAmount)} jt)
              </p>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <Clock className="w-3.5 h-3.5 text-gray-400" />
                Jangka Waktu (Tenor)
              </Label>
              <Select value={tenor} onValueChange={setTenor}>
                <SelectTrigger className="text-lg font-semibold">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {[1, 2, 3, 4, 5, 7, 10, 15, 20].map((t) => (
                    <SelectItem key={t} value={String(t)}>
                      {t} Tahun ({t * 12} bulan)
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="flex items-center gap-1.5 text-sm font-medium">
                <TrendingUp className="w-3.5 h-3.5 text-gray-400" />
                Margin Keuntungan Bank
              </Label>
              <div className="flex items-center gap-2">
                <Input
                  type="number"
                  step="0.5"
                  value={margin}
                  onChange={(e) => setMargin(e.target.value)}
                  className="text-lg font-semibold"
                />
                <span className="text-gray-400 font-medium">%</span>
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="flex items-start gap-2 p-3 bg-amber-50 rounded-lg">
            <Info className="w-3.5 h-3.5 text-amber-500 mt-0.5 shrink-0" />
            <p className="text-[11px] text-amber-700 leading-relaxed">
              <strong>Akad Murabahah</strong> — Bank membeli properti lalu menjualnya ke Anda dengan harga yang sudah ditentukan (margin). Cicilan tetap flat setiap bulan, tanpa bunga fluktuatif.
            </p>
          </div>

          {/* Quick presets */}
          <div className="flex flex-wrap gap-2">
            <span className="text-xs text-gray-400 self-center mr-1">Margin:</span>
            {[
              { label: "10%", margin: "10" },
              { label: "12.5%", margin: "12.5" },
              { label: "15%", margin: "15" },
              { label: "20%", margin: "20" },
              { label: "25%", margin: "25" },
            ].map((preset) => (
              <button
                key={preset.label}
                onClick={() => setMargin(preset.margin)}
                className={`px-2.5 py-1 rounded-md text-xs font-medium transition-all ${
                  margin === preset.margin
                    ? "bg-amber-600 text-white"
                    : "bg-gray-100 text-gray-500 hover:bg-gray-200"
                }`}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Result Card */}
      <Card className="border-0 shadow-sm bg-gradient-to-br from-amber-500 via-amber-600 to-yellow-700 text-white">
        <CardContent className="p-6">
          <div className="flex items-start justify-between mb-4">
            <div>
              <p className="text-amber-200 text-sm font-medium">Cicilan per Bulan</p>
              <p className="text-3xl font-bold mt-1">
                Rp {formatRupiah(result.monthly)}
              </p>
            </div>
            <div className="flex gap-2">
              <Button
                variant="ghost"
                size="icon"
                onClick={copyResult}
                className="text-amber-200 hover:text-white hover:bg-amber-500/30"
              >
                {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
              </Button>
              <Button
                variant="ghost"
                size="icon"
                onClick={resetForm}
                className="text-amber-200 hover:text-white hover:bg-amber-500/30"
              >
                <RotateCcw className="w-4 h-4" />
              </Button>
            </div>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mt-6">
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Harga Properti</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.propertyPrice)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Uang Muka</p>
              <p className="text-sm font-semibold mt-0.5">{result.dpPercent}% ({formatJuta(result.dpAmount)} jt)</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Harga Jual Bank</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.sellingPrice)} jt</p>
            </div>
            <div className="bg-white/10 rounded-xl p-3">
              <p className="text-amber-200 text-[11px]">Margin Bank</p>
              <p className="text-sm font-semibold mt-0.5">{formatJuta(result.profitAmount)} jt</p>
            </div>
          </div>

          <div className="mt-4 flex items-center gap-2 bg-white/15 rounded-lg px-3 py-2">
            <Info className="w-4 h-4 text-amber-200" />
            <p className="text-sm">
              Cicilan <strong>FLAT</strong> — tidak berubah selama {result.tenorYears} tahun. Tanpa bunga, tanpa denda.
            </p>
          </div>
        </CardContent>
      </Card>

      {/* Quick Comparison Table */}
      <Card className="border-0 shadow-sm">
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center gap-2 text-base">
            <TrendingDown className="w-4 h-4 text-gray-400" />
            Perbandingan Cepat — DP {dpPercent}%, Margin {margin}%
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto rounded-lg border border-gray-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-gray-50">
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-left">Tenor</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">1 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">2 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">3 thn</th>
                  <th className="px-4 py-2.5 text-xs font-semibold text-gray-500 text-center">5 thn</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-gray-100">
                  <td className="px-4 py-3 font-medium text-gray-700 text-xs">Cicilan/bln</td>
                  {[1, 2, 3, 5].map((t) => {
                    const dp = parseFloat(dpPercent) || 0;
                    const p = parseFloat(price) || 0;
                    const m = parseFloat(margin) || 0;
                    const monthly = calcSyariahMonthly(p, dp, m, t);
                    return (
                      <td key={t} className="px-4 py-3 text-center font-semibold text-gray-800">
                        {formatJuta(monthly)} jt
                      </td>
                    );
                  })}
                </tr>
              </tbody>
            </table>
          </div>
          <p className="text-[11px] text-gray-400 mt-2">
            Margin {margin}%, harga Rp {formatRupiah(parseFloat(price) || 0)}
          </p>
        </CardContent>
      </Card>
    </div>
  );
}

// ──── Main Page ────
export default function KalkulatorPage() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
          <Calculator className="w-6 h-6" />
          Kalkulator Cicilan
        </h1>
        <p className="text-sm text-gray-500 mt-1">
          Hitung simulasi cicilan KPR Bank & Syariah — hasilnya bisa langsung diisi ke grid cicilan proyek
        </p>
      </div>

      <Tabs defaultValue="kpr" className="w-full">
        <TabsList className="w-full max-w-md grid grid-cols-2">
          <TabsTrigger value="kpr" className="gap-1.5">
            <Banknote className="w-4 h-4" />
            KPR Bank
          </TabsTrigger>
          <TabsTrigger value="syariah" className="gap-1.5">
            <Building2 className="w-4 h-4" />
            Syariah
          </TabsTrigger>
        </TabsList>

        <TabsContent value="kpr" className="mt-6">
          <KPRCalculator />
        </TabsContent>

        <TabsContent value="syariah" className="mt-6">
          <SyariahCalculator />
        </TabsContent>
      </Tabs>
    </div>
  );
}
