import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

export function useAuthCheck() {
  const navigate = useNavigate();

  useEffect(() => {
    if (!localStorage.getItem('userEmail')) {
      navigate('/login');
    }
  }, [navigate]);
}