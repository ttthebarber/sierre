import { NextRequest, NextResponse } from 'next/server';
import { auth } from "@clerk/nextjs/server";
import { createSupabaseServerClient } from '@/lib/supabaseServer';

export async function GET() {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    const supabase = await createSupabaseServerClient();
    
    // Get user's stores
    const { data: stores } = await supabase
      .from('stores')
      .select('*')
      .eq('user_id', userId);

    if (!stores || stores.length === 0) {
      return NextResponse.json({ insights: [] });
    }

    // Return empty insights since we're using the AI insights service directly
    // This endpoint is kept for compatibility but not actively used
    return NextResponse.json({ insights: [] });
  } catch (error) {
    console.error('AI Insights GET error:', error);
    return NextResponse.json({ error: 'Failed to fetch insights' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  const { userId } = await auth();
  
  if (!userId) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  try {
    // This endpoint is kept for compatibility but not actively used
    // The AI insights are now generated directly in the frontend using the AI insights service
    return NextResponse.json({ insights: [] });
  } catch (error) {
    console.error('AI Insights error:', error);
    return NextResponse.json({ error: 'Failed to generate insights' }, { status: 500 });
  }
}