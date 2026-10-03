import { NextResponse } from 'next/server';
import { lessons } from '@/lib/lessons';
import { generateRandomCertificateId } from '@/lib/certificate';
import { supabase } from '@/lib/supabase';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { completedLessons, userId, email } = body || {};

    if (!Array.isArray(completedLessons)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
    }

    if (!userId && !email) {
      return NextResponse.json({ error: 'Authentication required. No user specified.' }, { status: 401 });
    }

    // Server-side lookup of certificate name from user account database
    let dbCertName: string | null = null;
    let resolvedUserId: string | null = userId || null;

    try {
      const { data: dbUser } = userId
        ? await supabase.from('users').select('id, certificate_name').eq('id', userId).maybeSingle()
        : await supabase.from('users').select('id, certificate_name').eq('email', (email || '').toLowerCase()).maybeSingle();

      if (dbUser && dbUser.certificate_name && dbUser.certificate_name.trim()) {
        dbCertName = dbUser.certificate_name.trim().toUpperCase();
        resolvedUserId = dbUser.id;
      }
    } catch (err) {
      console.warn('Supabase fetch error in certificate issue route:', err);
    }

    if (!dbCertName) {
      return NextResponse.json(
        { error: 'No certificate name found on user account. Please complete account setup.' },
        { status: 400 }
      );
    }

    // Dynamic deduplicated valid lesson check against lib/lessons.ts
    const validSlugs = new Set(lessons.map((l) => l.slug));
    const uniqueValidCompleted = new Set(
      completedLessons.filter((slug: string) => validSlugs.has(slug))
    ).size;

    const totalLessons = lessons.length;
    const isCompleted100 = uniqueValidCompleted >= totalLessons;

    if (!isCompleted100) {
      return NextResponse.json(
        {
          error: `Requirements not met. Cleared ${uniqueValidCompleted} of ${totalLessons} lessons.`,
          isUnlocked: false,
        },
        { status: 403 }
      );
    }

    // Generate server-side random, unguessable certificate ID
    const certificateId = generateRandomCertificateId();
    const issuedAt = new Date().toISOString();

    // Store official certificate in Supabase database
    try {
      await supabase.from('certificates').upsert({
        id: certificateId,
        user_id: resolvedUserId,
        recipient_name: dbCertName,
        course_name: 'SQL Mastery',
        issued_at: issuedAt,
      });
    } catch (err) {
      console.warn('Supabase insert certificate error:', err);
    }

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      certificateId,
      issuedAt,
      learnerName: dbCertName,
    });
  } catch (err) {
    console.error('Error issuing certificate server-side:', err);
    return NextResponse.json({ error: 'Server error issuing certificate' }, { status: 500 });
  }
}
