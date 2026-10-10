import { NextResponse } from 'next/server';
import { runAutonomousPipeline } from '@/lib/cron/runner';

export async function POST(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      // If authorization is supplied, enforce match
      if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    let body: any = {};
    try {
      body = await request.json();
    } catch {
      // Empty or non-JSON body allowed
    }

    const result = await runAutonomousPipeline({
      keywords: body.keywords,
      maxJobsToScore: body.maxJobsToScore || 10,
    });

    return NextResponse.json({
      status: 'success',
      pipeline: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Pipeline execution failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

export async function GET(request: Request) {
  try {
    const cronSecret = process.env.CRON_SECRET;
    if (cronSecret) {
      const authHeader = request.headers.get('authorization');
      if (authHeader && authHeader !== `Bearer ${cronSecret}`) {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
      }
    }

    const result = await runAutonomousPipeline();
    return NextResponse.json({
      status: 'success',
      pipeline: result,
    });
  } catch (error: any) {
    return NextResponse.json(
      { error: 'Pipeline execution failed', message: error?.message || 'Unknown error' },
      { status: 500 }
    );
  }
}

