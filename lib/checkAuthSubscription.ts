 import "server-only"

 import { auth } from "@clerk/nextjs/server"
 import { prisma } from "./prisma"


export type AuthCheckResult = {
	userId: string| null,
	isAuthentificated: boolean;
	hasSubscription: boolean;
	redirectTo?: string;
};

export async function checkAuthentificationAndSubscription(waitMs = 0) : Promise<AuthCheckResult> {
	const {userId} = await auth();

	if (!userId){
		return{
			userId:null,
			isAuthentificated: false,
			hasSubscription: false,
			redirectTo: '/sing-in?redirect_url=/dashboard'
		}
	}
	if (waitMs> 0){
		await new Promise((resolve) => setTimeout(resolve, waitMs));
	}

	let subscription = null;
	try{	
		subscription = await prisma.subscription.findUnique({
			where:{userId},
		})
	}catch(error){
		console.error('Error checking subscription:', error)
		return({
			userId,
			isAuthentificated: true,
			hasSubscription: false,
		})
	}
	
	const hasActiveSubscription = subscription?.status === 'active';
	
	return{
		userId,
		isAuthentificated: true,
		hasSubscription: hasActiveSubscription,
		redirectTo: hasActiveSubscription ? undefined : '/pricing'
	}
}