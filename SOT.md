# SOT — Source of Truth
## devtective.dev · Personal Portfolio
**Version:** 1.1.0  
**Last Updated:** 2026-06-07  
**Maintainer:** M. Abdi Nugroho (Devtective)

---

## 1. Project Overview

Portfolio pribadi dengan domain `devtective.dev`. Identitas visual: **Clean Laboratory** — ruang forensik serba putih, bersih, presisi. Proyek-proyek diperlakukan sebagai "Case Files" yang tertata rapi. Tone keseluruhan: **Moderat Detective** — terminologi detektif hadir di label, status, dan copy, tapi keseluruhan tetap terasa seperti portfolio developer profesional.

### Tech Stack
| Layer | Tool |
|---|---|
| Framework | Next.js 16.2.x (App Router) |
| Styling | Tailwind CSS v4 (via `@tailwindcss/vite` atau config bawaan Next 16) |
| Icons | lucide-react |
| ORM / DB | — (tidak ada, data dari GitHub API) |
| Data Fetching | ISR — `fetch()` dengan `next: { revalidate: 3600 }` |
| Data Source | GitHub REST API v3 (public, no auth required untuk public repos) |
| Deployment | Vercel |
| Font Loading | `next/font/google` |

---

## 2. Design System

### 2.1 Color Tokens

Semua token warna didefinisikan sebagai CSS custom properties di `app/globals.css`. Tailwind v4 menggunakan `@theme` untuk mapping token ke utility classes.

```css
/* app/globals.css */
@import "tailwindcss";

@theme {
  /* Background */
  --color-bg-primary: #FFFFFF;
  --color-bg-surface: #F8F9FA;
  --color-bg-muted: #F1F3F5;
  --color-bg-accent-tint: #FFF0EB;

  /* Border */
  --color-border-default: #E5E7EB;
  --color-border-strong: #D1D5DB;

  /* Text */
  --color-text-primary: #111827;
  --color-text-secondary: #374151;
  --color-text-muted: #6B7280;
  --color-text-placeholder: #9CA3AF;

  /* Accent */
  --color-accent: #F05A28;
  --color-accent-hover: #D94E20;
  --color-accent-tint: #FFF0EB;
  --color-accent-border: #FFDDD0;

  /* Font Families */
  --font-sans: 'Plus Jakarta Sans', sans-serif;
  --font-mono: 'JetBrains Mono', monospace;
}
```

**Palet ringkas:**

| Token | Hex | Penggunaan |
|---|---|---|
| `bg-primary` | `#FFFFFF` | Background halaman utama |
| `bg-surface` | `#F8F9FA` | Latar section, project list container |
| `bg-muted` | `#F1F3F5` | Tag teknologi, badge netral |
| `bg-accent-tint` | `#FFF0EB` | Badge `ACTIVE_INVESTIGATION` |
| `border-default` | `#E5E7EB` | Semua border, separator horizontal |
| `text-primary` | `#111827` | Heading, judul proyek |
| `text-secondary` | `#374151` | Body text, deskripsi |
| `text-muted` | `#6B7280` | Label sekunder, metadata |
| `text-placeholder` | `#9CA3AF` | Timestamp, stars count |
| `accent` | `#F05A28` | CTA button, case ID, highlight |
| `accent-hover` | `#D94E20` | Hover state tombol aksen |

> **Aturan warna ketat:** Tidak ada warna dekoratif selain token di atas. Tidak ada gradient. Tidak ada shadow kecuali `ring` untuk focus state.

---

### 2.2 Typography

Font di-load via `next/font/google` di `app/layout.tsx`. **Jangan** load via `@import` di CSS — gunakan variable font Next.js.

```tsx
// app/layout.tsx
import { Plus_Jakarta_Sans, JetBrains_Mono } from 'next/font/google'

const jakarta = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700'],
  variable: '--font-sans',
  display: 'swap',
})

const jetbrains = JetBrains_Mono({
  subsets: ['latin'],
  weight: ['400', '500'],
  variable: '--font-mono',
  display: 'swap',
})
```

**Hierarki tipografi:**

