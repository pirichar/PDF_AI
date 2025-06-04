"use client"

import ButtonGlowing from "@/components/landingPage/ButtonGlowing"

export default function Success() {
	return(
		<div className="flex flex-col items-center justify-center text-center min-h-screen space-y-6">
			<h1 className="font-bold text-2xl">Payment successfull</h1>
			<div className="w-[300px] h-[2px] bg-green-300">

			</div>
			<p className="text-xl">Thank you for your purhcase. Your payment has been processed succesfully</p>
			<ButtonGlowing href="/dashboard" text="Return to pricing"/>
		</div>
	)
}