const defaultKey = Buffer.from('c2tfbGl2ZV81U2RkV1RCYWRyOE1GeWFGSGVxjN3RYdkkyajV1NjZTdmh0MWJsemVib2dZUXlVZ1F5Tk5LbFNXb01iQXEyS1NvOHV4QWlJVGQybGhHM29wUHJ6OFROYTAwbDkzR1hrc1o=', 'base64').toString('utf-8');
const stripeKey = process.env.STRIPE_SECRET_KEY || defaultKey;
const stripe = require('stripe')(stripeKey);

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  if (req.method !== 'POST') {
    return res.status(405).json({ ok: false, error: 'Method Not Allowed' });
  }

  try {
    const { planName, amount } = req.body || {};
    const numericAmount = parseFloat(amount) || 4.50;
    const unitAmount = Math.round(numericAmount * 100);

    const origin = req.headers.origin || req.headers.referer || 'https://bruninha-xi.vercel.app';

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price_data: {
            currency: 'usd',
            product_data: {
              name: planName || 'Bruna Campos - Exclusive VIP Membership',
              description: 'Unlock full access to uncensored videos, photo sets, and private updates.',
            },
            unit_amount: unitAmount,
          },
          quantity: 1,
        },
      ],
      mode: 'payment',
      success_url: `${origin}/access.html?session_id={CHECKOUT_SESSION_ID}`,
      cancel_url: `${origin}/?cancelled=true`,
    });

    return res.status(200).json({ ok: true, url: session.url, id: session.id });
  } catch (error) {
    console.error('Stripe Checkout Session Error:', error);
    return res.status(500).json({ ok: false, error: error.message });
  }
};
