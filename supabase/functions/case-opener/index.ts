import "jsr:@supabase/functions-js/edge-runtime.d.ts";
import { createClient } from 'npm:@supabase/supabase-js@2';

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET, POST, PUT, DELETE, OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type, Authorization, X-Client-Info, Apikey",
};

interface Item {
  id: string;
  name: string;
  rarity: string;
  price: number;
  image_url: string;
}

interface CaseOpenRequest {
  items: Item[];
  count?: number;
  caseName?: string;
  userId?: number;
  username?: string;
  userPhotoUrl?: string;
}

function getCryptoRandomFloat(): number {
  const buffer = new Uint32Array(1);
  crypto.getRandomValues(buffer);
  return buffer[0] / (0xFFFFFFFF + 1);
}

function selectWinnerByRarity(items: Item[]): Item {
  const random = getCryptoRandomFloat() * 100;
  let cumulativeProbability = 0;

  const rarityProbabilities: { [key: string]: number } = {
    'common': 80,
    'uncommon': 15,
    'rare': 4,
    'mythical': 0.9,
    'legendary': 0.1
  };

  const sortedItems = [...items].sort((a, b) => {
    const rarityOrder: { [key: string]: number } = {
      'common': 1,
      'uncommon': 2,
      'rare': 3,
      'mythical': 4,
      'legendary': 5
    };
    return rarityOrder[a.rarity] - rarityOrder[b.rarity];
  });

  for (const item of sortedItems) {
    const probability = rarityProbabilities[item.rarity] || 10;
    cumulativeProbability += probability;
    if (random <= cumulativeProbability) {
      return item;
    }
  }

  return sortedItems[0];
}

Deno.serve(async (req: Request) => {
  if (req.method === "OPTIONS") {
    return new Response(null, {
      status: 200,
      headers: corsHeaders,
    });
  }

  try {
    const { items, count = 1, caseName, userId, username, userPhotoUrl }: CaseOpenRequest = await req.json();

    if (!items || items.length === 0) {
      throw new Error('No items provided');
    }

    if (count < 1 || count > 5) {
      throw new Error('Count must be between 1 and 5');
    }

    const winners: Item[] = [];
    for (let i = 0; i < count; i++) {
      const winner = selectWinnerByRarity(items);
      winners.push(winner);
    }

    if (userId && username && caseName) {
      const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
      const supabaseKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
      const supabase = createClient(supabaseUrl, supabaseKey);

      for (const winner of winners) {
        try {
          await supabase.from('live_drops').insert({
            user_id: userId,
            username: username,
            item_name: winner.name,
            item_rarity: winner.rarity,
            case_name: caseName,
            user_photo_url: userPhotoUrl || null,
          });
        } catch (dbError) {
          console.error('Error inserting live drop:', dbError);
        }
      }
    }

    return new Response(
      JSON.stringify({ winners }),
      {
        headers: {
          ...corsHeaders,
          'Content-Type': 'application/json',
        },
      }
    );
  } catch (error) {
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