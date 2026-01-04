import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from "npm:@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface UpdateStatsRequest {
  userId: string;
  casesOpened?: number;
  amountSpent?: number;
  amountWon?: number;
  itemValue?: number;
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { status: 200, headers: corsHeaders });
  }

  try {
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseKey);

    const { userId, casesOpened = 0, amountSpent = 0, amountWon = 0, itemValue = 0 }: UpdateStatsRequest = await req.json();

    console.log('[UpdatePlayerStats] Request:', { userId, casesOpened, amountSpent, amountWon, itemValue });

    if (!userId) {
      throw new Error('Missing userId');
    }

    const { data: activeSeason } = await supabase
      .from('seasons')
      .select('id')
      .eq('status', 'active')
      .maybeSingle();

    if (!activeSeason) {
      console.warn('[UpdatePlayerStats] No active season found');
      return new Response(
        JSON.stringify({ success: false, error: 'No active season' }),
        { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    const pointsEarned = Math.floor(amountSpent * 10);

    const { data: existingStats } = await supabase
      .from('player_stats')
      .select('*')
      .eq('user_id', userId)
      .eq('season_id', activeSeason.id)
      .maybeSingle();

    let newStats;

    if (existingStats) {
      const updatedPoints = existingStats.total_points + pointsEarned;
      const updatedCases = existingStats.cases_opened + casesOpened;
      const updatedSpent = parseFloat(existingStats.total_spent) + amountSpent;
      const updatedWon = parseFloat(existingStats.total_won) + amountWon;
      const bestItemValue = Math.max(parseFloat(existingStats.best_item_value), itemValue);

      const { data: rankData } = await supabase
        .rpc('calculate_rank_level', { points: updatedPoints });

      const rankLevel = rankData || 1;

      const { data: updated } = await supabase
        .from('player_stats')
        .update({
          total_points: updatedPoints,
          cases_opened: updatedCases,
          total_spent: updatedSpent,
          total_won: updatedWon,
          best_item_value: bestItemValue,
          rank_level: rankLevel,
          updated_at: new Date().toISOString()
        })
        .eq('user_id', userId)
        .eq('season_id', activeSeason.id)
        .select()
        .single();

      newStats = updated;
      console.log('[UpdatePlayerStats] Stats updated:', newStats);
    } else {
      const { data: rankData } = await supabase
        .rpc('calculate_rank_level', { points: pointsEarned });

      const rankLevel = rankData || 1;

      const { data: created } = await supabase
        .from('player_stats')
        .insert({
          user_id: userId,
          season_id: activeSeason.id,
          total_points: pointsEarned,
          cases_opened: casesOpened,
          total_spent: amountSpent,
          total_won: amountWon,
          best_item_value: itemValue,
          rank_level: rankLevel,
          created_at: new Date().toISOString(),
          updated_at: new Date().toISOString()
        })
        .select()
        .single();

      newStats = created;
      console.log('[UpdatePlayerStats] Stats created:', newStats);
    }

    return new Response(
      JSON.stringify({ success: true, stats: newStats, pointsEarned }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (error) {
    console.error('[UpdatePlayerStats] Error:', error);
    return new Response(
      JSON.stringify({ success: false, error: error.message }),
      { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});