import { cookies } from "next/headers";
import { Nav } from "@/components/nav";
import { Footer } from "@/components/footer";
import { ProfileWorkspace } from "./profile-workspace";
import { getPortfolioData } from "./actions";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Edit Profile",
  description: "Admin workspace for editing profile content.",
};

export default async function ProfilePage() {
  const cookieStore = await cookies();
  const isAuthenticated = cookieStore.get("portfolio_session")?.value === "authenticated";
  const githubUsername = process.env.GITHUB_USERNAME || "abdodyssey";

  const data = await getPortfolioData();

  return (
    <div className="min-h-screen flex flex-col bg-bg-primary text-text-secondary select-none">
      <Nav />
      <main className="flex-1 w-full">
        <ProfileWorkspace 
          initialData={data} 
          isAuthenticated={isAuthenticated} 
        />
      </main>
      <Footer githubUsername={githubUsername} />
    </div>
  );
}
