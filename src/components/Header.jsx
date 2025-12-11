import React from 'react';
import { Navbar, Container, Form, Button, Nav, InputGroup } from 'react-bootstrap';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';

export function Header() {
  return (
    <>
      {/* 1. Barra Superior Roja (TopBar) */}
      <div className="bg-danger text-white py-1" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
        <Container className="d-flex justify-content-end gap-4">
          <span className="cursor-pointer">EMPRESA</span>
          <span className="cursor-pointer">Boton</span>
          <span className="cursor-pointer">Boton</span>
          <span className="cursor-pointer">Boton</span>
        </Container>
      </div>

      {/* 2. Barra Principal (Logo y Buscador) */}
      <Navbar bg="white" expand="lg" className="py-4 shadow-sm">
        <Container>
          {/* LOGO */}
          <Navbar.Brand href="#home" className="d-flex align-items-center gap-2">
            <img 
              src="assets/PromoConstruye_Logo.png"
              alt="PromoConstruye Logo" 
              height="60"  // Ajusta este número según el tamaño que quieras
              className="d-inline-block align-top"
            />
          </Navbar.Brand>

          <Navbar.Toggle aria-controls="basic-navbar-nav" />

          <Navbar.Collapse id="basic-navbar-nav">
            {/* BUSCADOR CENTRAL */}
            <Form className="d-flex flex-grow-1 mx-lg-5 my-3 my-lg-0">
               <InputGroup>
                  <Form.Control
                    type="search"
                    placeholder="Search for products"
                    className="border-end-0"
                  />
                  <Form.Select style={{ maxWidth: '160px', borderLeft: '0' }} className="bg-light text-secondary border-start-0">
                      <option>SELECT CATEGORY</option>
                      <option>Porcelanatos</option>
                      <option>Baños</option>
                  </Form.Select>
                  <Button variant="warning" className="text-white">
                      <FaSearch />
                  </Button>
               </InputGroup>
            </Form>

            {/* BOTONES DERECHA */}
            <div className="d-flex gap-2">
              <Button variant="light" className="bg-light border fw-bold d-flex align-items-center gap-2">
                  <FaShoppingCart /> Carrito
              </Button>
            </div>
          </Navbar.Collapse>
        </Container>
      </Navbar>

      {/* 3. Menú de Categorías (Inferior) */}
      <div className="border-top border-bottom py-2 bg-white sticky-top">
        <Container>
            <Nav className="justify-content-center fw-bold small flex-wrap" style={{fontSize: '0.85rem'}}>
                {['PORCELANATOS', 'CERÁMICAS', 'PIEDRAS NATURALES', 'MOSAICOS', 'PISCINAS', 'ACCESORIOS', 'BAÑO', 'COCINA', 'CATALOGOS', 'PROMOCIONES'].map((item) => (
                    <Nav.Link key={item} href={`#${item.toLowerCase()}`} className="text-secondary hover-danger mx-2">
                        {item}
                    </Nav.Link>
                ))}
            </Nav>
        </Container>
      </div>
    </>
  );
}