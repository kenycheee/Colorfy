'use client';

import { useEffect, useState } from 'react';
import { auth, db } from '@/lib/firebase';
import { doc, getDoc, updateDoc } from 'firebase/firestore';
import { useRouter } from 'next/navigation';


export default function EditProfilePage() {
  const [userData, setUserData] = useState<any>(null);
  const [username, setUsername] = useState('');
  const [bio, setBio] = useState('');
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const user = auth.currentUser;
    if (!user) {
      router.push('/login');
      return;
    }

    const fetchData = async () => {
      const snap = await getDoc(doc(db, 'users', user.uid));
      if (snap.exists()) {
        const data = snap.data();
        setUserData(data);
        setUsername(data.username || '');
        setBio(data.bio || '');
      }
      setLoading(false);
    };

    fetchData();
  }, [router]);

  const handleSave = async () => {
    const user = auth.currentUser;
    if (!user) return;

    try {
      await updateDoc(doc(db, 'users', user.uid), {
        username,
        bio,
      });
      alert('Profil berhasil diperbarui!');
      router.push('/profile');
    } catch (error) {
      console.error('Gagal update profil:', error);
      alert('Terjadi kesalahan saat memperbarui profil.');
    }
  };

  if (loading) return <p style={{ color: 'white', textAlign: 'center' }}>Loading...</p>;

  return (
    <main className="edit-section">
      <div className="edit-card">
        <h1 className="edit-title">Edit Profile</h1>

        <div className="form-group">
          <label>Username</label>
          <input
            type="text"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            placeholder="Insert new Username"
          />
        </div>

        <div className="form-group">
          <label>Bio</label>
          <textarea
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            placeholder="Write your new Bio"
          />
        </div>

        <div className="button-group">
          <button className="btn-save" onClick={handleSave}>
            Save Changes
          </button>
          <button className="btn-cancel" onClick={() => router.push('/profile')}>
            Cancel
          </button>
        </div>
      </div>
    </main>
  );
}
