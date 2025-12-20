import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';
import { Helmet } from 'react-helmet-async';
import { supabase } from './supabaseClient';

// --- IMPORTACIONES PÚBLICAS ---
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { NotFound } from './components/NotFound';
import { SearchResults } from './components/SearchResults';
import { Login } from './pages/Login';
import { CategoryPage } from './pages/CategoryPage';

// --- IMPORTACIONES DE ADMIN ---
import { AuthRoute } from './components/AuthRoute';
import { AdminLayout } from './components/AdminLayout';
import { AdminHome } from './pages/admin/AdminHome';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminPagesEditor } from './pages/admin/AdminPagesEditor';
import { AdminHero } from './pages/admin/AdminHero';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

const ShopLayout = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Header />
      <div className="flex-grow-1"><Outlet /></div>
      <footer className="bg-dark text-white py-4 mt-auto text-center"><p>© 2025 CONSTRUCTORA PROYECTO INMOBILIARIO PROMOCONSTRUYE S.A.</p></footer>
    </div>
  );
};

function Home() {
  useEffect(() => {
      const logVisit = async () => {
          await supabase.from('visits').insert([{ page: 'home' }]);
      };
      logVisit();
  }, []);

  return (
    <>
      <Helmet>
        <title>PromoConstruye | Materiales de Construcción y Acabados</title>
        <meta name="description" content="La mejor tienda de porcelanatos, grifería y acabados para tu hogar en Ecuador." />
      </Helmet>

      <Hero />
      <ProductGrid />
    </>
  ); 
}

function App() {
  return (
    <BrowserRouter>
        <Routes>
            <Route element={<ShopLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/product/:id" element={<ProductDetail />} />
                <Route path="*" element={<NotFound />} /> 
                <Route path="/category/:slug" element={<CategoryPage />} />
            </Route>

            <Route path="/login" element={<Login />} />

            <Route element={<AuthRoute />}> 
                <Route path="/admin" element={<AdminLayout />}> 
                    <Route index element={<AdminHome />} />
                    <Route path="products" element={<AdminProducts />} />
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="pages" element={<AdminPagesEditor />} />
                    <Route path="carrusel" element={<AdminHero />} />
                </Route>
            </Route>

        </Routes>
    </BrowserRouter>
  );
}

export default App;