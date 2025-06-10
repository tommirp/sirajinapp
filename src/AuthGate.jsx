import { useEffect, useState } from 'react';
import { supabase } from './supabaseClient';
import { useNavigate } from 'react-router-dom';

const allowedDomain = import.meta.env.VITE_ALLOWED_EMAIL_DOMAIN;
const extraEmail = import.meta.env.VITE_ALLOWED_EMAIL_EXTRA;

const isEmailAllowed = (email) => {
  return (
    email.endsWith(allowedDomain) ||
    email === extraEmail
  );
};

export default function AuthGate({ children }) {
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    const checkUser = async () => {
      const { data: { session } } = await supabase.auth.getSession();

      if (!session || !isEmailAllowed(session.user.email)) {
        // alert("Akses ditolak.");
        await supabase.auth.signOut();
        navigate('/login');
        return;
      }

      setLoading(false);
    };

    checkUser();
  }, [navigate]);

  if (loading) return <p>Loading...</p>;

  return children;
}
