import React from 'react';
import { Container, Button } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function NotFound() {
  return (
    <Container className="text-center py-5">
      <h1 className="display-1 fw-bold text-danger">404</h1>
      <h2>Página no encontrada</h2>
      <Link to="/"><Button variant="dark" className="mt-3">Volver al Inicio</Button></Link>
    </Container>
  );
}