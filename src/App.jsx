// src/App.jsx

import React, { useEffect } from 'react';
import { BrowserRouter, Routes, Route, Outlet } from 'react-router-dom';


// --- IMPORTACIONES PÚBLICAS ---
import { Header } from './components/Header';
import { Hero } from './components/Hero';
import { ProductGrid } from './components/ProductGrid';
import { ProductDetail } from './components/ProductDetail';
import { NotFound } from './components/NotFound';
import { SearchResults } from './components/SearchResults';
import { Login } from './pages/Login';

// --- IMPORTACIONES DE ADMIN ---
import { AuthRoute } from './components/AuthRoute';
import { AdminLayout } from './components/AdminLayout'; // <--- NUEVO LAYOUT AZUL
import { AdminHome } from './pages/admin/AdminHome';    // <--- NUEVO DASHBOARD
import { AdminProducts } from './pages/admin/AdminProducts'; // <--- TU ANTIGUA TABLA RENOMBRADA
import { AdminUsers } from './pages/admin/AdminUsers';
import { AdminPagesEditor } from './pages/admin/AdminPagesEditor';

import 'bootstrap/dist/css/bootstrap.min.css';
import './App.css';

// Layout Público (Tienda)
const ShopLayout = () => {
  return (
    <div className="bg-light min-vh-100 d-flex flex-column">
      <Header />
      <div className="flex-grow-1"><Outlet /></div>
      <footer className="bg-dark text-white py-4 mt-auto text-center"><p>© 2025 PromoTienda</p></footer>
    </div>
  );
};

function Home() {useEffect(() => {
      const logVisit = async () => {
          await supabase.from('visits').insert([{ page: 'home' }]);
      };
      logVisit();
  }, []);
   return (<><Hero /><ProductGrid /></>); }

function App() {
  return (
    <BrowserRouter>
        <Routes>
            {/* RUTA 1: LA TIENDA PÚBLICA */}
            <Route element={<ShopLayout />}>
                <Route path="/" element={<Home />} />
                <Route path="/search" element={<SearchResults />} />
                <Route path="/product/:id" element={<ProductDetail />} />
            </Route>

            {/* RUTA 2: LOGIN (Suelto) */}
            <Route path="/login" element={<Login />} />

            {/* RUTA 3: EL ÁREA DE ADMIN (Protegida y con nuevo diseño) */}
            <Route element={<AuthRoute />}> {/* 1. Primero protege */}
                <Route path="/admin" element={<AdminLayout />}> {/* 2. Luego aplica el diseño azul */}
                    
                    {/* Si entran a "/admin", muestra el Dashboard de estadísticas */}
                    <Route index element={<AdminHome />} />
                    
                    {/* Si entran a "/admin/products", muestra tu tabla antigua */}
                    <Route path="products" element={<AdminProducts />} />
                    
                    <Route path="users" element={<AdminUsers />} />
                    <Route path="pages" element={<AdminPagesEditor />} />
                </Route>
            </Route>

            <Route path="*" element={<NotFound />} />
        </Routes>
    </BrowserRouter>
  );
}

export default App;