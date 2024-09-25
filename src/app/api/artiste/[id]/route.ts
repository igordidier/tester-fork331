import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  console.log('GET request received for artist ID:', params.id);

  const { id } = params;

  try {
    const { data: artist, error } = await supabase
      .from('artists')
      .select('id, first_name, last_name, email, phone_number, bio, profile_picture')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error in GET:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!artist) {
      console.log('Artist not found');
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    console.log('Artist data retrieved successfully');
    return NextResponse.json(artist);
  } catch (error) {
    console.error('Unexpected error in GET:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}