import React, { useEffect, useState } from 'react';
import { Navigate, Outlet } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Spinner } from 'react-bootstrap';

export const AuthRoute = () => {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    // 1. Revisar si ya hay sesión activa
    supabase.auth.getSession().then(({ data: { session } }) => {
      setSession(session);
      setLoading(false);
    });

    // 2. Escuchar cambios (login/logout)
    const { data: { subscription } } = supabase.auth.onAuthStateChange((_event, session) => {
      setSession(session);
      setLoading(false);
    });

    return () => subscription.unsubscribe();
  }, []);

  if (loading) return (
      <Container className="d-flex justify-content-center mt-5">
          <Spinner animation="border" />
      </Container>
  );

  // Si hay sesión, muestra el panel (Outlet). Si no, manda al Login.
  return session ? <Outlet /> : <Navigate to="/login" />;
};