| Level | Font | Size | Weight | Warna | Penggunaan |
|---|---|---|---|---|---|
| H1 | Plus Jakarta Sans | `text-4xl` (36px) | 700 | `text-primary` | Nama — "Devtective" |
| H2 | Plus Jakarta Sans | `text-xl` (20px) | 600 | `text-primary` | Section title — "Case Files" |
| H3 | Plus Jakarta Sans | `text-base` (16px) | 500 | `text-primary` | Judul proyek di manifest |
| Body | Plus Jakarta Sans | `text-sm` (14px) | 400 | `text-secondary` | Deskripsi, paragraf |
| Mono Label | JetBrains Mono | `text-[11px]` | 500 | `accent` | Case ID, status aktif |
| Mono Meta | JetBrains Mono | `text-[10px]` | 400 | `text-placeholder` | Timestamp, star count, tag tech |

> **Aturan font:** `font-sans` untuk semua teks naratif. `font-mono` **hanya** untuk: case ID, status badge, tech tags, timestamp, star count, metadata GitHub, dan label kolom tabel.

---

### 2.3 Spacing & Layout

- **Container max-width:** `max-w-3xl` (768px) — layout sempit, editorial, tidak full-width.
- **Horizontal padding:** `px-6` mobile, `px-8` desktop.
- **Section gap:** `space-y-16` antar section utama.
- **Inner gap:** `space-y-3` untuk item dalam list manifest.

---

### 2.4 Border & Radius

| Elemen | Border | Radius |
|---|---|---|
| Section container | `border border-[#E5E7EB]` | `rounded` (4px) |
| Project manifest item | `border-b border-[#E5E7EB]` (bottom only) | none |
| Tag / Badge | `border border-[#E5E7EB]` | `rounded-sm` (2px) |
| CTA Button (filled) | none | `rounded` (4px) |
| CTA Button (outline) | `border border-[#111827]` | `rounded` (4px) |
| Input / Form | `border border-[#E5E7EB]` | `rounded` (4px) |

> **Aturan radius:** Maksimal `rounded` (4px). Tidak ada `rounded-xl`, `rounded-2xl`, atau `rounded-full` kecuali pada avatar foto profil.

> **Aturan shadow:** `shadow-*` dilarang kecuali `ring-2 ring-accent/30` untuk focus state interaktif.

---

### 2.5 Status Badges

Badge menggunakan `font-mono`, `text-[9px]`, `font-medium`, `tracking-wide`, `uppercase`.

| Badge | Background | Text Color | Penggunaan |
|---|---|---|---|
| `ACTIVE_INVESTIGATION` | `#FFF0EB` | `#F05A28` | Repo aktif dikerjakan |
| `SOLVED` | `#F1F3F5` | `#6B7280` | Repo selesai / shipped |
| `ARCHIVED` | `#F8F9FA` | `#9CA3AF` | Repo tidak aktif, diarsip |
| `ON_HOLD` | `#F8F9FA` | `#374151` | Repo dijeda sementara |

Mapping status dari GitHub: gunakan `repo.archived` dan `repo.topics` untuk menentukan status. Lihat logika di §4.3.

---

### 2.6 UI Components Spec

#### Button
```
Variant: primary (filled)
  bg: #F05A28 | text: white | hover: #D94E20
  padding: py-2 px-4 | radius: rounded | font: font-sans text-sm font-medium

Variant: outline
  bg: transparent | border: 1px solid #111827 | text: #111827
  hover: bg-[#F8F9FA]

Variant: ghost
  bg: transparent | border: 1px solid #E5E7EB | text: #6B7280
  hover: bg-[#F8F9FA]
```

#### Tech Tag
```
bg: #F8F9FA | border: 0.5px solid #E5E7EB
text: #6B7280 | font: font-mono text-[9px]
padding: px-2 py-0.5 | radius: rounded-sm
```

#### Section Header
```
Label atas (monospace):
  font-mono text-[10px] tracking-[0.15em] uppercase text-[#9CA3AF]
  border-b border-[#E5E7EB] pb-2 mb-3

Judul section:
  font-sans text-xl font-semibold text-primary
```

---

## 3. Site Structure

### 3.1 Halaman & Routes

```
/               → Homepage (One-page layout, semua section ada di sini)
/cases/[slug]   → Detail proyek (slug = nama repo GitHub, diformat kebab-case)
```

> Portfolio ini **satu halaman utama** + halaman detail per proyek. Tidak ada halaman About, Contact, Blog terpisah — semua diintegrasikan dalam homepage sebagai section.

### 3.2 Sections Homepage (Urutan)

```
1. Nav
2. Hero
3. About (singkat, 2-3 kalimat)
4. Case Files (Project List — dari GitHub API)
5. Stack & Tools
6. Contact / Footer
```

---

