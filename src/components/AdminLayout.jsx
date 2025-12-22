import React from 'react';
import { Outlet, NavLink, useNavigate } from 'react-router-dom'; 
import { Container, Row, Col, Nav, Button } from 'react-bootstrap';
import { supabase } from '../supabaseClient';
import logoImg from '../assets/PromoLogo.png'; 

const sidebarStyles = {
    minHeight: '100vh',
    background: '#0d6efd', 
    boxShadow: '2px 0 10px rgba(0,0,0,0.1)'
};

const navLinkStyle = ({ isActive }) => ({
    color: isActive ? '#fff' : 'rgba(255,255,255,0.7)',
    fontWeight: isActive ? '600' : '400',
    backgroundColor: isActive ? 'rgba(255,255,255,0.15)' : 'transparent',
    borderRadius: '4px',
    padding: '10px 15px',
    textDecoration: 'none',
    display: 'block',
    marginBottom: '5px',
    fontSize: '0.95rem'
});

export const AdminLayout = () => {
  const navigate = useNavigate();

  const handleLogout = async () => {
    await supabase.auth.signOut();
    navigate('/login');
  };

  return (
    <Container fluid className="p-0 bg-light"> 
      <Row className="g-0">
        <Col md={2} className="p-3 d-flex flex-column" style={sidebarStyles}>
            
            <div className="mb-4 mt-2 text-center">
                <img 
                    src={logoImg} 
                    alt="Logo PromoConstruye" 
                    className="img-fluid mb-2" 
                    style={{ maxHeight: '60px', objectFit: 'contain' }} 
                />
                <h5 className="text-white fw-bold m-0">PromoConstruye</h5>
                <small className="text-white-50" style={{fontSize: '0.75rem'}}>Panel Administrativo</small>
            </div>
            
            <Nav className="flex-column mb-auto mt-2">
                <NavLink to="/admin" end style={navLinkStyle}>
                    Dashboard
                </NavLink>
                <NavLink to="/admin/products" style={navLinkStyle}>
                    Productos
                </NavLink>
                <NavLink to="/admin/users" style={navLinkStyle}>
                    Clientes
                </NavLink>
                <NavLink to="/admin/pages" style={navLinkStyle}>
                    Editor de Páginas
                </NavLink>
            </Nav>

            <div className="mt-auto border-top border-white-50 pt-3">
                <Button 
                    variant="link" 
                    className="text-white text-decoration-none w-100 text-start p-2" 
                    onClick={handleLogout}
                >
                    Cerrar Sesión
                </Button>
            </div>
        </Col>
        <Col md={10} style={{height: '100vh', overflowY: 'auto'}}>
            <div className="p-5">
                <Outlet />
            </div>
        </Col>

      </Row>
    </Container>
  );
};