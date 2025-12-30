import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

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

    const { userId, balance, operation } = await req.json();

    if (!userId) {
      throw new Error('User ID is required');
    }

    if (balance === undefined || balance === null) {
      throw new Error('Balance is required');
    }

    if (balance < 0) {
      throw new Error('Balance cannot be negative');
    }

    const { data: existing } = await supabase
      .from('user_balances')
      .select('balance')
      .eq('user_id', userId)
      .maybeSingle();

    let result;
    if (existing) {
      result = await supabase
        .from('user_balances')
        .update({
          balance: balance,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .select('balance')
        .single();
    } else {
      result = await supabase
        .from('user_balances')
        .insert({
          user_id: userId,
          balance: balance,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select('balance')
        .single();
    }

    if (result.error) {
      throw new Error(`Failed to update balance: ${result.error.message}`);
    }

    return new Response(
      JSON.stringify({
        success: true,
        balance: result.data.balance,
        operation: operation || 'update'
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Error updating balance:', error);
    return new Response(
      JSON.stringify({
        success: false,
        error: error.message
      }),
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
