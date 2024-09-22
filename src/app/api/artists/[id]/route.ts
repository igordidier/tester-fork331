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
  const id = params.id;

  try {
    const { data, error } = await supabase
      .from('artists')
      .select('*')
      .eq('id', id)
      .single();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (!data) {
      return NextResponse.json({ error: 'Artist not found' }, { status: 404 });
    }

    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const { 
      first_name, 
      last_name, 
      email, 
      phone_number, 
      social, 
      website, 
      bio, 
      address, 
      profile_picture
    } = await request.json();

    const { data, error } = await supabase
      .from('artists')
      .update({
        first_name,
        last_name,
        email,
        phone_number,
        social,
        website,
        bio,
        address,
        profile_picture
      })
      .eq('id', id)
      .select();

    if (error) {
      console.error('Supabase error:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    if (data && data[0]) {
      const { error: userUpdateError } = await supabase.auth.admin.updateUserById(
        data[0].user_id,
        {
          email,
          user_metadata: {
            first_name,
            last_name
          }
        }
      );

      if (userUpdateError) {
        console.error('Error updating user metadata:', userUpdateError);
      }
    }

    return NextResponse.json(data[0]);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  const id = params.id;

  try {
    const { data: artistData, error: fetchError } = await supabase
      .from('artists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching artist:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    const { error: deleteArtistError } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);

    if (deleteArtistError) {
      console.error('Error deleting artist:', deleteArtistError);
      return NextResponse.json({ error: deleteArtistError.message }, { status: 500 });
    }

    if (artistData && artistData.user_id) {
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(artistData.user_id);

      if (deleteUserError) {
        console.error('Error deleting user:', deleteUserError);
        return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
      }
    }

    return NextResponse.json({ message: 'Artist and associated user deleted successfully' });
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}