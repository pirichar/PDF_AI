// import DashboardContent from "./_components/DashboardContent";

// export default async function Dashboard(){
// 	return <DashboardContent/>
// }


import { RedirectComponent } from "@/components/RedirectComponent";
import DashboardContent from "./_components/DashboardContent";
import { checkAuthenticationAndSubscription } from "@/lib/checkAuthSubscription";

export default async function Dashboard(){
	try{
		const authCheck = await checkAuthenticationAndSubscription()

		if (authCheck.redirectTo){
			return <RedirectComponent to={authCheck.redirectTo} />
		}
		return <DashboardContent />
	}catch(error){
		console.error('Error in dashboard page:', error)
		return <RedirectComponent to="/"/>
	}
}