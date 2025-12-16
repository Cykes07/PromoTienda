import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { NotFound } from './components/NotFound';
import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

function Home() {
  return (<><Hero /><ProductGrid /></>);
}

function App() {
  return (
    <BrowserRouter basename="/PromoTienda">
      <div className="bg-light min-vh-100 d-flex flex-column">
        <Header />
        <div className="flex-grow-1">
            <Routes>
                <Route path="/" element={<Home />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="*" element={<NotFound />} />
            </Routes>
        </div>
        <footer className="bg-dark text-white py-4 mt-auto text-center"><p>© 2025 PromoTienda</p></footer>
      </div>
    </BrowserRouter>
  );
}

export default App;