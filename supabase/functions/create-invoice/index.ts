import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface InvoiceRequest {
  userId: string;
  stars: number;
  coins: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, stars, coins }: InvoiceRequest = await req.json();

    if (!userId || !stars || !coins) {
      throw new Error('Missing required fields');
    }

    const payloadId = `deposit_${userId}_${Date.now()}_${Math.random().toString(36).substring(7)}`;

    const invoice = {
      title: 'Balance Top-Up',
      description: `Add ${coins} TON to your balance`,
      payload: payloadId,
      currency: 'XTR',
      prices: [
        {
          label: `${stars} Telegram Stars`,
          amount: stars
        }
      ]
    };

    const { error: insertError } = await supabase
      .from('pending_payments')
      .insert({
        payload_id: payloadId,
        user_id: userId,
        stars_amount: stars,
        coins_amount: coins,
        status: 'pending',
        created_at: new Date().toISOString()
      });

    if (insertError) {
      console.error('Error inserting payment:', insertError);
    }

    return new Response(
      JSON.stringify({ invoice, payloadId }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error creating invoice:', error);
    return new Response(
      JSON.stringify({ error: error.message }),
      {
        status: 400,
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  }
});