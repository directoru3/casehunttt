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
    return new Response(null, { status: 200, headers: corsHeaders });
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
    console.log('[SecretCode] Checking code:', codeUpper, 'for user:', userId);

    const { data: secretCode, error: codeError } = await supabase
      .from('secret_codes')
      .select('*')
      .eq('code', codeUpper)
      .eq('is_active', true)
      .maybeSingle();

    if (codeError || !secretCode) {
      console.log('[SecretCode] Invalid or inactive code');
      return new Response(
        JSON.stringify({ success: false, error: 'Invalid or inactive code' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const { data: existingUse, error: checkError } = await supabase
      .from('secret_code_uses')
      .select('*')
      .eq('user_id', userId)
      .eq('code', codeUpper)
      .maybeSingle();

    if (checkError && checkError.code !== 'PGRST116') {
      console.error('[SecretCode] Error checking usage:', checkError);
      throw new Error('Failed to check code usage');
    }

    if (existingUse) {
      console.log('[SecretCode] Code already used by user');
      const usedDate = new Date(existingUse.used_at).toLocaleDateString();
      return new Response(
        JSON.stringify({
          success: false,
          error: 'You have already used this code',
          alreadyUsed: true,
          usedAt: usedDate
        }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
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
      console.error('[SecretCode] Failed to record usage:', insertError);
      if (insertError.code === '23505') {
        return new Response(
          JSON.stringify({
            success: false,
            error: 'You have already used this code',
            alreadyUsed: true
          }),
          { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      throw new Error('Failed to record code usage');
    }

    console.log('[SecretCode] Code activated successfully');

    return new Response(
      JSON.stringify({
        success: true,
        caseId: secretCode.case_id,
        message: 'Secret Code Activated!',
        isFirstUse: true
      }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[SecretCode] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message || 'Failed to use code' }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});