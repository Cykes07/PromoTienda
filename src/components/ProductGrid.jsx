import React from 'react';
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { products } from '../data/products';

export function ProductGrid() {
  return (
    <Container className="my-5">
      {/* Título de Sección con la línea naranja */}
      <div className="text-center mb-5">
        <h3 className="fw-bold text-uppercase text-dark">Nuevos</h3>
        <div className="mx-auto mt-2" style={{ width: '80px', height: '3px', backgroundColor: '#fd7e14' }}></div>
      </div>

      <Row>
        {products.map((product) => (
          <Col key={product.id} md={6} lg={3} className="mb-4">
            <Card className="h-100 border-0 shadow-sm hover-effect">
              {/* Imagen */}
              <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                 <Card.Img 
                    variant="top" 
                    src={product.image} 
                    className="h-100 w-100" 
                    style={{ objectFit: 'cover' }} 
                 />
              </div>
              
              <Card.Body className="text-center">
                <Card.Title className="fs-6 fw-bold text-secondary mb-3">{product.title}</Card.Title>
                <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                    <span className="text-warning fs-5">★ ★ ★ ★ ☆</span>
                </div>
                <Card.Text className="fw-bold text-danger fs-5">
                  ${product.price.toFixed(2)}
                </Card.Text>
                <Button variant="dark" className="w-100 rounded-0 text-uppercase">Añadir al Carrito</Button>
              </Card.Body>
            </Card>
          </Col>
        ))}
      </Row>
        <div className="text-center mb-5">
            <h3 className="fw-bold text-uppercase text-dark">Prodcutos</h3>
            <div className="mx-auto mt-2" style={{ width: '80px', height: '3px', backgroundColor: '#fd7e14' }}></div>
      </div>
        <Row>
            {products.map((product) => (
            <Col key={product.id} md={6} lg={3} className="mb-4">
                <Card className="h-100 border-0 shadow-sm hover-effect">
                {/* Imagen */}
                <div className="position-relative overflow-hidden" style={{ height: '250px' }}>
                    <Card.Img 
                        variant="top" 
                        src={product.image} 
                        className="h-100 w-100" 
                        style={{ objectFit: 'cover' }} 
                    />
                </div>
                
                <Card.Body className="text-center">
                    <Card.Title className="fs-6 fw-bold text-secondary mb-3">{product.title}</Card.Title>
                    <div className="d-flex justify-content-center align-items-center gap-2 mb-3">
                        <span className="text-warning fs-5">★ ★ ★ ★ ☆</span>
                    </div>
                    <Card.Text className="fw-bold text-danger fs-5">
                    ${product.price.toFixed(2)}
                    </Card.Text>
                    <Button variant="dark" className="w-100 rounded-0 text-uppercase">Añadir al Carrito</Button>
                </Card.Body>
                </Card>
            </Col>
            ))}
        </Row>
    </Container>
  );
}