## 4. Data Architecture

### 4.1 GitHub API — Endpoint

```
GET https://api.github.com/users/[USERNAME]/repos
  ?sort=updated
  &per_page=20
  &type=public
```

> Ganti `[USERNAME]` dengan username GitHub kamu. Simpan di `.env.local` sebagai `NEXT_PUBLIC_GITHUB_USERNAME` atau hardcode di `lib/github.ts`.

### 4.2 Data Fetching Pattern (ISR)

```ts
// lib/github.ts
export async function getRepos() {
  const res = await fetch(
    `https://api.github.com/users/${process.env.GITHUB_USERNAME}/repos?sort=updated&per_page=20&type=public`,
    {
      next: { revalidate: 3600 }, // ISR: revalidate setiap 1 jam
      headers: {
        Accept: 'application/vnd.github+json',
        // Optional: tambahkan Authorization jika kena rate limit
        // Authorization: `Bearer ${process.env.GITHUB_TOKEN}`,
      },
    }
  )

  if (!res.ok) throw new Error('Failed to fetch repos')
  return res.json() as Promise<GitHubRepo[]>
}
```

### 4.3 Type Definition

```ts
// types/github.ts
export interface GitHubRepo {
  id: number
  name: string                  // Nama repo (slug)
  full_name: string
  description: string | null
  html_url: string              // Link ke GitHub
  homepage: string | null       // Link live demo (jika ada)
  topics: string[]              // Tags teknologi
  stargazers_count: number
  forks_count: number
  language: string | null       // Bahasa utama
  archived: boolean
  pushed_at: string             // Timestamp update terakhir
  created_at: string
  fork: boolean                 // Exclude fork dari tampilan
}
```

### 4.4 Logika Status Badge

```ts
// lib/utils.ts
export function getRepoStatus(repo: GitHubRepo): 'ACTIVE_INVESTIGATION' | 'SOLVED' | 'ARCHIVED' | 'ON_HOLD' {
  if (repo.archived) return 'ARCHIVED'

  const lastPush = new Date(repo.pushed_at)
  const now = new Date()
  const daysSinceUpdate = (now.getTime() - lastPush.getTime()) / (1000 * 60 * 60 * 24)

  if (repo.topics.includes('active') || daysSinceUpdate < 30) return 'ACTIVE_INVESTIGATION'
  if (repo.topics.includes('on-hold')) return 'ON_HOLD'
  if (daysSinceUpdate > 180) return 'ARCHIVED'
  return 'SOLVED'
}
```

### 4.5 Filtering & Sorting

- **Exclude forks:** `repos.filter(r => !r.fork)`
- **Exclude repos private-by-accident:** hanya tampilkan yang `visibility === 'public'`
- **Pinned repos:** Tandai dengan topic `featured` di GitHub. Tampilkan di atas dengan sort khusus.
- **Urutan default:** Pinned (`topics.includes('featured')`) dulu, lalu `sort by pushed_at DESC`

```ts
export function sortRepos(repos: GitHubRepo[]) {
  return repos
    .filter(r => !r.fork)
    .sort((a, b) => {
      const aFeatured = a.topics.includes('featured') ? 1 : 0
      const bFeatured = b.topics.includes('featured') ? 1 : 0
      if (bFeatured !== aFeatured) return bFeatured - aFeatured
      return new Date(b.pushed_at).getTime() - new Date(a.pushed_at).getTime()
    })
}
```

### 4.6 Case ID Generation

Case ID bersifat statis berdasarkan urutan tampil, bukan dari GitHub. Generate saat render:

```ts
// Contoh di component
repos.map((repo, index) => ({
  ...repo,
  caseId: `CASE_${String(index + 1).padStart(2, '0')}` // CASE_01, CASE_02, ...
}))
```

---

## 5. Component Architecture

### 5.1 Folder Structure

```
app/
├── layout.tsx              ← Font setup, metadata global
├── page.tsx                ← Homepage (server component, fetch repos di sini)
├── globals.css             ← Tailwind @theme tokens
└── cases/
    └── [slug]/
        └── page.tsx        ← Detail proyek (server component)

components/
├── nav.tsx                 ← Navigasi minimal
├── hero.tsx                ← Section hero
├── about.tsx               ← Section about singkat
├── case-files.tsx          ← Section project list (wrapper)
├── case-manifest.tsx       ← List item manifest proyek (menerima repos[])
├── case-item.tsx           ← Satu baris manifest (nama, tag, status, stars)
├── stack-section.tsx       ← Section stack & tools
├── footer.tsx              ← Contact + footer
└── ui/
    ├── badge.tsx           ← Status badge & tech tag
    ├── button.tsx          ← Button variants
    └── section-label.tsx   ← Komponen label section (mono uppercase)

