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
	const HandleAnalyse = useCallback(async() =>{
		if (!selectedFile){
			setError("Please set a file before analyzing.")
			return
		}
		setIsLoading(true);
		setError('');
		setSummary('');
		try{
			//TODO : Extract text from PDF File
			const text = ''
			//TODO : Send the extracted text to API for analysis
			const response = ''
		} catch (err){
			setError(err instanceof Error ? err.message : 'Failed to analyze PDF.')
		} finally{
			setIsLoading(false)
		}
	},[selectedFile])

	//TODO: FormatSummaryContent function
	return(
		<>
			<div className="space-y-10 mt-24 max-w-4xl mx-auto">
				{/* Conditional rendering */}
				{/* TODO REMOVE THE ! */}
				{showPaymentSucces && (
					<div className='bg-green-500/10 max-w-xl mx-auto my-8 border border-green-500/20 rounded-xl p-4 text-green-400'>
						<div className='flex items-center justify-center'>
							<CheckCircle className="h-5 w-5 mr-4"/>
							<p>Payment successfull ! Your subscription is Active</p>
						</div>
					</div>

				)}
				{/* File upload and alysis section */}
				<div className="p-10 space-y-8 rounded-2xl border border-purple-300/10 bg-black/30 shadow-[0_4px_20px_-10px] shadow-purple-200/30">
					{/* File input for pdf selection */}
					<div className="relative">
						<div className="my-2 ml-2 flex items-center text-xs text-gray-500">
							<FileText className="h-3.5 w-3.5 mr-1.5"/>
							<span>Supported format: PDF</span>
						</div>
						<div className="border border-gray-700 rounded-xl p-1 bg-black/40 hover:border-purple-200/20 transition-colors">
							<input
								type="file"
								accept=".pdf"
								className="block w-full text-gray-300 file:mr-4 file:py-3 file:px-6 file:rounded-lg file:border-0 file:text-sm
										file:font-medium file:bg-purple-200/20 file:text-purple-200 hover:file:bg-purple-200/20 transition-all
										focus:outline-none file:cursor-pointer"
							/>
						</div>
					</div>
					<button
						disabled={!selectedFile  || isLoading}
						className="group relative inline-flex items-center justify-center w-full gap-2 rounded-xl bg-black px-4 py-4
								text-white transition-all hover:bg-white/5 disabled:opacity-50 disabled:cursor-not-allowed"
					>
						<span className="absolute inset-0 rounded-xl bg-gradient-to-r from-[#FF1E56] via-[#FF00FF] to-[#00FFFF]
									opacity-70 blur-sm transition-all group-hover:opacity-100 disabled:opacity-40"/>
						<span className="absolute inset-0.5 rounded-xl bg-black/50"/>
						<span className="relative font-medium">
							{isLoading ? 'Processing...' : 'Analyze document'}
						</span>
					</button>
				</div>

				{/* Error message - only shown when there's an error  */}
				{error && (
					<div className="bg-red-500/10 border border-red-500/20 p-4 rounded-xl text-red-400">
						<div className="flex items-start">
							<AlertCircle className="h-5 w-5 mr-2 mt-0.5" />
							<div>
								<p className="font-medium mb-1"> Error analyzing document</p>
								<p>{error}</p>
							</div>
						</div>
					</div>
				)}

				{/* Summary result - Only Shown when therre's a summary  */}
				{!summary && (
					<div className="bg-black/20 shadow-[0_4px_20px_-10px] shadow-purple-200/30 rounded-2xl p-8 border border-[#2A2A35]">
						{/* Summary header */}
						<div className="flex items-center mb-6">
							<div className="mr-3 p-2 rounded-full bg-gradient-to-br from-purple-500/20 to-pink-500/20">
								<FileText className="h-6 w-6 text-purple-400"/>
							</div>
						</div>
						{/* Formatted summary conntent */}
						<div className="max-w-none px-6 py-5 rounded-xl bg-[#0f0f13] border border-[#2A2A35]">
							xxxxxxxxxxxxxxxxxxxxxxxxxxxx
						</div>
					</div>
				)}
			</div>
		</>
	)
}