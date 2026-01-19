import { BottomNav } from "@/components/BottomNav";

export default function TabsLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="flex min-h-dvh flex-col gap-6">
      <header className="ui-surface rounded-2xl px-4 py-3">
        <p className="text-xs uppercase tracking-widest text-white/70">Guide Musculation</p>
      </header>
      <div className="flex-1 space-y-6">{children}</div>
      <BottomNav />
    </div>
  );
}