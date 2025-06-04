// fichier: app/dashboard/page.tsx

import { RedirectComponent } from "@/components/RedirectComponent";
import DashboardContent from "./_components/DashboardContent";
import { checkAuthenticationAndSubscription } from "@/lib/checkAuthSubscription";

// --- Ajouté cette ligne pour forcer le rendu dynamique ---
export const dynamic = 'force-dynamic'; 
// ou 'auto' si vous voulez que Next.js le détermine,
// mais 'force-dynamic' est plus sûr si vous savez que vous utilisez des APIs dynamiques.

export default async function Dashboard() {
    try {
        const authCheck = await checkAuthenticationAndSubscription();
        
        if (authCheck.redirectTo) {
          return <RedirectComponent to={authCheck.redirectTo} />;
        }

        return <DashboardContent />;
      } catch (error) {
        console.error('Error in Dashboard page:', error);
        return <RedirectComponent to="/" />;
      }
}