import { RedirectComponent } from "@/components/RedirectComponent";
import DashboardContent from "./_components/DashboardContent";
import { checkAuthentificationAndSubscription } from "@/lib/checkAuthSubscription";

export default async function Dashboard(){
	try{
		const authCheck = await checkAuthentificationAndSubscription()

		if (authCheck.redirectTo){
			return <RedirectComponent to={authCheck.redirectTo} />
		}
		return <DashboardContent />
	}catch(error){
		console.error('Error in dashboard page:', error)
		return <RedirectComponent to="/"/>
	}
}