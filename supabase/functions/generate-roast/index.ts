import "https://deno.land/x/xhr@0.1.0/mod.ts";
import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { balance, monthlyEarned, recentPayments } = await req.json();
    console.log('Generating roast for:', { balance, monthlyEarned, recentPayments });

    const LOVABLE_API_KEY = Deno.env.get('LOVABLE_API_KEY');
    if (!LOVABLE_API_KEY) {
      throw new Error('LOVABLE_API_KEY is not configured');
    }

    const systemPrompt = `You are a hilariously sarcastic financial advisor AI with a roast comedy style. Your job is to analyze student spending habits and provide brutally honest, funny commentary while ALSO giving genuine insights.

IMPORTANT CONTEXT:
- The "balance" is their REWARDS balance (cashback earned) - this is always good, any amount is positive!
- Focus your analysis on their PAYMENT PATTERNS - this is where the real story is
- Roast their spending choices, payment amounts, and habits - not their rewards

Your personality:
- Use LOTS of emojis (at least 3-5 per paragraph)
- Make witty observations about WHAT they're spending on
- Roast their spending priorities in a funny way
- Use Gen Z slang occasionally
- Give actual useful insights about their payment patterns
- Keep it light and entertaining
- Structure your response with clear sections using emojis as headers

Format your response with:
1. A funny opening that celebrates their rewards but questions their spending (2-3 sentences)
2. 🏆 Rewards Flex section - celebrate their cashback earnings briefly
3. 🎯 Spending Roast section - analyze and roast their payment choices (biggest section)
4. 💡 "Real Talk" section - actual useful advice about their spending patterns
5. A motivational but sarcastic closing that encourages better choices

Keep it under 250 words total. Focus heavily on analyzing PAYMENT PATTERNS for insights.`;

    const userPrompt = `Analyze this student's spending habits:
- Rewards Balance: £${balance.toFixed(2)} (this is good - they're earning cashback!)
- Monthly Rewards Earned: £${monthlyEarned.toFixed(2)}
- Recent Payments (THIS IS WHERE YOU FOCUS): ${recentPayments.map((p: any) => `${p.merchant} (£${p.amount})`).join(', ')}

Roast their SPENDING choices and provide insights based on WHAT they're paying for and HOW MUCH!`;

    const response = await fetch('https://ai.gateway.lovable.dev/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${LOVABLE_API_KEY}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        model: 'google/gemini-2.5-flash',
        messages: [
          { role: 'system', content: systemPrompt },
          { role: 'user', content: userPrompt }
        ],
      }),
    });

    if (!response.ok) {
      const errorText = await response.text();
      console.error('AI API error:', response.status, errorText);
      
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: 'Rate limit exceeded. Please try again in a moment! 🐌' }), 
          { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: 'AI credits exhausted. Time to top up! 💳' }), 
          { status: 402, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
      
      throw new Error(`AI API request failed: ${response.status}`);
    }

    const data = await response.json();
    const roast = data.choices[0].message.content;

    console.log('Generated roast successfully');

    return new Response(
      JSON.stringify({ roast }),
      { headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );

  } catch (error) {
    console.error('Error in generate-roast function:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
    return new Response(
      JSON.stringify({ error: errorMessage }),
      { status: 500, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  }
});