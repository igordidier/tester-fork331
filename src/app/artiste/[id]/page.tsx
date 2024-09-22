"use client"

import { useState, useEffect } from 'react';
import { useParams } from 'next/navigation';
import Image from 'next/image';

interface Artist {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone_number: string;
  social: string;
  website: string;
  bio: string;
  address: string;
  profile_picture: string;
  manager_id: string;
}

export default function ArtistePage() {
  const { id } = useParams();
  const [artist, setArtist] = useState<Artist | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchArtist = async () => {
      try {
        const response = await fetch(`/api/artiste/${id}`);
        if (!response.ok) {
          throw new Error('Failed to fetch artist');
        }
        const data = await response.json();
        setArtist(data);
      } catch (error) {
        console.error('Error fetching artist:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchArtist();
  }, [id]);

  if (loading) {
    return <div>Loading...</div>;
  }

  if (!artist) {
    return <div>Artist not found</div>;
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <div>
          <Image
            src={artist.profile_picture || '/default-profile.jpg'}
            alt={`${artist.first_name} ${artist.last_name}`}
            width={300}
            height={300}
            className="rounded-lg"
          />
        </div>
        <div>
          <h1 className="text-3xl font-bold mb-4">{artist.first_name} {artist.last_name}</h1>
          <p className="mb-2"><strong>Email:</strong> {artist.email}</p>
          <p className="mb-2"><strong>Phone:</strong> {artist.phone_number}</p>
          <p className="mb-2"><strong>Website:</strong> <a href={artist.website} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:underline">{artist.website}</a></p>
          <p className="mb-2"><strong>Social:</strong> {artist.social}</p>
          <p className="mb-4"><strong>Address:</strong> {artist.address}</p>
          <h2 className="text-2xl font-semibold mb-2">Biography</h2>
          <p>{artist.bio}</p>
        </div>
      </div>
    </div>
  );
}