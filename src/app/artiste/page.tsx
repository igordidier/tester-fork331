"use client";

import React, { useEffect, useState, useRef } from 'react';
import VerticalMenu from '../../components/VerticalMenu';
import { PlusIcon, PhotoIcon } from '@heroicons/react/24/solid';
import { useUser } from '../../hooks/useUser'; // Adjust this import path as needed

interface Artist {
  id: string;
  user_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  social: string;
  profile_picture: string;
  manager_id: string;
}

export default function ArtistePage() {
  const { user } = useUser(); // Make sure you have this hook implemented
  const [artists, setArtists] = useState<Artist[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [showModal, setShowModal] = useState(false);
  const [newArtist, setNewArtist] = useState({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    social: '',
  });
  const [file, setFile] = useState<File | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/artists');
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
      const data = await response.json();
      setArtists(data);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setError('Failed to fetch artists');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setNewArtist({ ...newArtist, [e.target.name]: e.target.value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const formData = new FormData();
      Object.entries(newArtist).forEach(([key, value]) => {
        formData.append(key, value);
      });
      if (file) {
        formData.append('profile_picture', file);
      }
      // Add manager_id to the form data
      formData.append('manager_id', user?.id || '');

      const response = await fetch('/api/artists', {
        method: 'POST',
        body: formData,
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || `HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      setShowModal(false);
      setArtists([data, ...artists]);
      setNewArtist({
        first_name: '',
        last_name: '',
        email: '',
        phone_number: '',
        social: '',
      });
      setFile(null);
      alert('Artist added successfully. An email will be sent to the artist with their login credentials.');
    } catch (error) {
      console.error('Error creating artist:', error);
      setError(error instanceof Error ? error.message : 'Failed to create artist');
      alert(`Failed to create artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    }
  };

  const closeModal = () => {
    setShowModal(false);
    setNewArtist({
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      social: '',
    });
    setFile(null);
  };

  if (loading) return <div className="flex items-center justify-center h-screen">Loading...</div>;
  if (error) return (
    <div className="flex items-center justify-center h-screen flex-col">
      <h2 className="text-2xl font-bold text-red-600 mb-4">Error</h2>
      <p className="text-gray-800">{error}</p>
      <button 
        onClick={fetchArtists} 
        className="mt-4 px-4 py-2 bg-blue-500 text-white rounded hover:bg-blue-600"
      >
        Retry
      </button>
    </div>
  );
  return (
    <div className="flex h-screen bg-gray-100">
      <div className="flex flex-col w-64 bg-gray-800">
        <div className="flex items-center justify-center h-16 px-4 bg-gray-900">
          <h1 className="text-lg font-medium text-white">Artist Manager</h1>
        </div>
        <div className="flex-1 overflow-y-auto">
          <VerticalMenu />
        </div>
      </div>
      <div className="flex-1 overflow-x-hidden overflow-y-auto">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8 flex justify-between items-center">
            <h1 className="text-3xl font-bold text-gray-900">Artists</h1>
            <button
              onClick={() => setShowModal(true)}
              className="px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
            >
              <PlusIcon className="h-5 w-5 mr-2 inline-block" />
              Add Artist
            </button>
          </div>
        </header>
        <main className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
          <div className="px-4 py-6 sm:px-0">
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Name</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Phone</th>
                    <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Social</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {artists.map((artist) => (
                    <tr key={artist.id}>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="flex items-center">
                          <div className="flex-shrink-0 h-10 w-10">
                            <img className="h-10 w-10 rounded-full object-cover" src={artist.profile_picture || 'https://via.placeholder.com/100'} alt="" />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">{artist.first_name} {artist.last_name}</div>
                          </div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{artist.email}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm text-gray-900">{artist.phone_number}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                        {artist.social}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </main>
      </div>
      
      {showModal && (
        <div className="fixed z-10 inset-0 overflow-y-auto">
          <div className="flex items-end justify-center min-h-screen pt-4 px-4 pb-20 text-center sm:block sm:p-0">
            <div className="fixed inset-0 transition-opacity" aria-hidden="true">
              <div className="absolute inset-0 bg-gray-500 opacity-75"></div>
            </div>
            <span className="hidden sm:inline-block sm:align-middle sm:h-screen" aria-hidden="true">&#8203;</span>
            <div className="inline-block align-bottom bg-white rounded-lg text-left overflow-hidden shadow-xl transform transition-all sm:my-8 sm:align-middle sm:max-w-lg sm:w-full">
              <form onSubmit={handleSubmit}>
                <div className="bg-white px-4 pt-5 pb-4 sm:p-6 sm:pb-4">
                  <div className="mb-4">
                    <label htmlFor="first_name" className="block text-gray-700 text-sm font-bold mb-2">First Name</label>
                    <input type="text" name="first_name" id="first_name" onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="last_name" className="block text-gray-700 text-sm font-bold mb-2">Last Name</label>
                    <input type="text" name="last_name" id="last_name" onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="email" className="block text-gray-700 text-sm font-bold mb-2">Email</label>
                    <input type="email" name="email" id="email" onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="phone_number" className="block text-gray-700 text-sm font-bold mb-2">Phone Number</label>
                    <input type="tel" name="phone_number" id="phone_number" onChange={handleInputChange} required className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="social" className="block text-gray-700 text-sm font-bold mb-2">Social</label>
                    <input type="text" name="social" id="social" onChange={handleInputChange} className="shadow appearance-none border rounded w-full py-2 px-3 text-gray-700 leading-tight focus:outline-none focus:shadow-outline" />
                  </div>
                  <div className="mb-4">
                    <label htmlFor="profile_picture" className="block text-gray-700 text-sm font-bold mb-2">Profile Picture</label>
                    <input
                      type="file"
                      id="profile_picture"
                      onChange={handleFileChange}
                      accept="image/*"
                      className="hidden"
                      ref={fileInputRef}
                    />
                    <div className="mt-1 flex items-center">
                      {file ? (
                        <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                          <img src={URL.createObjectURL(file)} alt="Preview" className="h-full w-full object-cover" />
                        </span>
                      ) : (
                        <span className="inline-block h-12 w-12 rounded-full overflow-hidden bg-gray-100">
                          <PhotoIcon className="h-full w-full text-gray-300" />
                        </span>
                      )}
                      <button
                        type="button"
                        className="ml-5 bg-white py-2 px-3 border border-gray-300 rounded-md shadow-sm text-sm leading-4 font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                        onClick={() => fileInputRef.current?.click()}
                      >
                        Change
                      </button>
                    </div>
                  </div>
                </div>
                <div className="bg-gray-50 px-4 py-3 sm:px-6 sm:flex sm:flex-row-reverse">
                  <button
                    type="submit"
                    className="w-full inline-flex justify-center rounded-md border border-transparent shadow-sm px-4 py-2 bg-indigo-600 text-base font-medium text-white hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Add Artist
                  </button>
                  <button
                    type="button"
                    onClick={closeModal}
                    className="mt-3 w-full inline-flex justify-center rounded-md border border-gray-300 shadow-sm px-4 py-2 bg-white text-base font-medium text-gray-700 hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 sm:mt-0 sm:ml-3 sm:w-auto sm:text-sm"
                  >
                    Cancel
                  </button>
                </div>
              </form>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}