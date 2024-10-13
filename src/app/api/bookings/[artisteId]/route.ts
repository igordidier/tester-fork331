import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(
  request: Request,
  { params }: { params: { artistId: string } }
) {
  const artistId = params.artistId;

  try {
    const bookings = await prisma.booking.findMany({
      where: { artistId: artistId },
    });

    return NextResponse.json(bookings);
  } catch (error) {
    console.error('Failed to fetch bookings:', error);
    return NextResponse.json({ error: 'Failed to fetch bookings' }, { status: 500 });
  }
}

export async function POST(request: Request) {
  try {
    const body = await request.json();
    const { title, start, end, status, artistId } = body;

    const newBooking = await prisma.booking.create({
      data: {
        title,
        start,
        end,
        status,
        artistId,
      },
    });

    return NextResponse.json(newBooking, { status: 201 });
  } catch (error) {
    console.error('Failed to create booking:', error);
    return NextResponse.json({ error: 'Failed to create booking' }, { status: 500 });
  }
}

export async function PUT(
  request: Request,
  { params }: { params: { artistId: string } }
) {
  try {
    const artistId = params.artistId;
    const body = await request.json();
    const { id, title, start, end, status } = body;

    const updatedBooking = await prisma.booking.update({
      where: { id: id, artistId: artistId },
      data: { title, start, end, status },
    });

    return NextResponse.json(updatedBooking);
  } catch (error) {
    console.error('Failed to update booking:', error);
    return NextResponse.json({ error: 'Failed to update booking' }, { status: 500 });
  }
}

export async function DELETE(
  request: Request,
  { params }: { params: { artistId: string } }
) {
  try {
    const artistId = params.artistId;
    const url = new URL(request.url);
    const id = url.searchParams.get('id');

    if (!id) {
      return NextResponse.json({ error: 'Booking ID is required' }, { status: 400 });
    }

    await prisma.booking.delete({
      where: { id: id, artistId: artistId },
    });

    return NextResponse.json({ message: 'Booking deleted successfully' });
  } catch (error) {
    console.error('Failed to delete booking:', error);
    return NextResponse.json({ error: 'Failed to delete booking' }, { status: 500 });
  }
}