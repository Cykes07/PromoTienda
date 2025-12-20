import React, { useEffect, useState } from 'react';
import { supabase } from '../supabaseClient';
import { Container, Row, Col, Card, Button, Spinner, Badge } from 'react-bootstrap';
import { Link } from 'react-router-dom';

export function ProductGrid() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchProducts = async () => {
      try {
        const { data, error } = await supabase
          .from('products')
          .select('*')
          .order('id', { ascending: false });

        if (error) throw error;
        setProducts(data || []);
      } catch (error) {
        console.error("Error cargando productos:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchProducts();
  }, []);

  if (loading) {
    return (
      <Container className="text-center py-5">
        <Spinner animation="border" variant="dark" />
      </Container>
    );
  }

  return (
    <Container className="py-5" id="productos">
      <h2 className="text-center mb-5 fw-bold text-secondary">Nuestra Colección</h2>
      
      {products.length === 0 ? (
        <div className="text-center py-5">
          <h4>No hay productos disponibles.</h4>
        </div>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product.id} md={4} lg={3} className="mb-4">
              
              {/* DISEÑO TIPO TARJETA LIMPIA (COMO TU FOTO) */}
              <Card className="h-100 border-0 shadow-sm bg-white">
                
                {/* 1. IMAGEN */}
                <div style={{ position: 'relative', overflow: 'hidden' }}>
                    <Link to={`/product/${product.id}`}>
                        <Card.Img 
                            variant="top" 
                            src={product.image || "https://via.placeholder.com/300?text=Sin+Foto"} 
                            style={{ height: '250px', objectFit: 'cover' }}
                            onError={(e) => { e.target.onerror = null; e.target.src = "https://via.placeholder.com/300?text=Sin+Foto"; }}
                        />
                    </Link>
                    
                    {/* Badge "AGOTADO" si stock es 0 (Opcional pero recomendado) */}
                    {product.stock <= 0 && (
                        <Badge bg="danger" className="position-absolute top-0 end-0 m-3 shadow">
                            AGOTADO
                        </Badge>
                    )}
                </div>

                {/* 2. CUERPO DE LA TARJETA (CENTRADO) */}
                <Card.Body className="d-flex flex-column text-center p-3">
                  
                  {/* Título (Gris oscuro / Negrita) */}
                  <h5 className="fw-bold text-secondary mb-2">
                    {product.title}
                  </h5>

                  {/* (SIN ESTRELLAS, como pediste) */}

                  {/* Precio (Rojo / Grande) */}
                  <h3 className="fw-bold text-danger my-2">
                    ${product.price}
                  </h3>

                  {/* Espaciador para empujar el botón al fondo */}
                  <div className="mt-auto pt-3">
                    <Link to={`/product/${product.id}`} className="d-grid text-decoration-none">
                        {/* Botón Negro y Ancho Completo */}
                        <Button variant="dark" size="lg" className="rounded-0 text-uppercase fs-6 fw-bold py-2">
                            Ver Detalles
                        </Button>
                    </Link>
                  </div>

                </Card.Body>
              </Card>

            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}