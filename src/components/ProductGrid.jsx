import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { products } from '../data/products';
import { Link } from 'react-router-dom'; // <--- 1. IMPORTAR LINK

export function ProductGrid() {
  
  // Función auxiliar para arreglar la ruta de la imagen (Internet vs Local)
  // Esto evita que escribas el código largo dos veces
  const getImgPath = (img) => {
    if (!img) return "";
    return img.startsWith('http') ? img : import.meta.env.BASE_URL + img;
  };

  return (
    <Container className="my-5">
      
      {/* --- SECCIÓN 1: NUEVOS --- */}
      <div className="text-center mb-5">
        <h3 className="fw-bold text-uppercase text-dark">Nuevos</h3>
        <div className="mx-auto mt-2" style={{ width: '80px', height: '3px', backgroundColor: '#fd7e14' }}></div>
      </div>

      <Row>
        {products.map((product) => (
          <Col key={product.id} md={6} lg={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm hover-effect">
              
              {/* 2. ENLACE EN LA IMAGEN */}
              <Link to={`/product/${product.id}`} className="position-relative overflow-hidden d-block" style={{ height: '250px' }}>
                 <Card.Img 
                    variant="top" 
                    src={getImgPath(product.image)} // Usamos la función auxiliar
                    className="h-100 w-100" 
                    style={{ objectFit: 'cover' }}
                    onError={(e) => console.log("Falló imagen:", e.target.src)} 
                 />
              </Link>
              
              <Card.Body className="text-center">
                {/* 3. ENLACE EN EL TÍTULO */}
                <Link to={`/product/${product.id}`} className="text-decoration-none">
                    <Card.Title className="fs-6 fw-bold text-secondary mb-3">{product.title}</Card.Title>
                </Link>

                <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                    <span className="text-warning fs-5">★ ★ ★ ★ ☆</span>
                </div>
                <Card.Text className="fw-bold text-danger fs-5">
                  ${product.price.toFixed(2)}
                </Card.Text>
                
                {/* 4. ENLACE EN EL BOTÓN */}
                <Link to={`/product/${product.id}`} className="d-block text-decoration-none">
                    <Button variant="dark" className="w-100 rounded-0 text-uppercase">Ver Detalles</Button>
                </Link>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>

      {/* --- SECCIÓN 2: PRODUCTOS --- */}
      <div className="text-center mb-5">
          <h3 className="fw-bold text-uppercase text-dark">Productos</h3>
          <div className="mx-auto mt-2" style={{ width: '80px', height: '3px', backgroundColor: '#fd7e14' }}></div>
      </div>
      
      <Row>
          {products.map((product) => (
          <Col key={product.id} md={6} lg={3} className="mb-4">
              <Card className="h-100 border-0 shadow-sm hover-effect">
              
              {/* Repetimos la lógica corregida aquí también */}
              <Link to={`/product/${product.id}`} className="position-relative overflow-hidden d-block" style={{ height: '250px' }}>
                  <Card.Img 
                      variant="top" 
                      src={getImgPath(product.image)} 
                      className="h-100 w-100" 
                      style={{ objectFit: 'cover' }} 
                  />
              </Link>
              
              <Card.Body className="text-center">
                  <Link to={`/product/${product.id}`} className="text-decoration-none">
                      <Card.Title className="fs-6 fw-bold text-secondary mb-3">{product.title}</Card.Title>
                  </Link>

                  <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                      <span className="text-warning fs-5">★ ★ ★ ★ ☆</span>
                  </div>
                  <Card.Text className="fw-bold text-danger fs-5">
                  ${product.price.toFixed(2)}
                  </Card.Text>

                  <Link to={`/product/${product.id}`} className="d-block text-decoration-none">
                      <Button variant="dark" className="w-100 rounded-0 text-uppercase">Ver Detalles</Button>
                  </Link>
              </Card.Body>
              </Card>
          </Col>
          ))}
      </Row>
    </Container>
  );
}