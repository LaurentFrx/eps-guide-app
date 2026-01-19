import { BottomNav } from "@/components/BottomNav";
import { DataWarning } from "@/components/DataWarning";
import Footer from "@/components/Footer";

export default function V2Layout({ children }: { children: React.ReactNode }) {
  return (
    <div className="eps-app">
      <main className="eps-app__content px-5 pt-6 pb-[calc(env(safe-area-inset-bottom)+120px)]">
        <DataWarning className="mb-6" />
        {children}
      </main>
      <Footer />
      <BottomNav />
    </div>
  );
}
