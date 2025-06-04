"use client"

import ButtonGlowing from "@/components/landingPage/ButtonGlowing"

export default function Cancelled() {
	return(
		<div className="flex flex-col items-center justify-center text-center min-h-screen space-y-6">
			<h1 className="font-bold text-2xl">Payment cancelled</h1>
			<div className="w-[300px] h-[2px] bg-red-300"/>

			<p className="text-xl">Your payment has been cancelled. Not charges were made.</p>
			<ButtonGlowing href="/pricing" text="Return to pricing"/>
		</div>
	)
}