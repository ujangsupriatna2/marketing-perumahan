"use client";

import { useEffect, useState, useCallback } from "react";
import { useSession } from "next-auth/react";
import { Plus, Pencil, Trash2, Search, Camera, Loader2, AlertCircle, Image as ImageIcon } from "lucide-react";
import ImageUpload from "@/components/admin/image-upload";
import { toast } from "sonner";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";

interface GalleryItem {
  id: string;
  title: string;
  category: string;
  image: string;
  description: string;
  sortOrder: number;
  mitraId: string | null;
  mitra?: { id: string; name: string } | null;
  createdAt: string;
}

interface MitraOption { id: string; name: string; }

const emptyForm = { title: "", category: "", image: "", description: "", sortOrder: "0", mitraId: "" };

export default function GalleryPage() {
  const { data: session } = useSession();
  const isSuperAdmin = session?.user?.role === "superadmin";
  const [items, setItems] = useState<GalleryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState("");
  const [filterMitra, setFilterMitra] = useState("");
  const [formOpen, setFormOpen] = useState(false);
  const [deleteOpen, setDeleteOpen] = useState(false);
  const [editing, setEditing] = useState<GalleryItem | null>(null);
  const [deleting, setDeleting] = useState<GalleryItem | null>(null);
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [mitraList, setMitraList] = useState<MitraOption[]>([]);

  const fetchMitraList = useCallback(async () => {
    try {
      const res = await fetch("/api/admin/mitra?limit=100");
      if (res.ok) {
        const data = await res.json();
        const raw = data.mitra ?? data;
        setMitraList(Array.isArray(raw) ? raw.map((m: { id: string; name: string }) => ({ id: m.id, name: m.name })) : []);
      }
    } catch { /* ignore */ }
  }, []);

  const fetchGallery = useCallback(async () => {
    try {
      const params = new URLSearchParams();
      if (filterMitra) params.set("mitraId", filterMitra);
      const q = params.toString() ? `?${params.toString()}` : "";
      const res = await fetch(`/api/admin/gallery${q}`);
      const data = await res.json();
      let list = data.items || [];
      if (search) {
        const s = search.toLowerCase();
        list = list.filter((i: GalleryItem) =>
          i.title.toLowerCase().includes(s) || i.category.toLowerCase().includes(s)
        );
      }
      setItems(list);
    } catch { /* ignore */ }
    setLoading(false);
  }, [search, filterMitra]);

  useEffect(() => { fetchGallery(); }, [fetchGallery]);
  useEffect(() => { if (isSuperAdmin) fetchMitraList(); }, [isSuperAdmin, fetchMitraList]);

  const openCreate = () => {
    setEditing(null);
    setForm({ ...emptyForm, mitraId: (session?.user as { mitraId?: string })?.mitraId || "" });
    setErrors({});
    setFormOpen(true);
  };

  const openEdit = (g: GalleryItem) => {
    setEditing(g);
    setForm({
      title: g.title, category: g.category, image: g.image,
      description: g.description, sortOrder: String(g.sortOrder),
      mitraId: g.mitraId || "",
    });
    setErrors({});
    setFormOpen(true);
  };

  const openDelete = (g: GalleryItem) => { setDeleting(g); setDeleteOpen(true); };

  const clearFieldError = (field: string) => {
    setErrors((prev) => {
      if (!prev[field]) return prev;
      const next = { ...prev };
      delete next[field];
      return next;
    });
  };

  const handleSave = async () => {
    const newErrors: Record<string, string> = {};
    if (!form.title.trim()) {
      newErrors.title = "Judul wajib diisi";
    }
    if (!form.image.trim()) {
      newErrors.image = "URL Gambar wajib diisi";
    }

    if (Object.keys(newErrors).length > 0) {
      setErrors(newErrors);
      return;
    }

    setSaving(true);
    try {
      const url = editing ? `/api/admin/gallery/${editing.id}` : "/api/admin/gallery";
      const method = editing ? "PUT" : "POST";
      const res = await fetch(url, {
        method,
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ ...form, mitraId: form.mitraId || null }),
      });
      if (!res.ok) { toast.error("Gagal menyimpan"); return; }
      toast.success(editing ? "Gallery berhasil diupdate" : "Gallery berhasil ditambahkan");
      setFormOpen(false);
      fetchGallery();
    } catch { toast.error("Terjadi kesalahan"); }
    finally { setSaving(false); }
  };

  const handleDelete = async () => {
    if (!deleting) return;
    try {
      const res = await fetch(`/api/admin/gallery/${deleting.id}`, { method: "DELETE" });
      if (!res.ok) { toast.error("Gagal menghapus"); return; }
      toast.success("Gallery berhasil dihapus");
      setDeleteOpen(false);
      fetchGallery();
    } catch { toast.error("Terjadi kesalahan"); }
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Gallery</h1>
          <p className="text-sm text-gray-500 mt-1">Kelola galeri foto</p>
        </div>
        <Button onClick={openCreate} className="bg-indigo-600 hover:bg-indigo-700 text-white gap-2">
          <Plus className="w-4 h-4" /> Tambah Foto
        </Button>
      </div>

      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input placeholder="Cari gallery..." value={search} onChange={(e) => setSearch(e.target.value)} className="pl-9" />
        </div>
        {isSuperAdmin && mitraList.length > 0 && (
          <Select value={filterMitra || "all"} onValueChange={(v) => setFilterMitra(v === "all" ? "" : v)}>
            <SelectTrigger className="w-full sm:w-56">
              <SelectValue placeholder="Filter mitra..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Semua Mitra</SelectItem>
              {mitraList.map((m) => (
                <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
              ))}
            </SelectContent>
          </Select>
        )}
      </div>

      <Card className="border-0 shadow-sm">
        <CardContent className="p-0">
            <Table containerClassName="max-h-[calc(100vh-14rem)]">
              <TableHeader className="sticky top-0 z-10 bg-gray-50">
                <TableRow className="bg-gray-50">
                  {isSuperAdmin && <TableHead>Mitra</TableHead>}
                  <TableHead className="w-12">#</TableHead>
                  <TableHead>Preview</TableHead>
                  <TableHead>Judul</TableHead>
                  <TableHead>Kategori</TableHead>
                  <TableHead>Deskripsi</TableHead>
                  <TableHead className="text-right">Aksi</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loading
                  ? Array.from({ length: 4 }).map((_, i) => (
                      <TableRow key={i}>
                        {isSuperAdmin && <TableCell><Skeleton className="h-4 w-24" /></TableCell>}
                        <TableCell><Skeleton className="h-4 w-6" /></TableCell>
                        <TableCell><Skeleton className="h-12 w-16 rounded-lg" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-28" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-20" /></TableCell>
                        <TableCell><Skeleton className="h-4 w-40" /></TableCell>
                        <TableCell><Skeleton className="h-8 w-16 ml-auto" /></TableCell>
                      </TableRow>
                    ))
                  : items.length === 0
                  ? (
                      <TableRow>
                        <TableCell colSpan={isSuperAdmin ? 7 : 6} className="text-center py-10 text-gray-400">
                          <ImageIcon className="w-10 h-10 mx-auto mb-2 text-gray-300" />
                          {search ? "Tidak ada hasil" : "Belum ada item gallery"}
                        </TableCell>
                      </TableRow>
                    )
                  : items.map((item) => (
                      <TableRow key={item.id} className="hover:bg-gray-50">
                        {isSuperAdmin && (
                          <TableCell>
                            {item.mitra ? (
                              <span className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded-md font-medium">{item.mitra.name}</span>
                            ) : (
                              <span className="text-xs text-gray-400">—</span>
                            )}
                          </TableCell>
                        )}
                        <TableCell>
                          <span className="text-xs font-mono text-gray-400">{item.sortOrder}</span>
                        </TableCell>
                        <TableCell>
                          {item.image ? (
                            <div className="relative w-14 h-10">
                              <img
                                src={item.image}
                                alt={item.title}
                                className="w-14 h-10 object-cover rounded-lg border border-gray-200"
                                onError={(e) => {
                                  const img = e.currentTarget;
                                  img.style.display = "none";
                                  const fallback = img.nextElementSibling;
                                  if (fallback) (fallback as HTMLElement).style.display = "flex";
                                }}
                              />
                              <div className="absolute inset-0 rounded-lg bg-gray-100 items-center justify-center hidden">
                                <Camera className="w-5 h-5 text-gray-300" />
                              </div>
                            </div>
                          ) : (
                            <div className="w-14 h-10 rounded-lg bg-gray-100 flex items-center justify-center">
                              <Camera className="w-5 h-5 text-gray-300" />
                            </div>
                          )}
                        </TableCell>
                        <TableCell className="font-medium">{item.title}</TableCell>
                        <TableCell>
                          <span className="text-xs text-gray-500 bg-gray-100 px-2 py-1 rounded-md">{item.category}</span>
                        </TableCell>
                        <TableCell className="text-gray-500 text-sm max-w-xs truncate">{item.description}</TableCell>
                        <TableCell className="text-right">
                          <div className="flex justify-end gap-1">
                            <Button variant="ghost" size="icon" onClick={() => openEdit(item)} className="text-gray-400 hover:text-blue-600">
                              <Pencil className="w-4 h-4" />
                            </Button>
                            <Button variant="ghost" size="icon" onClick={() => openDelete(item)} className="text-gray-400 hover:text-red-600">
                              <Trash2 className="w-4 h-4" />
                            </Button>
                          </div>
                        </TableCell>
                      </TableRow>
                    ))}
              </TableBody>
            </Table>
        </CardContent>
      </Card>

      {/* Form Dialog */}
      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit Gallery" : "Tambah Foto Baru"}</DialogTitle>
          </DialogHeader>
          <div className="space-y-4 py-2">
            {isSuperAdmin && (
              <div className="space-y-2">
                <Label>Mitra Perumahan</Label>
                <Select value={form.mitraId || "none"} onValueChange={(v) => setForm({ ...form, mitraId: v === "none" ? "" : v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih mitra..." /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="none">Tanpa Mitra</SelectItem>
                    {mitraList.map((m) => (
                      <SelectItem key={m.id} value={m.id}>{m.name}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-gray-400">Assign foto ke mitra tertentu.</p>
              </div>
            )}
            <div className="space-y-2">
              <Label>
                Judul <span className="text-red-500">*</span>
              </Label>
              <Input
                value={form.title}
                onChange={(e) => { clearFieldError("title"); setForm({ ...form, title: e.target.value }); }}
                className={errors.title ? "border-red-400 focus-visible:ring-red-400" : ""}
              />
              {errors.title && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.title}
                </p>
              )}
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Kategori</Label>
                <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
                  <SelectTrigger><SelectValue placeholder="Pilih" /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="inden">Inden</SelectItem>
                    <SelectItem value="kavling">Kavling</SelectItem>
                    <SelectItem value="siap_huni">Siap Huni</SelectItem>
                    <SelectItem value="lingkungan">Lingkungan</SelectItem>
                    <SelectItem value="proses_bangun">Proses Bangun</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label>Urutan</Label>
                <Input type="number" value={form.sortOrder} onChange={(e) => setForm({ ...form, sortOrder: e.target.value })} />
              </div>
            </div>
            <div className="space-y-2">
              <ImageUpload
                value={form.image}
                onChange={(url) => { clearFieldError("image"); setForm({ ...form, image: url }); }}
                label="Gambar Gallery"
                maxImages={1}
              />
              {errors.image && (
                <p className="text-xs text-red-500 flex items-center gap-1">
                  <AlertCircle className="w-3 h-3" /> {errors.image}
                </p>
              )}
            </div>
            <div className="space-y-2">
              <Label>Deskripsi</Label>
              <Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setFormOpen(false)}>Batal</Button>
            <Button onClick={handleSave} disabled={saving} className="bg-indigo-600 hover:bg-indigo-700 text-white">
              {saving && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
              {editing ? "Simpan" : "Tambah"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Dialog */}
      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Hapus Foto</AlertDialogTitle>
            <AlertDialogDescription>
              Apakah Anda yakin ingin menghapus foto <strong>{deleting?.title}</strong>?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Batal</AlertDialogCancel>
            <AlertDialogAction onClick={handleDelete} className="bg-red-600 hover:bg-red-700 text-white">Hapus</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
