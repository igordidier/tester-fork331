"use client";

import React, { useEffect, useState } from 'react';
import { useSupabaseClient } from '@supabase/auth-helpers-react';
import { Dialog, Transition } from '@headlessui/react';
import { PlusIcon, PencilIcon, TrashIcon, UserCircleIcon } from '@heroicons/react/24/outline';
import VerticalMenu from '../../components/VerticalMenu';
import Link from 'next/link';


interface Artist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  social: string;
  profile_picture: string;
  bio: string;
  website: string;
  address: string;
}

export default function ArtistPage() {
  const supabase = useSupabaseClient();
  const [artists, setArtists] = useState<Artist[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [selectedArtist, setSelectedArtist] = useState<Artist | null>(null);
  const [formData, setFormData] = useState<Partial<Artist>>({
    first_name: '',
    last_name: '',
    email: '',
    phone_number: '',
    social: '',
    bio: '',
    website: '',
    address: '',
  });
  const [file, setFile] = useState<File | null>(null);

  useEffect(() => {
    fetchArtists();
  }, []);

  const fetchArtists = async () => {
    setIsLoading(true);
    try {
      const { data, error } = await supabase
        .from('artists')
        .select('*')
        .order('last_name');

      if (error) throw error;
      setArtists(data || []);
    } catch (error) {
      console.error('Error fetching artists:', error);
      setError('Failed to fetch artists. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData({ ...formData, [name]: value });
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    setIsLoading(true);
    try {
      let profilePictureUrl = formData.profile_picture || '';
      if (file) {
        const { data: uploadData, error: uploadError } = await supabase.storage
          .from('profile-pictures')
          .upload(`${Date.now()}_${file.name}`, file);

        if (uploadError) throw uploadError;

        const { data: { publicUrl } } = supabase.storage
          .from('profile-pictures')
          .getPublicUrl(uploadData.path);

        profilePictureUrl = publicUrl;
      }

      const artistData = {
        ...formData,
        profile_picture: profilePictureUrl,
      };

      let result;
      if (selectedArtist) {
        result = await supabase
          .from('artists')
          .update(artistData)
          .eq('id', selectedArtist.id)
          .select();
      } else {
        result = await supabase
          .from('artists')
          .insert([artistData])
          .select();
      }

      if (result.error) throw result.error;

      await fetchArtists();
      closeModal();
    } catch (error) {
      console.error('Error saving artist:', error);
      setError(`Failed to save artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
    } finally {
      setIsLoading(false);
    }
  };

  const openModal = (artist: Artist | null = null) => {
    setSelectedArtist(artist);
    setFormData(artist || {
      first_name: '',
      last_name: '',
      email: '',
      phone_number: '',
      social: '',
      bio: '',
      website: '',
      address: '',
    });
    setFile(null);
    setIsModalOpen(true);
  };

  const closeModal = () => {
    setIsModalOpen(false);
    setSelectedArtist(null);
    setFormData({});
    setFile(null);
  };

  const handleDeleteArtist = async (id: string) => {
    if (window.confirm('Are you sure you want to delete this artist?')) {
      try {
        const { error } = await supabase
          .from('artists')
          .delete()
          .eq('id', id);

        if (error) throw error;

        await fetchArtists();
      } catch (error) {
        console.error('Error deleting artist:', error);
        setError(`Failed to delete artist: ${error instanceof Error ? error.message : 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="flex h-screen bg-gray-50">
      <VerticalMenu />
      <div className="flex-1 flex flex-col overflow-hidden">
        <header className="bg-white shadow">
          <div className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
            <h1 className="text-3xl font-bold text-gray-900">Artist Management</h1>
          </div>
        </header>
        <main className="flex-1 overflow-x-hidden overflow-y-auto bg-gray-50">
          <div className="max-w-7xl mx-auto py-6 sm:px-6 lg:px-8">
            {error && (
              <div className="mb-4 bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded relative" role="alert">
                <strong className="font-bold">Error!</strong>
                <span className="block sm:inline"> {error}</span>
              </div>
            )}
            
            <div className="px-4 py-6 sm:px-0">
              <div className="flex justify-end mb-4">
                <button
                  onClick={() => openModal()}
                  className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                >
                  <PlusIcon className="-ml-1 mr-2 h-5 w-5" aria-hidden="true" />
                  Add Artist
                </button>
              </div>
              
              <div className="bg-white shadow overflow-hidden sm:rounded-md">
                <ul className="divide-y divide-gray-200">
                  {isLoading ? (
                    <li className="px-6 py-4 flex items-center justify-center">
                      <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-500"></div>
                    </li>
                  ) : artists.length === 0 ? (
                    <li className="px-6 py-4 text-center text-gray-500">No artists found</li>
                  ) : (
                    artists.map((artist) => (
                      <li key={artist.id}>
                        <Link href={`/artiste/${artist.id}`} className="text-blue-600 hover:underline">

                        <div className="px-6 py-4 flex items-center">
                          <div className="flex-shrink-0 h-12 w-12">
                            {artist.profile_picture ? (
                              <img className="h-12 w-12 rounded-full" src={artist.profile_picture} alt="" />
                            ) : (
                              <UserCircleIcon className="h-12 w-12 text-gray-300" aria-hidden="true" />
                            )}
                          </div>
                          <div className="ml-4 flex-1">
                            <div className="flex items-center justify-between">
                              <div>
                                <h3 className="text-lg font-medium text-gray-900">{artist.first_name} {artist.last_name}</h3>
                                <p className="text-sm text-gray-500">{artist.email}</p>
                              </div>
                              <div className="flex space-x-2">
                                <button
                                  onClick={() => openModal(artist)}
                                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                                >
                                  <PencilIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                                <button
                                  onClick={() => handleDeleteArtist(artist.id)}
                                  className="inline-flex items-center p-2 border border-transparent rounded-full shadow-sm text-white bg-red-600 hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                                >
                                  <TrashIcon className="h-4 w-4" aria-hidden="true" />
                                </button>
                              </div>
                            </div>
                            <div className="mt-2 text-sm text-gray-500">
                              <p>{artist.phone_number}</p>
                              <p>{artist.address}</p>
                            </div>
                          </div>
                        </div>
                        </Link>
                      </li>
                    ))
                  )}
                </ul>
              </div>
            </div>
          </div>
        </main>
      </div>

      <Transition appear show={isModalOpen} as={React.Fragment}>
        <Dialog as="div" className="relative z-10" onClose={closeModal}>
          <Transition.Child
            as={React.Fragment}
            enter="ease-out duration-300"
            enterFrom="opacity-0"
            enterTo="opacity-100"
            leave="ease-in duration-200"
            leaveFrom="opacity-100"
            leaveTo="opacity-0"
          >
            <div className="fixed inset-0 bg-black bg-opacity-25" />
          </Transition.Child>

          <div className="fixed inset-0 overflow-y-auto">
            <div className="flex min-h-full items-center justify-center p-4 text-center">
              <Transition.Child
                as={React.Fragment}
                enter="ease-out duration-300"
                enterFrom="opacity-0 scale-95"
                enterTo="opacity-100 scale-100"
                leave="ease-in duration-200"
                leaveFrom="opacity-100 scale-100"
                leaveTo="opacity-0 scale-95"
              >
                <Dialog.Panel className="w-full max-w-md transform overflow-hidden rounded-2xl bg-white p-6 text-left align-middle shadow-xl transition-all">
                  <Dialog.Title
                    as="h3"
                    className="text-lg font-medium leading-6 text-gray-900"
                  >
                    {selectedArtist ? 'Edit Artist' : 'Add New Artist'}
                  </Dialog.Title>
                  <form onSubmit={handleSubmit} className="mt-4">
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label htmlFor="first_name" className="block text-sm font-medium text-gray-700">First Name</label>
                        <input
                          type="text"
                          name="first_name"
                          id="first_name"
                          value={formData.first_name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                      <div>
                        <label htmlFor="last_name" className="block text-sm font-medium text-gray-700">Last Name</label>
                        <input
                          type="text"
                          name="last_name"
                          id="last_name"
                          value={formData.last_name}
                          onChange={handleInputChange}
                          required
                          className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                        />
                      </div>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="email" className="block text-sm font-medium text-gray-700">Email</label>
                      <input
                        type="email"
                        name="email"
                        id="email"
                        value={formData.email}
                        onChange={handleInputChange}
                        required
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="phone_number" className="block text-sm font-medium text-gray-700">Phone Number</label>
                      <input
                        type="tel"
                        name="phone_number"
                        id="phone_number"
                        value={formData.phone_number}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="address" className="block text-sm font-medium text-gray-700">Address</label>
                      <input
                        type="text"
                        name="address"
                        id="address"
                        value={formData.address}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="social" className="block text-sm font-medium text-gray-700">Social Media</label>
                      <input
                        type="text"
                        name="social"
                        id="social"
                        value={formData.social}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-4"><label htmlFor="website" className="block text-sm font-medium text-gray-700">Website</label>
                      <input
                        name="website"
                        id="website"
                        value={formData.website}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      />
                    </div>
                    <div className="mt-4">
                      <label htmlFor="bio" className="block text-sm font-medium text-gray-700">Bio</label>
                      <textarea
                        name="bio"
                        id="bio"
                        rows={3}
                        value={formData.bio}
                        onChange={handleInputChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-indigo-500 focus:ring-indigo-500 sm:text-sm"
                      ></textarea>
                    </div>
                    <div className="mt-4">
                      <label htmlFor="profile_picture" className="block text-sm font-medium text-gray-700">Profile Picture</label>
                      <input
                        type="file"
                        name="profile_picture"
                        id="profile_picture"
                        onChange={handleFileChange}
                        className="mt-1 block w-full text-sm text-gray-500
                          file:mr-4 file:py-2 file:px-4
                          file:rounded-full file:border-0
                          file:text-sm file:font-semibold
                          file:bg-indigo-50 file:text-indigo-700
                          hover:file:bg-indigo-100"
                      />
                    </div>
                    <div className="mt-6 flex justify-end space-x-3">
                      <button
                        type="button"
                        onClick={closeModal}
                        className="inline-flex justify-center rounded-md border border-gray-300 bg-white px-4 py-2 text-sm font-medium text-gray-700 shadow-sm hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        disabled={isLoading}
                        className="inline-flex justify-center rounded-md border border-transparent bg-indigo-600 px-4 py-2 text-sm font-medium text-white shadow-sm hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:ring-offset-2"
                      >
                        {isLoading ? 'Saving...' : 'Save'}
                      </button>
                    </div>
                  </form>
                </Dialog.Panel>
              </Transition.Child>
            </div>
          </div>
        </Dialog>
      </Transition>
    </div>
  );
}