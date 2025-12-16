import React, { useState } from 'react';
import { Navbar, Container, Form, Button, Nav, InputGroup } from 'react-bootstrap';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate } from 'react-router-dom';

// Asegúrate de que esta ruta sea correcta según tu estructura de carpetas
import logoImg from '../assets/PromoLogo.png'; 

export function Header() {
  // 1. ESTADO: Usamos "searchText" para guardar lo que el usuario escribe
  const [searchText, setSearchText] = useState("");
  const navigate = useNavigate();

  // 2. FUNCIÓN DE BÚSQUEDA: Se activa al dar Enter o click en la lupa
  const handleSearch = (e) => {
    e.preventDefault(); // Evita recargar la página
    if (searchText.trim()) {
      // Navegamos a la ruta de resultados con el texto en la URL
      navigate(`/search?q=${searchText}`);
      setSearchText(""); // Limpiamos la caja de texto
    }
  };

  return (
    <>
      {/* 1. Barra Superior Roja */}
      <div className="bg-danger text-white py-1" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
        <Container className="d-flex justify-content-end gap-4">
          <span className="cursor-pointer">EMPRESA</span>
          <span className="cursor-pointer">CONTACTO</span>
          <span className="cursor-pointer">AYUDA</span>
        </Container>
      </div>

      {/* 2. Barra Principal */}
      <Navbar bg="white" expand="lg" className="py-4 shadow-sm">
        <Container>
          {/* Logo con Link al inicio */}
          <Navbar.Brand as={Link} to="/" className="d-flex align-items-center gap-2">
            <img src={logoImg} alt="Logo" height="60" className="d-inline-block align-top" />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            
            {/* FORMULARIO DE BÚSQUEDA */}
            <Form className="d-flex flex-grow-1 mx-lg-5 my-3 my-lg-0" onSubmit={handleSearch}>
               <InputGroup>
                  <Form.Control
                    type="search"
                    placeholder="Buscar productos..."
                    className="border-end-0"
                    
                    // CORRECCIÓN AQUÍ: Usamos la variable de estado correcta (searchText)
                    value={searchText}
                    onChange={(e) => setSearchText(e.target.value)} 
                  />
                  
                  <Form.Select style={{ maxWidth: '160px', borderLeft: '0' }} className="bg-light text-secondary border-start-0">
                      <option>CATEGORÍAS</option>
                  </Form.Select>
                  
                  {/* Botón Submit */}
                  <Button variant="warning" type="submit" className="text-white">
                      <FaSearch />
                  </Button>
               </InputGroup>
            </Form>

            {/* Botones Derecha */}
            <div className="d-flex gap-2">
              <Button variant="light" className="bg-light border fw-bold d-flex align-items-center gap-2">
                  <FaShoppingCart /> Carrito
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 3. Menú Inferior */}
      <div className="border-top border-bottom py-2 bg-white sticky-top">
        <Container>
            <Nav className="justify-content-center fw-bold small flex-wrap" style={{fontSize: '0.85rem'}}>
                {['PORCELANATOS', 'CERÁMICAS', 'BAÑO', 'COCINA', 'PROMOCIONES'].map((item) => (
                    <Nav.Link key={item} href={`#${item.toLowerCase()}`} className="text-secondary mx-2">{item}</Nav.Link>
                ))}
            </Nav>
        </Container>
      </div>
    </>
  );
}