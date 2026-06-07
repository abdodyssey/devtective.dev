# Agent Task: Remove Detective Theme & Update Copywriting

## Context
Portfolio devtective.dev sudah jadi secara struktur dan layout — bagus. Sekarang kita perlu strip semua terminologi "detektif" dan ganti ke bahasa yang natural, langsung dipahami siapapun yang buka portfolio ini.

**Yang TIDAK berubah:**
- Layout dan struktur halaman (tetap sama persis)
- Design system: warna, font, spacing, border — tidak ada yang disentuh
- Komponen dan logika data fetching
- Folder structure

**Yang berubah: hanya teks yang terlihat oleh user dan nama-nama label/section.**

---

## Perubahan yang Harus Dilakukan

### 1. Terminologi Section Labels
Ganti semua label monospace yang muncul di UI:

| Sebelum | Sesudah |
|---|---|
| `CASE_FILES` | `PROJECTS` |
| `CASE_ID` | `NO.` |
| `CASE_01`, `CASE_02`, dst | `01`, `02`, dst |
| `ABOUT_THE_DETECTIVE` | `ABOUT` |
| `TOOLS_OF_THE_TRADE` | `STACK` |
| `PROJECT_NAME` | `PROJECT` |
| `ACTIVE_INVESTIGATION` | `IN PROGRESS` |
| `SOLVED` | `SHIPPED` |
| `ARCHIVED` | `ARCHIVED` (tetap) |
| `ON_HOLD` | `ON HOLD` |

---

### 2. Hero Section

**Sebelum:**
```
— dikenal sebagai Devtective.
Suka ngoding hal-hal yang (semoga) berguna. Kadang berhasil, kadang jadi pelajaran.
[Lihat Case Files →]
```

**Sesudah:**
```
Tagline (1-2 kalimat, di bawah nama):
"Fullstack engineer yang suka bangun hal-hal nyata.
Sekarang fokus di web — Next.js, TypeScript, dan seisinya."

CTA Primary: "Lihat Projects →"
CTA Ghost: "GitHub ↗"
```

---

### 3. About Section

**Sebelum:**
```
"Mahasiswa Sistem Informasi semester 6 di UIN Raden Fatah Palembang, yang lebih sering
ngoding daripada tidur siang. Sekarang lagi fokus di fullstack web — Next.js, TypeScript,
PostgreSQL jadi teman sehari-hari. Kalau tidak lagi debug, biasanya lagi mikirin cara
bikin sesuatu yang actually useful buat orang lain."
```

**Sesudah:**
```
"Mahasiswa Sistem Informasi semester 6 di UIN Raden Fatah Palembang.
Sekarang lagi aktif bangun web apps — dari landing page UMKM sampai sistem informasi
kampus. Stack utama Next.js, TypeScript, dan PostgreSQL. Terbuka untuk freelance,
internship, atau kolaborasi."
```

Tone: jelas, padat, tidak ada gimmick. Orang yang buka portfolio langsung ngerti siapa lu dan apa yang lu bisa.

---

### 4. Projects Section

**Sebelum:**
```
Subtitle: "Kumpulan hal yang pernah gw bangun — dari yang shipped sampai yang masih jadi misteri."
```

**Sesudah:**
```
Subtitle: "Beberapa project yang pernah gw bangun — open source dan client work."
```

---

### 5. Stack Section

**Sebelum:**
```
Subtitle: "Yang biasa dipake di lab."
```

**Sesudah:**
```
Subtitle: "Tech yang biasa gw pakai sehari-hari."
```

---

### 6. Footer

**Sebelum:**
```
"Terbuka untuk opportunities, kolaborasi, atau sekadar ngobrol soal tech."
```

**Sesudah:**
```
"Terbuka untuk freelance, full-time, atau sekadar ngobrol soal tech."
```

---

### 7. Detail Page (`/cases/[slug]`)

Ganti route dari `/cases/[slug]` → `/projects/[slug]`.

Update semua referensi internal:
- Link dari project list → `/projects/[slug]`
- `generateStaticParams` tetap pakai `repo.name` sebagai slug
- Back link: `"← Projects"` (bukan `"← balik ke case files"`)
- Fallback description: `"Belum ada deskripsi untuk project ini."` (bukan "masih dalam investigasi")

---

### 8. Nav Links

**Sebelum:**
```
cases    contact
```

**Sesudah:**
```
projects    contact
```

Update href anchor: `#projects` dan `#contact`.

---

### 9. SEO & Metadata

**Sebelum:**
```ts
description: 'Fullstack engineer yang suka bangun hal-hal useful. Next.js, TypeScript, PostgreSQL.'
```

**Sesudah:**
```ts
title: {
  default: 'M. Abdi Nugroho — Fullstack Engineer',
  template: '%s · Abdi Nugroho',
},
description: 'Fullstack engineer berbasis di Palembang. Spesialis Next.js, TypeScript, dan PostgreSQL.',
```

Detail page fallback:
```ts
description: repo.description ?? 'Project oleh M. Abdi Nugroho.'
```

---

### 10. Browser Tab / Logo Nav

Logo teks di nav tetap `devtective.` — ini nama brand, bukan terminologi detektif, jadi tidak diubah.

---

## File yang Perlu Disentuh

```
components/nav.tsx              ← update nav links & href
components/hero.tsx             ← tagline, CTA text
components/about.tsx            ← body copy
components/case-files.tsx       ← rename ke projects-section.tsx (opsional), update label & subtitle
components/case-manifest.tsx    ← rename ke project-manifest.tsx (opsional)
components/case-item.tsx        ← rename ke project-item.tsx (opsional), update case ID format → nomor biasa
components/stack-section.tsx    ← update subtitle
components/footer.tsx           ← update tagline
components/ui/badge.tsx         ← update label badge: IN PROGRESS, SHIPPED, ARCHIVED, ON HOLD
lib/utils.ts                    ← update return value getRepoStatus() sesuai label baru
app/page.tsx                    ← update section anchor id: #projects, #contact
app/cases/[slug]/page.tsx       ← pindah ke app/projects/[slug]/page.tsx
app/layout.tsx                  ← update metadata title & description
```

---

## Aturan Tambahan untuk Agent

- Jangan ubah apapun di `globals.css`, `tailwind.config`, atau design token — warna dan font tidak berubah.
- Jangan tambah halaman baru atau komponen baru yang tidak disebutkan di atas.
- Jangan ubah logika `getRepos()`, `sortRepos()`, atau `getRepoStatus()` kecuali return value string-nya saja (sesuai tabel §1).
- Kalau rename file komponen terasa risky (breaking imports), cukup update isi file saja tanpa rename — tidak wajib rename.
- Setelah selesai, pastikan tidak ada string yang masih mengandung kata "case", "investigation", "detective", "lab", atau "misteri" yang muncul ke user.
