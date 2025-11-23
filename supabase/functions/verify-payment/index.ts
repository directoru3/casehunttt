import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface VerifyPaymentRequest {
  userId: string;
  payloadId: string;
  status: 'paid' | 'failed' | 'cancelled';
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

    const { userId, payloadId, status }: VerifyPaymentRequest = await req.json();

    if (!userId || !payloadId || !status) {
      throw new Error('Missing required fields');
    }

    const { data: payment, error: fetchError } = await supabase
      .from('pending_payments')
      .select('*')
      .eq('payload_id', payloadId)
      .eq('user_id', userId)
      .single();

    if (fetchError || !payment) {
      throw new Error('Payment not found');
    }

    if (payment.status !== 'pending') {
      throw new Error('Payment already processed');
    }

    const { error: updateError } = await supabase
      .from('pending_payments')
      .update({
        status: status,
        completed_at: new Date().toISOString()
      })
      .eq('payload_id', payloadId);

    if (updateError) {
      throw new Error('Failed to update payment status');
    }

    let newBalance = payment.coins_amount;

    if (status === 'paid') {
      const { data: userData, error: userFetchError } = await supabase
        .from('user_balances')
        .select('balance')
        .eq('user_id', userId)
        .maybeSingle();

      if (userFetchError && userFetchError.code !== 'PGRST116') {
        throw new Error('Failed to fetch user balance');
      }

      const currentBalance = userData?.balance || 0;
      newBalance = currentBalance + payment.coins_amount;

      if (userData) {
        const { error: balanceUpdateError } = await supabase
          .from('user_balances')
          .update({
            balance: newBalance,
            updated_at: new Date().toISOString()
          })
          .eq('user_id', userId);

        if (balanceUpdateError) {
          throw new Error('Failed to update balance');
        }
      } else {
        const { error: balanceInsertError } = await supabase
          .from('user_balances')
          .insert({
            user_id: userId,
            balance: newBalance,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString()
          });

        if (balanceInsertError) {
          throw new Error('Failed to create balance record');
        }
      }

      const { error: transactionError } = await supabase
        .from('transactions')
        .insert({
          user_id: userId,
          type: 'deposit',
          amount: payment.coins_amount,
          stars_amount: payment.stars_amount,
          status: 'completed',
          payload_id: payloadId,
          created_at: new Date().toISOString()
        });

      if (transactionError) {
        console.error('Failed to log transaction:', transactionError);
      }
    }

    return new Response(
      JSON.stringify({ 
        success: true, 
        status,
        newBalance: status === 'paid' ? newBalance : null
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error verifying payment:', error);
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