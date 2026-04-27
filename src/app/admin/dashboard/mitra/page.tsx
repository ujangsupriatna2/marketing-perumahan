"use client";

import { useState, useEffect, useCallback } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import {
  Building2, Plus, Search, Edit2, Trash2, Eye, EyeOff,
  Globe, Palette, MapPin, Phone, Mail, Users, Home, FileText, Star, Image, Landmark
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select, SelectContent, SelectItem, SelectTrigger, SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";
import ImageUpload from "@/components/admin/image-upload";

interface Mitra {
  id: string;
  name: string;
  slug: string;
  subdomain: string;
  logo: string;
  description: string;
  address: string;
  phone: string;
  email: string;
  website: string;
  primaryColor: string;
  accentColor: string;
  isActive: boolean;
  _count: {
    admins: number;
    properties: number;
    blogPosts: number;
    testimonials: number;
    galleryItems: number;
    banks: number;
  };
}

const emptyForm = {
  name: "", slug: "", subdomain: "", logo: "", description: "",
  address: "", phone: "", email: "", website: "",
  primaryColor: "#dc2626", accentColor: "#f59e0b", isActive: true,
};

function slugify(text: string): string {
  return text.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
}

export default function MitraPage() {
  const { data: session } = useSession();
  const router = useRouter();
  const [mitraList, setMitraList] = useState<Mitra[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState<string | null>(null);

  const fetchMitra = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/admin/mitra?search=${encodeURIComponent(search)}`);
      const data = await res.json();
      if (data.mitra) setMitraList(data.mitra);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }, [search]);

  useEffect(() => { fetchMitra(); }, [fetchMitra]);

  const openCreate = () => {
    setEditingId(null);
    setForm(emptyForm);
    setDialogOpen(true);
  };

  const openEdit = (m: Mitra) => {
    setEditingId(m.id);
    setForm({
      name: m.name, slug: m.slug, subdomain: m.subdomain, logo: m.logo,
      description: m.description, address: m.address, phone: m.phone,
      email: m.email, website: m.website, primaryColor: m.primaryColor,
      accentColor: m.accentColor, isActive: m.isActive,
    });
    setDialogOpen(true);
  };

  const handleSave = async () => {
    if (!form.name || !form.slug || !form.subdomain) return;
    setSaving(true);
    try {
      const url = editingId ? `/api/admin/mitra/${editingId}` : "/api/admin/mitra";
      const method = editingId ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(form),
      });
      if (res.ok) {
        setDialogOpen(false);
        fetchMitra();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menyimpan");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("Yakin hapus mitra ini? Semua data terkait akan kehilangan referensi mitra.")) return;
    setDeleting(id);
    try {
      const res = await fetch(`/api/admin/mitra/${id}`, { method: "DELETE" });
      if (res.ok) {
        fetchMitra();
      } else {
        const data = await res.json();
        alert(data.error || "Gagal menghapus");
      }
    } catch {
      alert("Terjadi kesalahan");
    } finally {
      setDeleting(null);
    }
  };

  const toggleActive = async (m: Mitra) => {
    try {
      const res = await fetch(`/api/admin/mitra/${m.id}`, {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...m, isActive: !m.isActive }),
      });
      if (res.ok) fetchMitra();
    } catch {
      alert("Gagal mengubah status");
    }
  };

  if (session?.user?.role !== "superadmin") {
    router.push("/admin/dashboard");
    return null;
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Mitra Perumahan</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola mitra yang terdaftar di platform</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white">
          <Plus className="w-4 h-4 mr-2" /> Tambah Mitra
        </Button>
      </div>

      {/* Search */}
      <div className="relative max-w-sm">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
        <Input
          placeholder="Cari mitra..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="pl-10"
        />
      </div>

      {/* Mitra Grid */}
      {loading ? (
        <div className="text-center py-12 text-gray-400">Memuat data...</div>
      ) : mitraList.length === 0 ? (
        <Card>
          <CardContent className="text-center py-12">
            <Building2 className="w-12 h-12 text-gray-300 mx-auto mb-3" />
            <p className="text-gray-500">Belum ada mitra</p>
            <Button onClick={openCreate} variant="outline" className="mt-3">
              <Plus className="w-4 h-4 mr-2" /> Tambah Mitra Pertama
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4">
          {mitraList.map((m) => (
            <Card key={m.id} className="relative overflow-hidden">
              {!m.isActive && (
                <div className="absolute top-3 right-3 z-10">
                  <Badge variant="secondary" className="bg-gray-100 text-gray-500">Nonaktif</Badge>
                </div>
              )}
              <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                  {m.logo ? (
                    <img src={m.logo} alt={m.name} className="w-12 h-12 rounded-lg object-cover" />
                  ) : (
                    <div className="w-12 h-12 rounded-lg flex items-center justify-center text-white font-bold text-lg" style={{ backgroundColor: m.primaryColor }}>
                      {m.name.charAt(0).toUpperCase()}
                    </div>
                  )}
                  <div className="min-w-0">
                    <CardTitle className="text-base truncate">{m.name}</CardTitle>
                    <p className="text-xs text-gray-400">{m.subdomain}.perumahan-paling-murah.vercel.app</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-sm text-gray-600 line-clamp-2">{m.description || "Belum ada deskripsi"}</p>

                {/* Stats */}
                <div className="grid grid-cols-3 gap-2 text-center">
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Home className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                    <p className="text-xs font-semibold">{m._count.properties}</p>
                    <p className="text-[10px] text-gray-400">Proyek</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Users className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                    <p className="text-xs font-semibold">{m._count.admins}</p>
                    <p className="text-[10px] text-gray-400">Admin</p>
                  </div>
                  <div className="bg-gray-50 rounded-lg p-2">
                    <Star className="w-3.5 h-3.5 mx-auto text-gray-400 mb-0.5" />
                    <p className="text-xs font-semibold">{m._count.testimonials}</p>
                    <p className="text-[10px] text-gray-400">Testi</p>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center gap-2 pt-2 border-t">
                  <Button variant="outline" size="sm" onClick={() => openEdit(m)} className="flex-1">
                    <Edit2 className="w-3.5 h-3.5 mr-1" /> Edit
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => toggleActive(m)} className="flex-1">
                    {m.isActive ? <><EyeOff className="w-3.5 h-3.5 mr-1" /> Nonaktif</> : <><Eye className="w-3.5 h-3.5 mr-1" /> Aktif</>}
                  </Button>
                  <Button variant="outline" size="sm" onClick={() => handleDelete(m.id)} disabled={deleting === m.id} className="text-red-500 hover:text-red-600 hover:bg-red-50">
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
        <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editingId ? "Edit Mitra" : "Tambah Mitra Baru"}</DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            {/* Logo */}
            <div>
              <Label>Logo</Label>
              <ImageUpload value={form.logo} onChange={(v) => setForm({ ...form, logo: v })} maxImages={1} />
            </div>

            {/* Basic Info */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Nama Perumahan *</Label>
                <Input value={form.name} onChange={(e) => {
                  setForm({ ...form, name: e.target.value, slug: slugify(e.target.value) });
                }} placeholder="Bandung Raya Residence" />
              </div>
              <div className="space-y-2">
                <Label>Subdomain *</Label>
                <Input value={form.subdomain} onChange={(e) => setForm({ ...form, subdomain: slugify(e.target.value) })} placeholder="brr" />
                <p className="text-[10px] text-gray-400">brr.perumahan-paling-murah.vercel.app</p>
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label>Slug (URL Path)</Label>
                <Input value={form.slug} onChange={(e) => setForm({ ...form, slug: slugify(e.target.value) })} placeholder="bandung-raya-residence" />
              </div>
            </div>

            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} placeholder="Deskripsi singkat perumahan..." />
            </div>

            {/* Contact */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><Phone className="w-3.5 h-3.5 inline mr-1" /> Telepon</Label>
                <Input value={form.phone} onChange={(e) => setForm({ ...form, phone: e.target.value })} placeholder="08123456789" />
              </div>
              <div className="space-y-2">
                <Label><Mail className="w-3.5 h-3.5 inline mr-1" /> Email</Label>
                <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} placeholder="info@brr.co.id" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label><MapPin className="w-3.5 h-3.5 inline mr-1" /> Alamat</Label>
                <Input value={form.address} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Jl. Raya Bandung No. 123" />
              </div>
              <div className="space-y-2 sm:col-span-2">
                <Label><Globe className="w-3.5 h-3.5 inline mr-1" /> Website</Label>
                <Input value={form.website} onChange={(e) => setForm({ ...form, website: e.target.value })} placeholder="https://brr.co.id" />
              </div>
            </div>

            {/* Colors */}
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label><Palette className="w-3.5 h-3.5 inline mr-1" /> Warna Utama</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={form.primaryColor} onChange={(e) => setForm({ ...form, primaryColor: e.target.value })} className="flex-1" />
                </div>
              </div>
              <div className="space-y-2">
                <Label><Palette className="w-3.5 h-3.5 inline mr-1" /> Warna Aksen</Label>
                <div className="flex items-center gap-2">
                  <input type="color" value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="w-10 h-10 rounded cursor-pointer border-0" />
                  <Input value={form.accentColor} onChange={(e) => setForm({ ...form, accentColor: e.target.value })} className="flex-1" />
                </div>
              </div>
            </div>

            {/* Active Toggle */}
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <Label>Status Aktif</Label>
              <Switch checked={form.isActive} onCheckedChange={(v) => setForm({ ...form, isActive: v })} />
            </div>

            {/* Save */}
            <div className="flex justify-end gap-2 pt-4">
              <Button variant="outline" onClick={() => setDialogOpen(false)}>Batal</Button>
              <Button onClick={handleSave} disabled={saving || !form.name || !form.slug || !form.subdomain} className="bg-indigo-600 hover:bg-indigo-700 text-white">
                {saving ? "Menyimpan..." : editingId ? "Update Mitra" : "Buat Mitra"}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
