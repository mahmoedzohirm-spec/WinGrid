import { NextRequest, NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function POST(req: NextRequest) {
  try {
    const pathParts = req.nextUrl.pathname.split('/');
    const orderId = pathParts[pathParts.length - 2];

    const { file, fileName, mimeType } = await req.json();

    if (!file || !fileName || !orderId) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Convert base64 to buffer
    const buffer = Buffer.from(file, 'base64');

    // Upload to Supabase Storage
    const storagePath = `receipts/${orderId}/${fileName}`;
    const { error: uploadError } = await supabase.storage
      .from('wingrid-receipts')
      .upload(storagePath, buffer, {
        contentType: mimeType,
      });

    if (uploadError) {
      console.error('Storage error:', uploadError);
      return NextResponse.json(
        { error: 'Failed to upload receipt' },
        { status: 500 }
      );
    }

    // Get public URL
    const { data } = supabase.storage
      .from('wingrid-receipts')
      .getPublicUrl(storagePath);

    // Update order with receipt URL
    const { error: updateError } = await supabase
      .from('orders')
      .update({
        receiptUrl: data.publicUrl,
        receiptFileName: fileName,
        updatedAt: new Date().toISOString(),
      })
      .eq('id', orderId);

    if (updateError) {
      console.error('Update error:', updateError);
      return NextResponse.json(
        { error: 'Failed to update order' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      { receiptUrl: data.publicUrl },
      { status: 200 }
    );
  } catch (error) {
    console.error('Error uploading receipt:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
