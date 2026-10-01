import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase';

export async function GET() {
  try {
    // Perform a lightweight keep-alive query on Supabase users table
    const { count, error } = await supabase
      .from('users')
      .select('id', { count: 'exact', head: true });

    if (error) {
      return NextResponse.json(
        { status: 'warning', message: error.message, timestamp: new Date().toISOString() },
        { status: 200 }
      );
    }

    return NextResponse.json({
      status: 'ok',
      active: true,
      userCount: count ?? 0,
      timestamp: new Date().toISOString(),
    });
  } catch (err: unknown) {
    const errorMsg = err instanceof Error ? err.message : 'Unknown error';
    return NextResponse.json(
      { status: 'error', message: errorMsg, timestamp: new Date().toISOString() },
      { status: 500 }
    );
  }
}
