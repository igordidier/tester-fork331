// app/api/artists/route.ts

import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';
import { v4 as uuidv4 } from 'uuid';
import nodemailer from 'nodemailer';

// Configure nodemailer with environment variables
const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: parseInt(process.env.SMTP_PORT || '587'),
  secure: process.env.SMTP_SECURE === 'true',
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

async function sendWelcomeEmail(email: string, password: string) {
  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: email,
    subject: 'Welcome to Our Team',
    text: `Welcome to our team! Your account has been created. 
    Your email: ${email}
    Your temporary password: ${password}
    Please log in and change your password as soon as possible.`,
  };

  try {
    await transporter.sendMail(mailOptions);
  } catch (error) {
    console.error('Failed to send email:', error);
    // Don't throw the error, just log it
  }
}

export async function GET(request: Request) {
    const supabase = createRouteHandlerClient({ cookies });
    
    try {
      const { data, error } = await supabase
        .from('artists')
        .select(`
          *,
          user:user_id (
            id,
            email,
            raw_user_meta_data
          ),
          manager:manager_id (
            id,
            email,
            raw_user_meta_data
          )
        `);
  
      if (error) {
        console.error('Supabase error:', error);
        return NextResponse.json({ error: error.message, details: error.details }, { status: 500 });
      }
  
      return NextResponse.json(data);
    } catch (error) {
      console.error('Unexpected error:', error);
      return NextResponse.json({ error: 'An unexpected error occurred', details: error }, { status: 500 });
    }
  }

export async function POST(request: Request) {
  const supabase = createRouteHandlerClient({ cookies });
  
  try {
    const formData = await request.formData();
    const firstName = formData.get('first_name') as string;
    const lastName = formData.get('last_name') as string;
    const email = formData.get('email') as string;
    const phoneNumber = formData.get('phone_number') as string;
    const social = formData.get('social') as string;
    const managerId = formData.get('manager_id') as string;

    // Generate a random password
    const tempPassword = uuidv4();

    // Create user account
    const { data: userData, error: userError } = await supabase.auth.admin.createUser({
      email: email,
      password: tempPassword,
      email_confirm: true,
      user_metadata: {
        role: 'artist',
        first_name: firstName,
        last_name: lastName,
        phone_number: phoneNumber,
        social: social,
        manager_id: managerId
      }
    });

    if (userError) {
      console.error('Error creating user:', userError);
      return NextResponse.json({ error: userError.message }, { status: 500 });
    }

    // Send welcome email (don't await, to avoid timeout)
    sendWelcomeEmail(email, tempPassword).catch(console.error);

    let profilePictureUrl = '';
    const file = formData.get('profile_picture') as File;

    if (file) {
      const { data: uploadData, error: uploadError } = await supabase.storage
        .from('profile-pictures')
        .upload(`${Date.now()}_${file.name}`, file);

      if (uploadError) {
        console.error('Supabase storage error:', uploadError);
        // Continue without the profile picture if upload fails
      } else {
        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(uploadData.path);

        profilePictureUrl = publicUrl;
      }
    }

    // Insert artist data
    const { data: artistData, error: artistError } = await supabase
      .from('artists')
      .insert([
        {
          user_id: userData.user.id,
          first_name: firstName,
          last_name: lastName,
          email: email,
          phone_number: phoneNumber,
          social: social,
          profile_picture: profilePictureUrl,
          manager_id: managerId
        }
      ])
      .select();

    if (artistError) {
      console.error('Supabase error:', artistError);
      return NextResponse.json({ error: artistError.message }, { status: 500 });
    }

    return NextResponse.json(artistData[0]);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json({ error: 'An unexpected error occurred' }, { status: 500 });
  }
}