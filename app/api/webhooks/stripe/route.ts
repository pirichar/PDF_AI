
import { NextResponse } from 'next/server'
import { headers } from 'next/headers'
import Stripe from 'stripe'
import { stripe } from '@/lib/stripe'
import { prisma }  from '@/lib/prisma'

export async function POST(req: Request) {
  const body = await req.text()
  const signature = (await headers()).get("Stripe-Signature") as string

  try {
    const event = stripe.webhooks.constructEvent(
      body,
      signature,
      process.env.STRIPE_WEBHOOK_SECRET!
    )

    switch (event.type) {
      case 'checkout.session.completed':
        await handleCheckoutCompleted(event.data.object as Stripe.Checkout.Session)
        break

      case 'customer.subscription.updated':
        await handleSubscriptionUpdated(event.data.object as Stripe.Subscription)
        break

      case 'customer.subscription.deleted':
        await handleSubscriptionDeleted(event.data.object as Stripe.Subscription)
        break

      case 'invoice.payment_succeeded':
        await handlePaymentSucceeded(event.data.object as Stripe.Invoice)
        break
    }

    return NextResponse.json({ received: true }, { status: 200 })

  } catch (err) {
    const error = err as Error
    console.error(`Stripe webhook error: ${error.message}`)
    return NextResponse.json(
      { error: `Webhook Error: ${error.message}` },
      { status: 400 }
    )
  }
}

async function handleCheckoutCompleted(session: Stripe.Checkout.Session) {
  if (!session.subscription || !session.customer) return

  const subscription = await stripe.subscriptions.retrieve(
    session.subscription as string
  )

  await prisma.user.update({
    where: { stripeCustomerId: session.customer as string },
    data: {
      subscription: {
        upsert: {
          create: mapSubscriptionData(subscription),
          update: mapSubscriptionData(subscription),
        },
      },
    },
  })
}

async function handleSubscriptionUpdated(subscription: Stripe.Subscription) {
  await prisma.subscription.update({
    where: { stripeSubscriptionId: subscription.id },
    data: {
      status: subscription.status,
      currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
      currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
      interval: subscription.items.data[0].plan.interval,
      planId: subscription.items.data[0].plan.id,
    },
  })
}

async function handleSubscriptionDeleted(subscription: Stripe.Subscription) {
  await prisma.subscription.delete({
    where: { stripeSubscriptionId: subscription.id },
  })
}

// async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
//   const subscription = await stripe.subscriptions.retrieve(
//     invoice.subscription as string
//   )
//   await prisma.subscription.update({
//     where: { stripeSubscriptionId: subscription.id },
//     data: {
//       currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
//       currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
//     },
//   })
// }

async function handlePaymentSucceeded(invoice: Stripe.Invoice) {
  // 1. Address TypeScript error for 'invoice.subscription':
  //    Access 'subscription' using '(invoice as any).subscription'.
  //    This tells TypeScript to trust that this property exists.
  const subscriptionProperty = (invoice as any).subscription;

  // 2. Ensure 'subscriptionProperty' is valid and extract the ID string.
  //    The original 'as string' cast was unsafe if 'subscriptionProperty' wasn't a string.
  let subscriptionIdToRetrieve: string | undefined;

  if (typeof subscriptionProperty === 'string') {
    subscriptionIdToRetrieve = subscriptionProperty;
  } else if (subscriptionProperty && typeof subscriptionProperty.id === 'string') {
    // Handles cases where 'subscriptionProperty' might be an expanded Subscription object
    subscriptionIdToRetrieve = subscriptionProperty.id;
  }

  // 3. If a valid subscription ID could not be obtained, log an error and exit.
  if (!subscriptionIdToRetrieve) {
    console.error(
      `Could not retrieve a valid subscription ID from invoice ${invoice.id}. ` +
      `The 'subscription' property was: ${JSON.stringify(subscriptionProperty)}`
    );
    // It's crucial to log the actual 'invoice' object if this happens often:
    // console.log('Full invoice object for debugging:', JSON.stringify(invoice, null, 2));
    return;
  }

  // 4. Retrieve the subscription using the determined ID.
  const subscription = await stripe.subscriptions.retrieve(
    subscriptionIdToRetrieve
  );

  // 5. Your existing Prisma update logic, with added safety for item access.
  //    This assumes 'subscription.items.data[0]' and its period properties exist and are numbers.
  const firstItem = subscription.items?.data?.[0];

  if (
    firstItem &&
    typeof (firstItem as any).current_period_start === 'number' && // Using 'as any' if types for item are also problematic
    typeof (firstItem as any).current_period_end === 'number'
  ) {
    await prisma.subscription.update({
      where: { stripeSubscriptionId: subscription.id },
      data: {
        currentPeriodStart: new Date((firstItem as any).current_period_start * 1000),
        currentPeriodEnd: new Date((firstItem as any).current_period_end * 1000),
      },
    });
  } else {
    console.error(
      `Subscription ${subscription.id} could not be updated with period dates. ` +
      `The first subscription item or its 'current_period_start'/'current_period_end' properties were missing, null, or not numbers.`
    );
    // Consider if you want to update other fields (like status) even if period dates can't be set.
    // For example:
    // await prisma.subscription.update({
    //   where: { stripeSubscriptionId: subscription.id },
    //   data: { status: subscription.status },
    // });
  }
}

function mapSubscriptionData(subscription: Stripe.Subscription) {
  return {
    stripeSubscriptionId: subscription.id,
    status: subscription.status,
    currentPeriodStart: new Date(subscription.items.data[0].current_period_start * 1000),
    currentPeriodEnd: new Date(subscription.items.data[0].current_period_end * 1000),
    interval: subscription.items.data[0].plan.interval,
    planId: subscription.items.data[0].plan.id,
  }
}