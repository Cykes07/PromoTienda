import React from 'react';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css'; // Importante para algunos ajustes finos

function App() {
  return (
    <div className="bg-light min-vh-100">
      <Header />
      <Hero />
      <ProductGrid />
      
      {/* Footer sencillo */}
      <footer className="bg-dark text-white py-4 mt-5 text-center">
        <p className="mb-0">© 2025 CONSTRUCTORA PROYECTO INMOBILIARIO PROMOCONSTRUYE S.A. Todos los derechos reservados.</p>
      </footer>
    </div>
  );
}

export default App;