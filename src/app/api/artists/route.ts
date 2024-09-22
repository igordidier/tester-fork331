import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

const supabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
);

export async function GET(request: Request) {
  console.log('GET request received');
  const { searchParams } = new URL(request.url);
  const managerId = searchParams.get('managerId');

  try {
    let query = supabase.from('artists').select('*');
    
    if (managerId) {
      query = query.eq('manager_id', managerId);
    }

    const { data, error } = await query.order('last_name');

    if (error) {
      console.error('Supabase error in GET:', error);
      return NextResponse.json({ error: error.message }, { status: 500 });
    }

    console.log(`Retrieved ${data?.length} artists`);
    return NextResponse.json(data);
  } catch (error) {
    console.error('Unexpected error in GET:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  console.log('POST request received');
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
      profile_picture,
      managerId
    } = await request.json();

    console.log('Received data:', { first_name, last_name, email, managerId });

    // Generate a random password for the new user
    const password = Math.random().toString(36).slice(-10) + Math.random().toString(36).slice(-10);

    console.log('Attempting to create user with email:', email);

    // Create user account with 'artist' role
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email,
      password,
      email_confirm: true,
      user_metadata: {
        role: 'artist',
        first_name,
        last_name
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    if (!userData || !userData.user) {
      console.error('User data is undefined or null');
      return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
    }

    console.log('User created successfully:', userData.user.id);

    // Insert artist data with user_id
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .insert([
        {
          user_id: userData.user.id,
          first_name,
          last_name,
          email,
          phone_number,
          social,
          website,
          bio,
          address,
          profile_picture,
          manager_id: managerId
        }
      ])
      .select();

    if (artistError) {
      console.error('Supabase error when creating artist:', artistError);
      return NextResponse.json({ error: artistError.message }, { status: 500 });
    }

    console.log('Artist created successfully:', artistData);

    return NextResponse.json(artistData[0]);
  } catch (error) {
    console.error('Unexpected error in POST:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error }, { status: 500 });
  }
}

export async function PUT(request: Request) {
  console.log('PUT request received');
  try {
    const { 
      id,
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

    console.log('Updating artist with id:', id);

    // Update artist data
    const { data: artistData, error: artistError } = await supabase
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

    if (artistError) {
      console.error('Supabase error when updating artist:', artistError);
      return NextResponse.json({ error: artistError.message }, { status: 500 });
    }

    // Update user metadata
    if (artistData && artistData[0]) {
      console.log('Updating user metadata for user:', artistData[0].user_id);
      const { error: userUpdateError } = await supabase.auth.admin.updateUserById(
        artistData[0].user_id,
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
        // We don't return here as the artist data was updated successfully
      }
    }

    console.log('Artist updated successfully');
    return NextResponse.json(artistData[0]);
  } catch (error) {
    console.error('Unexpected error in PUT:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error }, { status: 500 });
  }
}

export async function DELETE(request: Request) {
  console.log('DELETE request received');
  const { searchParams } = new URL(request.url);
  const id = searchParams.get('id');

  if (!id) {
    console.error('No artist ID provided for deletion');
    return NextResponse.json({ error: 'Artist ID is required' }, { status: 400 });
  }

  try {
    console.log('Fetching user_id for artist:', id);
    // First, get the user_id associated with this artist
    const { data: artistData, error: fetchError } = await supabase
      .from('artists')
      .select('user_id')
      .eq('id', id)
      .single();

    if (fetchError) {
      console.error('Error fetching artist:', fetchError);
      return NextResponse.json({ error: fetchError.message }, { status: 500 });
    }

    console.log('Deleting artist record');
    // Delete the artist record
    const { error: deleteArtistError } = await supabase
      .from('artists')
      .delete()
      .eq('id', id);

    if (deleteArtistError) {
      console.error('Error deleting artist:', deleteArtistError);
      return NextResponse.json({ error: deleteArtistError.message }, { status: 500 });
    }

    // Delete the associated user account
    if (artistData && artistData.user_id) {
      console.log('Deleting associated user account:', artistData.user_id);
      const { error: deleteUserError } = await supabase.auth.admin.deleteUser(artistData.user_id);

      if (deleteUserError) {
        console.error('Error deleting user:', deleteUserError);
        return NextResponse.json({ error: deleteUserError.message }, { status: 500 });
      }
    }

    console.log('Artist and associated user deleted successfully');
    return NextResponse.json({ message: 'Artist and associated user deleted successfully' });
  } catch (error) {
    console.error('Unexpected error in DELETE:', error);
    return NextResponse.json({ error: 'An unexpected error occurred', details: error }, { status: 500 });
  }
}