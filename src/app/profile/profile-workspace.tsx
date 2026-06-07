"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { 
  User, Lock, LogOut, Save, Plus, Trash2, Loader2, AlertCircle, Sparkles, Layers, Image as ImageIcon, Upload, X
} from "lucide-react";
import { lockPortfolio, updatePortfolioData, verifyAndUnlockPortfolio, uploadPortfolioImage, type PortfolioData } from "./actions";
import Image from "next/image";
import Cropper from "react-easy-crop";
import { getCroppedImg } from "@/lib/crop-image";

interface ProfileWorkspaceProps {
  initialData: PortfolioData;
  isAuthenticated: boolean;
}

export function ProfileWorkspace({ initialData, isAuthenticated }: ProfileWorkspaceProps) {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [password, setPassword] = useState("");
  const [error, setError] = useState(false);
  
  const [heroImage, setHeroImage] = useState(initialData.heroImage);
  const [heroName, setHeroName] = useState(initialData.heroName);
  const [heroHeadline, setHeroHeadline] = useState(initialData.heroHeadline);
  const [heroDescription, setHeroDescription] = useState(initialData.heroDescription);
  
  const [bio, setBio] = useState(initialData.bio);
  const [interests, setInterests] = useState<string[]>(initialData.interests);
  const [newInterest, setNewInterest] = useState("");
  
  const [stack, setStack] = useState<string[]>(initialData.stack);
  const [newStack, setNewStack] = useState("");

  const [alertDialog, setAlertDialog] = useState<{ isOpen: boolean; title: string; message: string }>({ isOpen: false, title: "", message: "" });
  const showAlert = (title: string, message: string) => setAlertDialog({ isOpen: true, title, message });

  // Cropper states
  const [imageSrc, setImageSrc] = useState<string | null>(null);
  const [crop, setCrop] = useState({ x: 0, y: 0 });
  const [zoom, setZoom] = useState(1);
  const [croppedAreaPixels, setCroppedAreaPixels] = useState(null);
  const [isCropping, setIsCropping] = useState(false);
  const [uploadingImg, setUploadingImg] = useState(false);

  const onCropComplete = (croppedArea: any, croppedAreaPixels: any) => {
    setCroppedAreaPixels(croppedAreaPixels);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      const reader = new FileReader();
      reader.addEventListener("load", () => {
        setImageSrc(reader.result?.toString() || "");
        setIsCropping(true);
      });
      reader.readAsDataURL(e.target.files[0]);
    }
  };

  const handleUploadCrop = async () => {
    if (!imageSrc || !croppedAreaPixels) return;
    setUploadingImg(true);
    try {
      const croppedImageBlob = await getCroppedImg(imageSrc, croppedAreaPixels);
      if (!croppedImageBlob) throw new Error("Gagal crop gambar");

      const file = new File([croppedImageBlob], "profile.webp", { type: "image/webp" });
      const formData = new FormData();
      formData.append("file", file);

      const result = await uploadPortfolioImage(formData);
      if (result.success) {
        setHeroImage(result.url);
        setIsCropping(false);
        setImageSrc(null);
      } else {
        showAlert("Gagal Upload", result.error || "Gagal mengupload gambar");
      }
    } catch (e) {
      console.error(e);
      showAlert("Gagal", "Terjadi kesalahan saat memproses gambar.");
    } finally {
      setUploadingImg(false);
    }
  };

  const handleLogin = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!password) return;
    setLoading(true);
    setError(false);
    try {
      const success = await verifyAndUnlockPortfolio(password);
      if (success) {
        router.refresh();
      } else {
        setError(true);
        setPassword("");
      }
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  const handleLogout = async () => {
    setLoading(true);
    await lockPortfolio();
    router.refresh();
  };

  const handleSave = async () => {
    if (!isAuthenticated) return;
    setLoading(true);
    try {
      await updatePortfolioData({ 
        heroImage, heroName, heroHeadline, heroDescription, bio, interests, stack 
      });
      router.refresh();
      showAlert("Sukses", "Profil berhasil diperbarui!");
    } catch {
      showAlert("Gagal", "Gagal menyimpan profil.");
    } finally {
      setLoading(false);
    }
  };

  const addInterest = () => {
    if (newInterest.trim() && !interests.includes(newInterest.trim())) {
      setInterests([...interests, newInterest.trim()]);
      setNewInterest("");
    }
  };

  const removeInterest = (index: number) => {
    setInterests(interests.filter((_, i) => i !== index));
  };

  const addStack = () => {
    if (newStack.trim() && !stack.includes(newStack.trim())) {
      setStack([...stack, newStack.trim()]);
      setNewStack("");
    }
  };

  const removeStack = (index: number) => {
    setStack(stack.filter((_, i) => i !== index));
  };


  if (!isAuthenticated) {
    return (
      <div className="max-w-6xl mx-auto px-6 md:px-8 pt-28 pb-16">
        <div className="flex items-center justify-between border-b border-border-default pb-4 mb-8">
          <div>
            <span className="font-mono text-[10px] tracking-[0.15em] text-accent uppercase block mb-1">
              Authentication Required
            </span>
            <h1 className="font-sans text-3xl font-bold text-text-primary tracking-tight">
              Profile Settings
            </h1>
          </div>
        </div>

        <div className="flex items-center justify-center min-h-[40vh]">
          <div className="w-full max-w-sm border border-border-default bg-bg-surface p-6 rounded-lg shadow-sm">
            <div className="flex flex-col items-center mb-6 text-center">
              <div className="w-10 h-10 rounded-full bg-accent-tint/10 flex items-center justify-center mb-3">
                <Lock className="w-5 h-5 text-accent" />
              </div>
              <h1 className="font-mono text-xs uppercase tracking-[0.2em] text-text-primary">
                Admin Area
              </h1>
              <p className="font-sans text-[11px] text-text-muted mt-1">
                Masukkan password untuk mengatur konten profil Anda.
              </p>
            </div>

            <form onSubmit={handleLogin} className="space-y-4">
              <div>
                <label htmlFor="portfolio-password" className="sr-only">Password</label>
                <input
                  id="portfolio-password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full font-mono text-center text-xs tracking-widest bg-bg-primary border border-border-default rounded px-3 py-2.5 text-text-primary placeholder:text-text-placeholder focus:outline-none focus:border-accent focus-visible:ring-2 focus-visible:ring-accent/50 transition-colors"
                  disabled={loading}
                  autoFocus
                />
              </div>

              {error && (
                <p className="text-center font-mono text-[10px] text-red-500 uppercase tracking-wider" role="alert">
                  Password salah
                </p>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full py-2 bg-text-primary text-bg-primary hover:bg-text-secondary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-all font-mono text-[10px] uppercase tracking-wider rounded font-bold cursor-pointer disabled:opacity-50"
              >
                {loading ? "Membuka..." : "Unlock"}
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto px-6 md:px-8 pt-28 pb-16 space-y-12">
      {/* Header */}
      <div className="flex items-center justify-between border-b border-border-default pb-4">
        <div>
          <span className="font-mono text-[10px] tracking-[0.15em] text-accent uppercase block mb-1">
            Admin Area
          </span>
          <h1 className="font-sans text-3xl font-bold text-text-primary tracking-tight">
            Edit Profile
          </h1>
        </div>
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={handleSave}
            disabled={loading}
            className="flex items-center gap-1.5 bg-text-primary text-bg-primary hover:bg-text-secondary active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent/50 transition-all font-mono text-xs px-4 py-2 rounded font-bold cursor-pointer disabled:opacity-50"
          >
            {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
            SIMPAN
          </button>
          <button
            type="button"
            onClick={handleLogout}
            disabled={loading}
            className="p-2 text-text-muted hover:text-red-500 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-red-500/50 rounded transition-colors cursor-pointer"
            title="Keluar"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </div>

      <div className="space-y-12">
        {/* Hero Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-text-primary uppercase tracking-wider font-bold border-b border-border-default pb-2">
            <Sparkles className="w-4 h-4 text-accent" />
            Hero Section
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-text-muted uppercase block">Profile Picture</label>
                <div className="flex items-center gap-4">
                  <div className="w-16 h-16 rounded-full overflow-hidden border border-border-default relative bg-bg-primary">
                    <Image src={heroImage || "/pfp.webp"} alt="Profile" fill sizes="64px" className="object-cover" />
                  </div>
                  <label className="flex items-center gap-1.5 px-3 py-1.5 border border-border-default hover:border-accent text-text-muted hover:text-accent font-mono text-[10px] uppercase font-bold rounded cursor-pointer transition-colors">
                    <Upload className="w-3.5 h-3.5" /> GANTI
                    <input type="file" accept="image/jpeg,image/png,image/webp" className="hidden" onChange={handleFileChange} />
                  </label>
                </div>
              </div>
              <div className="space-y-1.5">
                <label className="font-mono text-[10px] text-text-muted uppercase">Hero Name</label>
              <input
                type="text"
                value={heroName}
                onChange={(e) => setHeroName(e.target.value)}
                className="w-full bg-bg-surface border border-border-default rounded px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
            </div>
            <div className="space-y-1.5">
              <label className="font-mono text-[10px] text-text-muted uppercase">Hero Headline</label>
              <input
                type="text"
                value={heroHeadline}
                onChange={(e) => setHeroHeadline(e.target.value)}
                className="w-full bg-bg-surface border border-border-default rounded px-3 py-2 font-sans text-sm text-text-primary focus:outline-none focus:border-accent"
              />
            </div>
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-text-muted uppercase">Hero Description</label>
            <textarea
              value={heroDescription}
              onChange={(e) => setHeroDescription(e.target.value)}
              className="w-full min-h-[100px] bg-bg-surface border border-border-default rounded px-3 py-2 font-sans text-sm text-text-primary leading-relaxed focus:outline-none focus:border-accent resize-y"
            />
          </div>
        </div>

        {/* Bio Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-text-primary uppercase tracking-wider font-bold border-b border-border-default pb-2">
            <User className="w-4 h-4 text-accent" />
            Biography Section
          </div>
          <div className="space-y-1.5">
            <label className="font-mono text-[10px] text-text-muted uppercase">Full Bio</label>
            <textarea
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              className="w-full min-h-[200px] bg-bg-surface border border-border-default rounded p-4 font-sans text-sm text-text-primary leading-relaxed focus:outline-none focus:border-accent resize-y"
            />
          </div>
        </div>

        {/* Interests Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-text-primary uppercase tracking-wider font-bold border-b border-border-default pb-2">
            <AlertCircle className="w-4 h-4 text-accent" />
            Tinkering & Explorations (Tags)
          </div>
          <div className="flex flex-wrap gap-2">
            {interests.map((interest, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 font-mono text-[11px] bg-bg-surface border border-border-default text-text-primary px-3 py-1.5 rounded"
              >
                {interest}
                <button 
                  type="button"
                  onClick={() => removeInterest(idx)}
                  className="text-text-muted hover:text-red-500 focus-visible:outline-none rounded-sm transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={newInterest}
              onChange={(e) => setNewInterest(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addInterest(); } }}
              placeholder="Tinker item baru..."
              className="flex-1 bg-bg-surface border border-border-default rounded px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={addInterest}
              disabled={!newInterest.trim()}
              className="px-3 py-2 bg-bg-surface border border-border-default hover:border-accent hover:text-accent text-text-primary rounded font-mono text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

        {/* Tools Section */}
        <div className="space-y-4">
          <div className="flex items-center gap-2 font-mono text-xs text-text-primary uppercase tracking-wider font-bold border-b border-border-default pb-2">
            <Layers className="w-4 h-4 text-accent" />
            Tools & Technologies (Tags)
          </div>
          <div className="flex flex-wrap gap-2">
            {stack.map((item, idx) => (
              <div 
                key={idx} 
                className="flex items-center gap-2 font-mono text-[11px] bg-bg-surface border border-border-default text-text-primary px-3 py-1.5 rounded"
              >
                {item}
                <button 
                  type="button"
                  onClick={() => removeStack(idx)}
                  className="text-text-muted hover:text-red-500 focus-visible:outline-none rounded-sm transition-colors cursor-pointer"
                  title="Hapus"
                >
                  <Trash2 className="w-3 h-3" />
                </button>
              </div>
            ))}
          </div>

          <div className="flex items-center gap-2 max-w-sm">
            <input
              type="text"
              value={newStack}
              onChange={(e) => setNewStack(e.target.value)}
              onKeyDown={(e) => { if (e.key === "Enter") { e.preventDefault(); addStack(); } }}
              placeholder="Software / tool baru..."
              className="flex-1 bg-bg-surface border border-border-default rounded px-3 py-2 font-mono text-xs text-text-primary focus:outline-none focus:border-accent"
            />
            <button
              type="button"
              onClick={addStack}
              disabled={!newStack.trim()}
              className="px-3 py-2 bg-bg-surface border border-border-default hover:border-accent hover:text-accent text-text-primary rounded font-mono text-xs font-bold transition-colors cursor-pointer disabled:opacity-50"
            >
              <Plus className="w-4 h-4" />
            </button>
          </div>
        </div>

      </div>
      {isCropping && imageSrc && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/80 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-default rounded-lg max-w-lg w-full mx-6 overflow-hidden flex flex-col h-[70vh]">
            <div className="flex items-center justify-between p-4 border-b border-border-default">
              <h3 className="font-mono text-xs font-bold text-text-primary uppercase tracking-wider">Crop Profile Picture</h3>
              <button type="button" onClick={() => setIsCropping(false)} className="text-text-muted hover:text-red-500 transition-colors">
                <X className="w-4 h-4" />
              </button>
            </div>
            <div className="relative flex-1 bg-black/50">
              <Cropper
                image={imageSrc}
                crop={crop}
                zoom={zoom}
                aspect={1}
                cropShape="round"
                showGrid={false}
                onCropChange={setCrop}
                onCropComplete={onCropComplete}
                onZoomChange={setZoom}
              />
            </div>
            <div className="p-4 border-t border-border-default bg-bg-surface flex items-center justify-between gap-4">
              <input
                type="range"
                value={zoom}
                min={1}
                max={3}
                step={0.1}
                aria-label="Zoom"
                onChange={(e) => setZoom(Number(e.target.value))}
                className="flex-1 accent-accent"
              />
              <button
                type="button"
                onClick={handleUploadCrop}
                disabled={uploadingImg}
                className="px-4 py-2 bg-text-primary text-bg-primary hover:bg-text-secondary active:scale-[0.98] rounded font-mono text-[10px] font-bold uppercase transition-all disabled:opacity-50 min-w-[100px] flex justify-center"
              >
                {uploadingImg ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : "TERAPKAN"}
              </button>
            </div>
          </div>
        </div>
      )}
      {alertDialog.isOpen && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm">
          <div className="bg-bg-surface border border-border-default rounded-lg max-w-sm w-full mx-6 p-6 shadow-2xl space-y-4">
            <h3 className="font-sans text-sm font-bold text-text-primary">{alertDialog.title}</h3>
            <p className="font-sans text-[11px] text-text-muted leading-relaxed">{alertDialog.message}</p>
            <div className="flex justify-end pt-3 border-t border-border-default">
              <button type="button" onClick={() => setAlertDialog(p => ({ ...p, isOpen: false }))} className="px-3.5 py-1.5 bg-text-primary text-bg-primary hover:bg-text-secondary rounded font-mono text-[10px] font-bold cursor-pointer transition-colors">OKE</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

