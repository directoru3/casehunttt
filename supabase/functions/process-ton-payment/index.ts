import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface TonPaymentRequest {
  userId: string;
  tonAmount: number;
  coinsAmount: number;
  txHash: string;
  payload: string;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, tonAmount, coinsAmount, txHash, payload }: TonPaymentRequest = await req.json();
    console.log('[ProcessTonPayment] Request:', { userId, tonAmount, coinsAmount, txHash });

    if (!userId || !tonAmount || !coinsAmount || !txHash) {
      throw new Error('Missing required fields');
    }

    const { data: existingTx, error: checkError } = await supabase
      .from('transactions')
      .select('id')
      .eq('tx_hash', txHash)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[ProcessTonPayment] Check error:', checkError);
      throw new Error('Failed to check transaction');
    }

    if (existingTx) {
      console.warn('[ProcessTonPayment] Transaction already processed:', txHash);
      throw new Error('Transaction already processed');
    }

    const { data: userData, error: userFetchError } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    if (userFetchError && userFetchError.code !== 'PGRST116') {
      console.error('[ProcessTonPayment] User fetch error:', userFetchError);
      throw new Error('Failed to fetch user balance');
    }

    const currentBalance = userData?.balance || 0;
    const newBalance = currentBalance + coinsAmount;

    console.log('[ProcessTonPayment] Current balance:', currentBalance, '→ New balance:', newBalance);

    if (userData) {
      const { error: balanceUpdateError } = await supabase
        .from('user_balances')
        .update({
          balance: newBalance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId);

      if (balanceUpdateError) {
        console.error('[ProcessTonPayment] Balance update error:', balanceUpdateError);
        throw new Error('Failed to update balance');
      }
      console.log('[ProcessTonPayment] Balance updated successfully');
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
        console.error('[ProcessTonPayment] Balance insert error:', balanceInsertError);
        throw new Error('Failed to create balance record');
      }
      console.log('[ProcessTonPayment] Balance record created successfully');
    }

    const { error: transactionError } = await supabase
      .from('transactions')
      .insert({
        user_id: userId,
        type: 'deposit',
        amount: coinsAmount,
        ton_amount: tonAmount,
        status: 'completed',
        tx_hash: txHash,
        payload_id: payload,
        created_at: new Date().toISOString()
      });

    if (transactionError) {
      console.error('[ProcessTonPayment] Transaction log error:', transactionError);
      throw new Error('Failed to log transaction');
    }

    console.log('[ProcessTonPayment] Transaction logged successfully');

    const response = {
      success: true,
      newBalance,
      message: 'Payment processed successfully'
    };

    console.log('[ProcessTonPayment] Response:', response);

    return new Response(
      JSON.stringify(response),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[ProcessTonPayment] Error:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message || 'Payment processing failed'
      }),
      {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' }
      }
    );
  }
});