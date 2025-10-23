"use client";
import { useEffect, useState } from "react";
import { db } from "@/firebase/config";
import { collection, getDocs } from "firebase/firestore";

export default function Home() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    const fetchUsers = async () => {
      const querySnapshot = await getDocs(collection(db, "users"));
      setUsers(querySnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() })));
    };

    fetchUsers();
  }, []);

  return (
    <main className="p-6">
      <h1 className="text-xl font-bold mb-4">Daftar User</h1>
      <ul>
        {users.map(user => (
          <li key={user.id}>{user.name} - umur {user.age} - {user.password}</li>
        ))}
      </ul>
    </main>
  );
}