lib/
├── github.ts               ← Fetch function + type
└── utils.ts                ← getRepoStatus, sortRepos, formatDate, dll

types/
└── github.ts               ← GitHubRepo interface
```

### 5.2 Data Flow

```
app/page.tsx (Server Component)
  └── getRepos() → ISR fetch
  └── sortRepos(repos)
  └── pass ke <CaseFiles repos={repos} />
        └── map → <CaseItem repo={repo} index={i} />
                    ← caseId, status, tags, stars, title
```

---

## 6. Section-by-Section Spec

### 6.1 Nav

```
Layout: flex justify-between items-center
Height: h-14
Border: border-b border-[#E5E7EB]
Position: sticky top-0, bg-white/95 backdrop-blur-sm z-50
Padding: px-6 md:px-8

Kiri: Logo teks "devtective." — font-mono font-medium text-base text-primary
Kanan: Link "cases" + "contact" — font-mono text-[11px] text-muted, hover: text-primary
  (Tidak ada hamburger menu, tidak ada dropdown)
```

### 6.2 Hero

```
Layout: flex flex-col, padding: pt-24 pb-16
Max-width: max-w-3xl mx-auto px-6

Baris 1 (mono label):
  "FULLSTACK ENGINEER · INFORMATION SYSTEMS · PALEMBANG, ID"
  font-mono text-[10px] tracking-[0.15em] text-muted uppercase
  margin-bottom: mb-4

Baris 2 (nama):
  "M. Abdi Nugroho"
  font-sans text-4xl md:text-5xl font-bold text-primary
  line-height: leading-tight

  Sub-alias (di bawah nama, lebih kecil):
  "— dikenal sebagai Devtective."
  font-mono text-sm text-muted mt-1

Baris 3 (tagline, 1-2 kalimat):
  "Suka ngoding hal-hal yang (semoga) berguna. Kadang berhasil, kadang jadi pelajaran."
  font-sans text-base text-secondary mt-4 max-w-lg leading-relaxed

  CATATAN UNTUK AGENT: Ini tone-nya — santai, sedikit self-aware, tapi tidak receh.
  Bukan "I build scalable solutions." Bukan "Passionate developer." Nulis seperti manusia.

CTA buttons (mt-8):
  Primary: "Lihat Case Files →" (scroll ke section proyek)
  Ghost: "GitHub ↗" (link ke github.com/[USERNAME])
  Gap: gap-3, flex flex-row
```

### 6.3 About

```
Layout: section dengan border-t border-[#E5E7EB] py-16
Max-width: max-w-3xl mx-auto px-6

Section label: "ABOUT_THE_DETECTIVE"

Teks (2-3 kalimat, tone santai-profesional, campuran Indo-Inggris):
  Gunakan copy berikut sebagai default — boleh direvisi tapi pertahankan tone-nya:

  "Mahasiswa Sistem Informasi semester 6 di UIN Raden Fatah Palembang,
  yang lebih sering ngoding daripada tidur siang. Sekarang lagi fokus
  di fullstack web — Next.js, TypeScript, PostgreSQL jadi teman sehari-hari.
  Kalau tidak lagi debug, biasanya lagi mikirin cara bikin sesuatu yang
  actually useful buat orang lain."

  CATATAN UNTUK AGENT:
  - Tidak ada frasa "passionate about", "driven by", "dedicated to"
  - Tidak ada bullet list
  - Tidak ada kalimat yang diawali "I am a..."
  - Boleh 1 kalimat Inggris, 2 kalimat Indonesia — campuran bebas, asal natural
```

### 6.4 Case Files (Project List)

```
Layout: section py-16, border-t border-[#E5E7EB]
Max-width: max-w-3xl mx-auto px-6

Section label: "CASE_FILES"
Subtitle: "Kumpulan hal yang pernah gw bangun — dari yang shipped sampai yang masih jadi misteri."

Tabel manifest (bukan <table> HTML, gunakan flex div):
  Header row:
    CASE_ID | PROJECT_NAME | STACK | STARS
    font-mono text-[10px] text-placeholder uppercase
    border-b border-[#E5E7EB] pb-2 mb-1

  Setiap baris proyek (CaseItem):
    - Case ID: font-mono text-[10px] text-accent w-16 flex-shrink-0
    - Nama proyek: font-sans text-sm font-medium text-primary, flex-1
    - Deskripsi (opsional, 1 baris, truncate): font-mono text-[9px] text-placeholder mt-0.5
    - Tech tags: 2 tag pertama dari topics[], font-mono text-[9px]
    - Status badge: sesuai §2.5
    - Star count: font-mono text-[10px] text-placeholder, "★ {n}"

    Hover state per baris:
      bg-[#F8F9FA] transition-colors duration-150
      cursor: pointer — klik baris → navigate ke /cases/[slug]

    Border: border-b border-[#E5E7EB] last:border-b-0
    Padding: py-3
```

### 6.5 Stack & Tools

```
Layout: section py-16, border-t border-[#E5E7EB]
Section label: "TOOLS_OF_THE_TRADE"
Subtitle (opsional, di bawah label): "Yang biasa dipake di lab."

Display: flex flex-wrap gap-2
Setiap item: Tech Tag component (§2.6)

Kelompok (tidak perlu heading per kelompok, flat saja):
  Next.js, TypeScript, React, Tailwind CSS, Prisma, PostgreSQL,
  Supabase, Node.js, Python, Git, Figma, Linux
```

### 6.6 Footer / Contact

```
Layout: border-t border-[#E5E7EB] py-12
Max-width: max-w-3xl mx-auto px-6

Kiri:
  "devtective." — font-mono font-medium text-primary
  "Terbuka untuk opportunities, kolaborasi, atau sekadar ngobrol soal tech."
  — font-sans text-sm text-muted mt-1

Kanan (links):
  GitHub: github.com/[USERNAME]
  Email: [EMAIL]
  LinkedIn: (jika ada)
  → font-mono text-[11px] text-muted hover:text-primary, flex flex-col gap-1

Bottom bar:
  "© 2026 M. Abdi Nugroho · devtective.dev"
  font-mono text-[9px] text-placeholder text-center mt-8 border-t border-[#E5E7EB] pt-6
```

---

## 7. Page Detail Proyek (`/cases/[slug]`)

### 7.1 Data Fetch

```ts
// app/cases/[slug]/page.tsx
export async function generateStaticParams() {
  const repos = await getRepos()
  return repos.map(r => ({ slug: r.name }))
}

// Di dalam page component:
const repo = await getRepo(slug) // fetch single repo
// GET https://api.github.com/repos/[USERNAME]/[slug]
// next: { revalidate: 3600 }
```

### 7.2 Layout Detail

```
Header:
  Back link: "← balik ke case files" — font-mono text-[10px] text-muted hover:text-primary
  Case ID + Status badge (row, mt-8)
  Nama repo: font-sans text-3xl font-bold text-primary mt-2
  Deskripsi: font-sans text-base text-secondary mt-2
    (Fallback jika repo.description null: "Belum ada deskripsi. Mungkin masih dalam investigasi.")

Metadata row (font-mono text-[10px] text-placeholder, gap-4):
  Language · Stars · Forks · Last updated

Tech tags: flex-wrap gap-2, semua topics[] dari repo

Links (mt-6):
  Button primary: "View on GitHub →"
  Button outline: "Live Demo ↗" (jika repo.homepage ada)

Divider: border-t border-[#E5E7EB] my-8

README section (opsional):
  Fetch GET /repos/[USER]/[REPO]/readme → decode base64 content
  Render dengan react-markdown (install terpisah jika dipakai)
  Jika tidak mau render README: cukup tampilkan metadata saja
```

---

## 8. SEO & Metadata

```ts
// app/layout.tsx
export const metadata: Metadata = {
  title: {
    default: 'Devtective — M. Abdi Nugroho',
    template: '%s · Devtective',
  },
  description: 'Fullstack engineer yang suka bangun hal-hal useful. Next.js, TypeScript, PostgreSQL.',
  metadataBase: new URL('https://devtective.dev'),
  openGraph: {
    type: 'website',
    locale: 'en_US',
    url: 'https://devtective.dev',
    siteName: 'Devtective',
  },
}

// app/cases/[slug]/page.tsx
export async function generateMetadata({ params }): Promise<Metadata> {
  const repo = await getRepo(params.slug)
  return {
    title: repo.name,
    description: repo.description ?? 'Satu kasus dari lab Devtective. Masih dalam investigasi.',
  }
}
```

---

## 9. Aturan Implementasi (untuk AI Agent)

### 9.1 Hal yang WAJIB dipatuhi

- [ ] Semua warna dari token §2.1. Tidak ada hardcode warna di luar token tersebut.
- [ ] Font hanya `font-sans` dan `font-mono`. Tidak ada font lain.
- [ ] Border radius maksimal `rounded` (4px). Tidak ada `rounded-xl` ke atas.
- [ ] Tidak ada `shadow-*` kecuali focus ring.
- [ ] Tidak ada gradient.
- [ ] Tidak ada animasi kompleks — hanya `transition-colors duration-150` untuk hover.
- [ ] `<CaseItem>` adalah Server Component jika hanya render data. Gunakan Client Component (`'use client'`) hanya jika ada interaktivitas (hover state cukup dengan CSS, tidak perlu JS).
- [ ] Semua fetch GitHub menggunakan `next: { revalidate: 3600 }`.
- [ ] Exclude repos yang `fork === true`.
- [ ] Case ID (`CASE_01`, `CASE_02`, ...) di-generate saat render berdasarkan index, bukan disimpan di DB.

### 9.2 Hal yang DILARANG

- [ ] ❌ Jangan pakai `useEffect` untuk fetch data — gunakan Server Component.
- [ ] ❌ Jangan pakai `rounded-xl`, `rounded-2xl`, `rounded-full` kecuali avatar.
- [ ] ❌ Jangan pakai `shadow-md`, `shadow-lg`, atau drop shadow apapun.
- [ ] ❌ Jangan pakai warna di luar palet §2.1.
- [ ] ❌ Jangan buat halaman About, Blog, atau Contact terpisah — semua dalam homepage.
- [ ] ❌ Jangan pakai `<table>` HTML untuk manifest proyek — gunakan flex div.
- [ ] ❌ Jangan load font via `<link>` di `<head>` — gunakan `next/font/google`.
- [ ] ❌ Jangan pakai library animasi (Framer Motion, GSAP) — tidak dibutuhkan.

### 9.3 Aturan Copywriting (WAJIB dibaca sebelum nulis teks apapun)

```
TONE: Santai tapi profesional. Kayak ngobrol sama senior dev — tidak formal kaku,
tidak juga alay. Campuran Indonesia-Inggris yang natural, bukan yang dipaksakan.

DILARANG keras:
  ❌ "I am a passionate developer who..."
  ❌ "Dedicated to building scalable solutions..."
  ❌ "Leveraging cutting-edge technologies..."
  ❌ Kalimat yang kedengarannya seperti di-generate AI
  ❌ Bullet list di About section
  ❌ Terlalu banyak tanda seru

YANG DIINGINKAN:
  ✅ Kalimat pendek, langsung ke intinya
  ✅ Sesekali self-aware/sedikit humor yang tidak lebay
  ✅ Indonesia untuk konteks personal, Inggris untuk istilah teknis
  ✅ Terasa ditulis oleh orang, bukan template
```

### 9.4 Urutan Implementasi yang Disarankan

```
1. Setup project: next.js 16.2.x + tailwind v4 + lucide-react
2. globals.css: definisikan semua @theme tokens
3. app/layout.tsx: font setup + metadata global
4. types/github.ts: GitHubRepo interface
5. lib/github.ts: getRepos() + getRepo(slug)
6. lib/utils.ts: getRepoStatus() + sortRepos() + formatDate()
7. components/ui/*: badge.tsx + button.tsx + section-label.tsx
8. components/nav.tsx
9. components/hero.tsx
10. components/case-item.tsx + case-manifest.tsx + case-files.tsx
11. components/stack-section.tsx + footer.tsx
12. app/page.tsx: compose semua section
13. app/cases/[slug]/page.tsx: detail proyek
14. Test ISR: pastikan revalidate berjalan
15. Deploy ke Vercel + set GITHUB_USERNAME di env
```

---

## 10. Environment Variables

```env
# .env.local
GITHUB_USERNAME=your_github_username

# Optional — tambahkan jika kena rate limit GitHub API (60 req/jam tanpa token)
GITHUB_TOKEN=ghp_xxxxxxxxxxxxxxxxxxxx
```

> GitHub API public limit: 60 req/jam unauthenticated. Dengan ISR revalidate 3600s, ini lebih dari cukup untuk traffic normal. Token opsional.

---

*End of SOT — devtective.dev*