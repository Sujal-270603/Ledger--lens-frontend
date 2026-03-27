import { Construction } from "lucide-react";

export default function ComingSoonPage() {
  return (
    <div className="flex flex-col items-center justify-center h-full text-center p-8">
      <div className="bg-brand-50 p-4 rounded-full mb-4 text-brand-500">
        <Construction className="h-10 w-10" />
      </div>
      <h2 className="text-2xl font-bold text-navy-900 mb-2">Coming Soon</h2>
      <p className="text-muted-foreground max-w-md">
        This page is currently under construction and will be available in a future update.
      </p>
    </div>
  );
}
