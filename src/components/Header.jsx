import React, { useState, useEffect } from 'react';
import { Navbar, Container, Form, Button, Nav, InputGroup, NavDropdown } from 'react-bootstrap';
import { FaSearch, FaShoppingCart } from 'react-icons/fa';
import { Link, useNavigate, useLocation } from 'react-router-dom'; 
import { supabase } from '../supabaseClient';
import logoImg from '../assets/PromoLogo.png'; 

export function Header() {
  const [searchText, setSearchText] = useState("");
  const [categoriesTree, setCategoriesTree] = useState([]); 
  const navigate = useNavigate();
  const location = useLocation(); 
  useEffect(() => {
    const fetchMenu = async () => {
      try {
        const { data, error } = await supabase
          .from('categories')
          .select(`
            id, 
            name, 
            is_visible_in_menu,
            subcategories (
              id, 
              name,
              is_visible_in_menu
            )
          `)
          .eq('is_visible_in_menu', true)
          .order('name');

        if (error) throw error;
        const cleanData = (data || []).map(cat => ({
            ...cat,
            subcategories: (cat.subcategories || [])
                .filter(sub => sub.is_visible_in_menu === true) 
                .sort((a, b) => a.name.localeCompare(b.name))
        }));

        setCategoriesTree(cleanData);
      } catch (error) {
        console.error("Error cargando menú:", error);
      }
    };
    fetchMenu();
  }, []); 

  const handleSearch = (e) => {
    e.preventDefault(); 
    if (searchText.trim()) {
      navigate(`/search?q=${encodeURIComponent(searchText)}`);
      setSearchText(""); 
    }
  };

  const navLinkStyle = { 
      fontSize: '0.85rem', 
      letterSpacing: '0.5px',
      fontWeight: 'bold',
      color: '#6c757d'
  };

  return (
    <>
      <div className="bg-danger text-white py-1" style={{ fontSize: '0.75rem', fontWeight: 'bold' }}>
        <Container className="d-flex justify-content-end gap-4">
          <span className="cursor-pointer">EMPRESA</span>
          <span className="cursor-pointer">CONTACTO</span>
          <span className="cursor-pointer">AYUDA</span>
        </Container>
      </div>
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
      <div className="border-top border-bottom py-2 bg-white sticky-top custom-hover-nav">
        <Container>
            <Nav className="justify-content-center mx-auto align-items-center">
              
              {categoriesTree.map((cat) => {
                  if (cat.subcategories && cat.subcategories.length > 0) {
                      return (
                        <NavDropdown 
                            key={cat.id}
                            title={cat.name.toUpperCase()} 
                            id={`nav-dropdown-${cat.id}`}
                            className="px-2"
                            style={navLinkStyle}
                        >
                            <NavDropdown.Item as={Link} to={`/category/${cat.name}`} className="fw-bold bg-light">
                                VER TODO {cat.name.toUpperCase()}
                            </NavDropdown.Item>
                            <NavDropdown.Divider />
                            
                            {cat.subcategories.map(sub => (
                                <NavDropdown.Item 
                                    key={sub.id} 
                                    as={Link} 
                                    to={`/category/${cat.name}?sub=${sub.name}`}
                                >
                                    {sub.name}
                                </NavDropdown.Item>
                            ))}
                        </NavDropdown>
                      );
                  } 
                  else {
                      return (
                        <Nav.Link 
                          key={cat.id}
                          as={Link} 
                          to={`/category/${cat.name}`} 
                          className="px-3"
                          style={navLinkStyle}
                        >
                          {cat.name.toUpperCase()}
                        </Nav.Link>
                      );
                  }
              })}

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

      <style>
        {`
            .custom-hover-nav .nav-link { color: #6c757d !important; transition: color 0.2s; }
            .custom-hover-nav .nav-link:hover { color: #dc3545 !important; }
            @media (min-width: 992px) {
                .custom-hover-nav .dropdown:hover .dropdown-menu {
                    display: block; margin-top: 0; border-radius: 0;
                    border-top: 3px solid #dc3545; box-shadow: 0 4px 6px rgba(0,0,0,0.1);
                }
            }
            .custom-hover-nav .dropdown-toggle::after { vertical-align: middle; }
        `}
      </style>
    </>
  );
}