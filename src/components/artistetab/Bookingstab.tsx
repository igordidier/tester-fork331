"use client";

import React, { useState, useEffect, useCallback } from 'react';
import { Calendar, momentLocalizer } from 'react-big-calendar';
import moment from 'moment';
import 'react-big-calendar/lib/css/react-big-calendar.css';

// Set up the localizer for react-big-calendar
const localizer = momentLocalizer(moment);

interface Booking {
  id: string;
  title: string;
  start: Date;
  end: Date;
  status: 'confirmed' | 'pending' | 'completed';
}

interface BookingsTabProps {
  artistId: string;
}

const BookingsTab: React.FC<BookingsTabProps> = ({ artistId }) => {
  const [view, setView] = useState<'calendar' | 'list'>('calendar');
  const [selectedBooking, setSelectedBooking] = useState<Booking | null>(null);
  const [bookings, setBookings] = useState<Booking[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchBookings = useCallback(async () => {
    try {
      setIsLoading(true);
      const response = await fetch(`/api/bookings/${artistId}`);
      if (!response.ok) {
        throw new Error('Failed to fetch bookings');
      }
      const data = await response.json();
      setBookings(data);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'An error occurred');
    } finally {
      setIsLoading(false);
    }
  }, [artistId]);

  useEffect(() => {
    fetchBookings();
  }, [fetchBookings]);

  const createBooking = async (bookingData: Partial<Booking>) => {
    try {
      const response = await fetch('/api/bookings', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(bookingData),
      });
      if (!response.ok) {
        throw new Error('Failed to create booking');
      }
      const newBooking = await response.json();
      setBookings(prevBookings => [...prevBookings, newBooking]);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Failed to create booking');
    }
  };

  const handleSelectEvent = (event: Booking) => {
    setSelectedBooking(event);
  };

  const handleCreateBooking = () => {
    const newBooking: Partial<Booking> = {
      title: 'New Booking',
      start: new Date(),
      end: new Date(new Date().getTime() + 2 * 60 * 60 * 1000), // 2 hours from now
      status: 'pending',
    };
    createBooking(newBooking);
  };

  if (isLoading) return <div>Loading bookings...</div>;
  if (error) return <div>Error: {error}</div>;

  const eventStyleGetter = (event: Booking) => {
    let backgroundColor = '#3174ad';
    if (event.status === 'confirmed') backgroundColor = '#5cb85c';
    if (event.status === 'completed') backgroundColor = '#5bc0de';
    return { style: { backgroundColor } };
  };

  return (
    <div className="p-4">
      <div className="mb-4">
        <button
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setView('calendar')}
        >
          Calendar View
        </button>
        <button
          className="mr-2 px-4 py-2 bg-blue-500 text-white rounded"
          onClick={() => setView('list')}
        >
          List View
        </button>
        <button
          className="px-4 py-2 bg-green-500 text-white rounded"
          onClick={handleCreateBooking}
        >
          Create Booking
        </button>
      </div>

      {view === 'calendar' ? (
        <Calendar
          localizer={localizer}
          events={bookings}
          startAccessor="start"
          endAccessor="end"
          style={{ height: 500 }}
          onSelectEvent={handleSelectEvent}
          eventPropGetter={eventStyleGetter}
        />
      ) : (
        <table className="min-w-full">
          <thead>
            <tr>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Title
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Start
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 font-medium text-gray-500 uppercase tracking-wider">
                End
              </th>
              <th className="px-6 py-3 border-b-2 border-gray-300 text-left text-sm leading-4 font-medium text-gray-500 uppercase tracking-wider">
                Status
              </th>
            </tr>
          </thead>
          <tbody>
            {bookings.map((booking) => (
              <tr key={booking.id} onClick={() => handleSelectEvent(booking)}>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {booking.title}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {moment(booking.start).format('MMMM Do YYYY, h:mm a')}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {moment(booking.end).format('MMMM Do YYYY, h:mm a')}
                </td>
                <td className="px-6 py-4 whitespace-no-wrap border-b border-gray-500">
                  {booking.status}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}

      {selectedBooking && (
        <div className="mt-4 p-4 border rounded">
          <h3 className="text-lg font-semibold">{selectedBooking.title}</h3>
          <p>Start: {moment(selectedBooking.start).format('MMMM Do YYYY, h:mm a')}</p>
          <p>End: {moment(selectedBooking.end).format('MMMM Do YYYY, h:mm a')}</p>
          <p>Status: {selectedBooking.status}</p>
        </div>
      )}
    </div>
  );
};

export default BookingsTab;