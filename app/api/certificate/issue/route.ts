import { NextResponse } from 'next/server';
import { lessons } from '@/lib/lessons';
import { generateRandomCertificateId } from '@/lib/certificate';

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { completedLessons, userId, certificateName } = body || {};

    if (!Array.isArray(completedLessons)) {
      return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
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

    return NextResponse.json({
      success: true,
      isUnlocked: true,
      certificateId,
      issuedAt,
      learnerName: (certificateName || 'KATHIRAVAN V').trim().toUpperCase(),
    });
  } catch (err) {
    console.error('Error issuing certificate server-side:', err);
    return NextResponse.json({ error: 'Server error issuing certificate' }, { status: 500 });
  }
}
