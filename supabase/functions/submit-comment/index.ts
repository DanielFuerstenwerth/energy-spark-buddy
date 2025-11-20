import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.76.0';
import { z } from 'https://deno.land/x/zod@v3.22.4/mod.ts';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

// Validation schema
const SubmitCommentSchema = z.object({
  route: z.string().trim().min(1).max(500),
  text: z.string().trim().min(1, 'Comment cannot be empty').max(5000, 'Comment too long (max 5000 characters)'),
  author_name: z.string().trim().max(100, 'Name too long (max 100 characters)').optional(),
  author_email: z.string().trim().email('Invalid email address').max(255, 'Email too long').optional(),
  vnb_name: z.string().trim().max(200).optional().nullable(),
  kriterium: z.string().trim().max(200).optional().nullable(),
});

// Rate limiting configuration
const RATE_LIMIT_WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MAX_SUBMISSIONS_PER_WINDOW = 5;

// In-memory storage for rate limiting (will reset when function instance restarts)
const rateLimitStore = new Map<string, number[]>();

function cleanupOldEntries() {
  const now = Date.now();
  for (const [ip, timestamps] of rateLimitStore.entries()) {
    const recentTimestamps = timestamps.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
    if (recentTimestamps.length === 0) {
      rateLimitStore.delete(ip);
    } else {
      rateLimitStore.set(ip, recentTimestamps);
    }
  }
}

function checkRateLimit(clientIp: string): { allowed: boolean; waitMinutes?: number } {
  cleanupOldEntries();
  
  const now = Date.now();
  const submissions = rateLimitStore.get(clientIp) || [];
  const recentSubmissions = submissions.filter(t => now - t < RATE_LIMIT_WINDOW_MS);

  if (recentSubmissions.length >= MAX_SUBMISSIONS_PER_WINDOW) {
    const oldestSubmission = Math.min(...recentSubmissions);
    const waitMinutes = Math.ceil((RATE_LIMIT_WINDOW_MS - (now - oldestSubmission)) / 1000 / 60);
    return { allowed: false, waitMinutes };
  }

  return { allowed: true };
}

function recordSubmission(clientIp: string) {
  const now = Date.now();
  const submissions = rateLimitStore.get(clientIp) || [];
  const recentSubmissions = submissions.filter(t => now - t < RATE_LIMIT_WINDOW_MS);
  recentSubmissions.push(now);
  rateLimitStore.set(clientIp, recentSubmissions);
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Get client IP address from headers
    const clientIp = req.headers.get('x-forwarded-for')?.split(',')[0].trim() || 
                     req.headers.get('x-real-ip') || 
                     'unknown';

    console.log('Comment submission from IP:', clientIp);

    // Check rate limit
    const rateLimitCheck = checkRateLimit(clientIp);
    if (!rateLimitCheck.allowed) {
      console.log(`Rate limit exceeded for IP: ${clientIp}, wait: ${rateLimitCheck.waitMinutes} minutes`);
      return new Response(
        JSON.stringify({
          error: 'Rate limit exceeded',
          message: `You have submitted too many comments. Please wait ${rateLimitCheck.waitMinutes} minutes before submitting again.`,
          waitMinutes: rateLimitCheck.waitMinutes,
        }),
        {
          status: 429,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Parse and validate request body
    const body = await req.json();
    const validation = SubmitCommentSchema.safeParse(body);

    if (!validation.success) {
      console.error('Validation error:', validation.error.errors);
      return new Response(
        JSON.stringify({
          error: 'Validation error',
          details: validation.error.errors[0]?.message || 'Invalid input',
        }),
        {
          status: 400,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Create Supabase client with service role key
    const supabaseUrl = Deno.env.get('SUPABASE_URL')!;
    const supabaseServiceKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!;
    const supabase = createClient(supabaseUrl, supabaseServiceKey);

    // Insert comment into database
    const { data, error } = await supabase
      .from('comments')
      .insert({
        route: validation.data.route,
        text: validation.data.text,
        author_name: validation.data.author_name || null,
        author_email: validation.data.author_email || null,
        vnb_name: validation.data.vnb_name || null,
        kriterium: validation.data.kriterium || null,
        status: 'pending',
      })
      .select()
      .single();

    if (error) {
      console.error('Database error:', error);
      return new Response(
        JSON.stringify({
          error: 'Failed to submit comment',
          message: 'An error occurred while submitting your comment. Please try again.',
        }),
        {
          status: 500,
          headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        }
      );
    }

    // Record successful submission for rate limiting
    recordSubmission(clientIp);

    console.log('Comment submitted successfully:', data.id);

    return new Response(
      JSON.stringify({
        success: true,
        message: 'Comment submitted successfully and is pending moderation',
        comment: data,
      }),
      {
        status: 200,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  } catch (error) {
    console.error('Unexpected error:', error);
    return new Response(
      JSON.stringify({
        error: 'Internal server error',
        message: 'An unexpected error occurred. Please try again later.',
      }),
      {
        status: 500,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      }
    );
  }
});
