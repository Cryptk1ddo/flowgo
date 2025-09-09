import Dashboard from "@/components/Dashboard";
import { getSprintData } from "@/lib/sprint";

export default function Home() {
  const sprintData = getSprintData(); // In a real app, this might be an async call
  
  return (
    <main className="container mx-auto max-w-2xl p-4 md:p-8">
      <Dashboard initialData={sprintData} />
    </main>
  );
}
import Dashboard from "@/components/Dashboard";
import { getSprintData } from "@/lib/sprint";

export default function Home() {
  const sprintData = getSprintData(); // In a real app, this might be an async call
  
  return (
    <main className="container mx-auto max-w-2xl p-4 md:p-8">
      <Dashboard initialData={sprintData} />
    </main>
  );
}
