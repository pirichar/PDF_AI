'use client'

import { useState, useCallback, useEffect } from "react"
import { useUser } from "@clerk/nextjs"
import { useRouter, useSearchParams } from "next/navigation"
import { CheckCircle, FileText, AlertCircle, Loader, Calendar, Info, Search } from "lucide-react"

export default function DashboardContent(){
	const {user, isLoaded} = useUser();

	/**
	 * Router for navigation and search paramas to accces URL query parameters
	 */
	const router = useRouter();
	const SearchParams = useSearchParams();

	/**
	 * Variables for analysis 
	 */
	const [selectedFile, setSelectedFile] = useState<File | null>(null)
	const [summary, setSummary] = useState('')
	const [isLoading, setIsLoading] = useState(false)
	const [error, setError] = useState('')
	const [showPaymentSucces, setShowPaymentSuccess] = useState(false)

	/**
	 * Useeffect will run when search params or router change
	 */

	useEffect(() => {
		const isPaymentSuccess = SearchParams?.get('payment') === 'success';
		if (isPaymentSuccess){
			setShowPaymentSuccess(true)
			router.replace('/dashboard')

			const timer = setTimeout(() =>{
				setShowPaymentSuccess(false)
			}, 5000)
			return () => clearTimeout(timer)
		}
	}, [SearchParams, router])


	const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) =>{
		setError('')

		if(!e.target.files?.[0]) return

		setSelectedFile(e.target.files[0])
	}

	//TODO: HandleAnalyse Function

	//TODO: FormatSummaryContent function
	return(
		<>
			<div className="space-y-10 max-w-4xl mx-auto">
				{/* Conditional rendering */}
				{/* TODO REMOVE THE ! */}
				{!showPaymentSucces && (
					<div className='bg-green-500/10 max-w-xl mx-auto my-8 border border-green-500/20 rounded-xl p-4 text-green-400'>
						<div className='flex items-center justify-center'>
							<CheckCircle className="h-5 w-5 mr-4"/>
							<p>Payment successfull ! Your subscription is Active</p>
						</div>
					</div>

				)}
			</div>
		</>
	)
}