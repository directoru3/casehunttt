import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UseCodeRequest {
  userId: string;
  code: string;
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

    const { userId, code }: UseCodeRequest = await req.json();

    if (!userId || !code) {
      throw new Error('User ID and code are required');
    }

    const codeUpper = code.toUpperCase().trim();

    const { data: secretCode, error: codeError } = await supabase
      .from('secret_codes')
      .select('*')
      .eq('code', codeUpper)
      .eq('is_active', true)
      .maybeSingle();

    if (codeError || !secretCode) {
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or inactive code' }),
        {
          status: 400,
          headers: {
            ...corsHeaders,
            'Content-Type': 'application/json',
          },
        }
      );
    }

    const { count, error: countError } = await supabase
      .from('secret_code_uses')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', userId)
      .eq('code', codeUpper);

    if (countError) {
      throw new Error('Failed to check usage count');
    }

    const usesCount = count || 0;

    if (usesCount >= secretCode.max_uses_per_user) {
      return new Response(
        JSON.stringify({
          success: false,
          error: 'Maximum uses reached for this code',
          usesLeft: 0,
          maxUses: secretCode.max_uses_per_user
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

    const { error: insertError } = await supabase
      .from('secret_code_uses')
      .insert({
        user_id: userId,
        code: codeUpper,
        used_at: new Date().toISOString()
      });

    if (insertError) {
      throw new Error('Failed to record code usage');
    }

    const usesLeft = secretCode.max_uses_per_user - usesCount - 1;

    return new Response(
      JSON.stringify({
        success: true,
        caseId: secretCode.case_id,
        usesLeft,
        maxUses: secretCode.max_uses_per_user,
        message: `Free case activated! ${usesLeft} uses remaining`
      }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
    console.error('Secret code error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
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