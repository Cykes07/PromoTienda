import React, { useState } from 'react';
import { Navbar, Container, Form, Button, Nav, InputGroup } from 'react-bootstrap';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';
import logoImg from '../assets/PromoLogo.png'; 

export function Header() {
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  const handleSearch = (e) => {
    e.preventDefault(); 
    if (searchText.trim()) {
      // Agregué encodeURIComponent por si buscan palabras con tildes o espacios raros
      navigate(`/search?q=${encodeURIComponent(searchText)}`);
      setSearchText(""); 
    }
  };

  // LISTA DE CATEGORÍAS (Para no repetir código abajo)
  const menuItems = [
    { name: "Piedra Sinterizada", path: "/category/Piedra Sinterizada" },
    { name: "Porcelanatos", path: "/category/Porcelanatos" },
    { name: "Cerámicas", path: "/category/Cerámicas" },
    { name: "Baño", path: "/category/Baño" },
    { name: "Cocina", path: "/category/Cocina" },
  ];

  return (
    <>
      {/* 1. Barra Superior Roja (Sin cambios) */}
      <div className="bg-danger text-white py-1" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
        <Container className="d-flex justify-content-end gap-4">
          <span className="cursor-pointer">EMPRESA</span>
          <span className="cursor-pointer">CONTACTO</span>
          <span className="cursor-pointer">AYUDA</span>
        </Container>
      </div>

      {/* 2. Barra Principal (Logo y Buscador - Sin cambios mayores) */}
      <Navbar bg="white" expand="lg" className="py-4 shadow-sm">
        <Container>
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <img src={logoImg} alt="Logo" height="60" className="d-inline-block align-top" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            <Form className="d-flex flex-grow-1 mx-lg-5 my-3 my-lg-0" onSubmit={handleSearch}>
               <InputGroup>
                  <Form.Control
                    type="search"
                    placeholder="Buscar productos..."
                    className="border-end-0"
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)} 
                  />
                  <Form.Select style={{ maxWidth: '160px', borderLeft: '0' }} className="bg-light text-secondary border-start-0">
                      <option>CATEGORÍAS</option>
                  </Form.Select>
                  <Button variant="warning" type="submit" className="text-white">
                      <FaSearch />
                  </Button>
               </InputGroup>
            </Form>

            <div className="d-flex gap-2">
              <Button variant="light" className="bg-light border fw-bold d-flex align-items-center gap-2">
                  <FaShoppingCart /> Carrito
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 3. MENÚ INFERIOR (AQUÍ ESTÁN LOS CAMBIOS DE DISEÑO) */}
      <div className="border-top border-bottom py-2 bg-white sticky-top">
        <Container>
            {/* justify-content-center: Centra los elementos horizontalmente.
               mx-auto: Asegura que el contenedor nav esté centrado.
            */}
            <Nav className="justify-content-center mx-auto">
              
              {/* Mapeamos los items normales */}
              {menuItems.map((item, index) => (
                <Nav.Link 
                  key={index}
                  as={Link} 
                  to={item.path} 
                  className="fw-bold text-secondary px-3" // Color gris (text-secondary) y espacio lateral (px-3)
                  style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }} // Letra más pequeña y elegante
                >
                  {item.name.toUpperCase()}
                </Nav.Link>
              ))}

              {/* Item de Promociones (Diferente color) */}
              <Nav.Link 
                as={Link} 
                to="/category/Promociones" 
                className="fw-bold text-danger px-3" 
                style={{ fontSize: '0.85rem', letterSpacing: '0.5px' }}
              >
                PROMOCIONES
              </Nav.Link>

          </Nav>
        </Container>
      </div>
    </>
  );
}