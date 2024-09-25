"use client";

import React, { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import { Tab } from '@headlessui/react';
import { CalendarIcon, DocumentTextIcon, CurrencyDollarIcon, MapIcon, UserGroupIcon, ChartBarIcon } from '@heroicons/react/24/outline';
import VerticalMenu from '../../../components/VerticalMenu';


interface Artist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  bio: string;
  profile_picture: string;
}

export default function ArtistPage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        setLoading(true);
        const response = await fetch(`/api/artiste/${id}`);
        console.log('Response status:', response.status);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        
        const data = await response.json();
        console.log('Fetched data:', data);
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist:', error);
        setError(error instanceof Error ? error.message : 'An unexpected error occurred');
      } finally {
        setLoading(false);
      }
    };

    if (id) {
      fetchArtist();
    }
  }, [id]);

  const tabs = [
    { name: 'Overview', icon: ChartBarIcon, content: () => (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Overview</h2>
        <p className="mt-1 text-gray-500">{artist?.bio || "No bio available."}</p>
      </div>
    )},
    { name: 'Bookings', icon: CalendarIcon, content: () => (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Bookings</h2>
        <p className="mt-1 text-gray-500">Booking information will be displayed here.</p>
      </div>
    )},
    { name: 'Contracts', icon: DocumentTextIcon, content: () => (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Contracts</h2>
        <p className="mt-1 text-gray-500">Contract information will be displayed here.</p>
      </div>
    )},
    { name: 'Financials', icon: CurrencyDollarIcon, content: () => (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Financials</h2>
        <p className="mt-1 text-gray-500">Financial information will be displayed here.</p>
      </div>
    )},
    { name: 'Itinerary', icon: MapIcon, content: () => (
      <div>
        <h2 className="text-lg font-medium text-gray-900">Itinerary</h2>
        <p className="mt-1 text-gray-500">Itinerary information will be displayed here.</p>
      </div>
    )},
    { name: 'CRM', icon: UserGroupIcon, content: () => (
      <div>
        <h2 className="text-lg font-medium text-gray-900">CRM</h2>
        <p className="mt-1 text-gray-500">CRM information will be displayed here.</p>
      </div>
    )},
  ];

  if (loading) {
    return (
      <div className="flex h-screen bg-gray-50">
      <VerticalMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <div className="text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-blue-500 mx-auto"></div>
          <p className="mt-4 text-xl font-semibold text-gray-700">Loading...</p>
        </div>
      </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-xl rounded-xl max-w-2xl">
          <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
          <p className="text-gray-700 mb-4">{error}</p>
          <button 
            onClick={() => window.location.reload()} 
            className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  if (!artist) {
    return (
      <div className="flex items-center justify-center min-h-screen bg-gray-100">
        <div className="text-center p-8 bg-white shadow-xl rounded-xl">
          <h2 className="text-2xl font-bold text-gray-800 mb-4">No Artist Data</h2>
          <p className="text-gray-700">No artist data found for the given ID.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <main className="py-10">
        <div className="max-w-7xl mx-auto sm:px-6 lg:px-8">
          <div className="bg-white overflow-hidden shadow-xl sm:rounded-lg">
            <div className="px-4 py-5 sm:px-6">
              <div className="flex items-center">
                <div className="flex-shrink-0 h-20 w-20">
                  {artist.profile_picture ? (
                    <img className="h-20 w-20 rounded-full object-cover" src={artist.profile_picture} alt={`${artist.first_name} ${artist.last_name}`} />
                  ) : (
                    <div className="h-20 w-20 rounded-full bg-gray-300 flex items-center justify-center text-gray-500 text-2xl font-bold">
                      {artist.first_name[0]}{artist.last_name[0]}
                    </div>
                  )}
                </div>
                <div className="ml-5">
                  <h1 className="text-2xl font-bold text-gray-900">{artist.first_name} {artist.last_name}</h1>
                  <p className="text-sm text-gray-500">{artist.email}</p>
                  <p className="text-sm text-gray-500">{artist.phone_number}</p>
                </div>
              </div>
            </div>
            <Tab.Group>
              <Tab.List className="flex p-1 space-x-1 bg-gray-200">
                {tabs.map((tab) => (
                  <Tab
                    key={tab.name}
                    className={({ selected }) =>
                      `w-full py-2.5 text-sm leading-5 font-medium rounded-lg focus:outline-none focus:ring-2 ring-offset-2 ring-offset-blue-400 ring-white ring-opacity-60 ${
                        selected
                          ? 'bg-white text-blue-700 shadow'
                          : 'text-gray-700 hover:bg-white/[0.12] hover:text-blue-700'
                      }`
                    }
                  >
                    <div className="flex items-center justify-center">
                      <tab.icon className="w-5 h-5 mr-2" />
                      {tab.name}
                    </div>
                  </Tab>
                ))}
              </Tab.List>
              <Tab.Panels className="mt-2">
                {tabs.map((tab, idx) => (
                  <Tab.Panel
                    key={idx}
                    className="bg-white rounded-xl p-3"
                  >
                    {tab.content()}
                  </Tab.Panel>
                ))}
              </Tab.Panels>
            </Tab.Group>
          </div>
        </div>
      </main>
    </div>
  );
}