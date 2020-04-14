import express from 'express';
import * as functions from 'firebase-functions'
import Stripe from 'stripe'
import Account from '../../models/Account'

const app = express()

app.post('/callback', async (req, res) => {
  const code = req.query.code
  const uid = req.query.uid
  if (!code) {
    return
  }
  const STRIPE_API_KEY = functions.config().stripe.api_key
  if (!STRIPE_API_KEY) {
    throw new functions.https.HttpsError('invalid-argument', 'The functions requires STRIPE_API_KEY.')
  }
  const stripe = new Stripe(STRIPE_API_KEY, { apiVersion: '2020-03-02' })
  const response = await stripe.oauth.token({
    grant_type: 'authorization_code',
    code: code
  });

  const account = new Account(uid)
  account.status = 'connected'
  account.stripeUserId = response.stripe_user_id
  account.stripeInfo = response
  await account.save()

  res.json({ succes: true })
})

export default app
