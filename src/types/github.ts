export interface GitHubRepo {
  id: number;
  name: string; // Nama repo (slug)
  full_name: string;
  description: string | null;
  html_url: string; // Link ke GitHub
  homepage: string | null; // Link live demo (jika ada)
  topics: string[]; // Tags teknologi
  stargazers_count: number;
  forks_count: number;
  language: string | null; // Bahasa utama;
  archived: boolean;
  pushed_at: string; // Timestamp update terakhir
  created_at: string;
  fork: boolean; // Exclude fork dari tampilan
}
