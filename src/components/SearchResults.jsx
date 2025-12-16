import React from 'react';
import { useSearchParams, Link } from 'react-router-dom'; // Para leer la URL
import { Container, Row, Col, Card, Button } from 'react-bootstrap';
import { products } from '../data/products';

export function SearchResults() {
  // 1. Leemos el parámetro "?q=" de la URL
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || ""; // Si no hay nada, string vacío

  // 2. Filtramos los productos aquí mismo
  const filteredProducts = products.filter((product) => 
     product.title.toLowerCase().includes(query.toLowerCase())
  );

  const getImgPath = (img) => {
    if (!img) return "";
    return img.startsWith('http') ? img : import.meta.env.BASE_URL + img;
  };

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 className="fw-bold">Resultados de búsqueda: "{query}"</h2>
        <p className="text-muted">{filteredProducts.length} productos encontrados</p>
        <Link to="/" className="btn btn-outline-secondary btn-sm">← Volver al Catálogo</Link>
      </div>

      <Row>
        {filteredProducts.length > 0 ? (
          filteredProducts.map((product) => (
            <Col key={product.id} md={6} lg={3} className="mb-4">
               {/* Usamos el MISMO diseño de tarjeta que en el Grid */}
               <Card className="h-100 border-0 shadow-sm hover-effect">
                  <Link to={`/product/${product.id}`} className="position-relative overflow-hidden d-block" style={{ height: '250px' }}>
                      <Card.Img variant="top" src={getImgPath(product.image)} className="h-100 w-100" style={{ objectFit: 'cover' }} />
                  </Link>
                  <Card.Body className="text-center">
                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                        <Card.Title className="fs-6 fw-bold text-secondary mb-3">{product.title}</Card.Title>
                    </Link>
                    <Card.Text className="fw-bold text-danger fs-5">${product.price.toFixed(2)}</Card.Text>
                    <Link to={`/product/${product.id}`} className="d-block text-decoration-none">
                        <Button variant="dark" className="w-100 rounded-0 text-uppercase">Ver Detalles</Button>
                    </Link>
                  </Card.Body>
               </Card>
            </Col>
          ))
        ) : (
          <div className="text-center py-5">
             <h1> 😢</h1>
             <h3> No encontramos nada similar.</h3>
             <p>Intenta buscar "Porcelanato" o "Baño".</p>
          </div>
        )}
      </Row>
    </Container>
  );
}