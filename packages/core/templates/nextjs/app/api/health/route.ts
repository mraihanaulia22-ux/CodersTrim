import { NextResponse } from 'next/server';

export async function GET() {
  return NextResponse.json({
    status: 'healthy',
    framework: 'Next.js 16 App Router',
    app: '__CT_PROJECT_NAME__',
  });
}
