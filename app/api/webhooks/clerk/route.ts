import { verifyWebhook } from '@clerk/nextjs/webhooks'
import { prisma } from '@/lib/prisma'
import { NextRequest } from 'next/server'

export async function POST(req: NextRequest) {
  try {
    const evt = await verifyWebhook(req)

	if (evt.type ==='user.created'){
		const {id, email_addresses, first_name, last_name} = evt.data
		try{
			const fullName = `${first_name || ''} ${last_name || ''}`.trim()

			await prisma.user.create({
				data:{
					id,
					email: email_addresses[0].email_address,
					name : fullName || null
				}
			})
			console.log(`User with ID ${id} was inserted into the database.`)
		}catch(error){
			console.error('Error saving user to the DB', error)
			return new Response('Error saving user', {status: 500})
		}
	}
    return new Response('Webhook received', { status: 200 })
  } catch (err) {
    console.error('Error verifying webhook:', err)
    return new Response('Error verifying webhook', { status: 400 })
  }
}