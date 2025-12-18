import React, { useEffect, useState } from 'react';
import { useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 
import { Container, Row, Col, Card, Button, Spinner } from 'react-bootstrap';

export function SearchResults() {
  const [searchParams] = useSearchParams();
  const query = searchParams.get('q') || "";
  
  // 2. USAMOS ESTADOS PARA GUARDAR LO QUE TRAIGA LA BD
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchResults = async () => {
      setLoading(true);
      try {
        if (!query.trim()) {
            setProducts([]);
            setLoading(false);
            return;
        }

        // 3. LA BÚSQUEDA INTELIGENTE EN SUPABASE
        const searchTerm = `%${query}%`; // Los % sirven para buscar coincidencias parciales

        const { data, error } = await supabase
          .from('products')
          .select('*')
          // "ilike" ignora mayúsculas. 
          // Buscamos en Título O Descripción O Categoría O Código
          .or(`title.ilike.${searchTerm},description.ilike.${searchTerm},category.ilike.${searchTerm},product_code.ilike.${searchTerm}`);

        if (error) throw error;
        setProducts(data || []);
      
      } catch (error) {
        console.error("Error buscando:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchResults();
  }, [query]); // Se ejecuta cada vez que cambia la URL (?q=...)

  return (
    <Container className="py-5">
      <div className="mb-4">
        <h2 className="fw-bold">Resultados de búsqueda: "{query}"</h2>
        {/* Mostramos contador solo si ya cargó */}
        {!loading && (
            <p className="text-muted">{products.length} productos encontrados</p>
        )}
        <Link to="/" className="btn btn-outline-secondary btn-sm">← Volver al Catálogo</Link>
      </div>

      {loading ? (
        // SPINNER DE CARGA
        <div className="text-center py-5">
            <Spinner animation="border" role="status" variant="dark" />
            <p className="mt-2 text-muted">Buscando en el inventario...</p>
        </div>
      ) : (
        <Row>
            {products.length > 0 ? (
            products.map((product) => (
                <Col key={product.id} md={6} lg={3} className="mb-4">
                {/* TU DISEÑO EXACTO DE TARJETA */}
                <Card className="h-100 border-0 shadow-sm hover-effect">
                    <Link to={`/product/${product.id}`} className="position-relative overflow-hidden d-block" style={{ height: '250px' }}>
                        <Card.Img 
                            variant="top" 
                            src={product.image || "https://via.placeholder.com/300?text=Sin+Foto"} 
                            className="h-100 w-100" 
                            style={{ objectFit: 'cover' }}
                            onError={(e) => {e.target.src = "https://via.placeholder.com/300?text=Sin+Foto"}} 
                        />
                        {/* Etiqueta de Agotado (Opcional) */}
                        {product.stock <= 0 && (
                            <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 small fw-bold">AGOTADO</div>
                        )}
                    </Link>
                    <Card.Body className="text-center">
                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                        <Card.Title className="fs-6 fw-bold text-secondary mb-3">{product.title}</Card.Title>
                    </Link>
                    {/* Precio Grande y Rojo */}
                    <Card.Text className="fw-bold text-danger fs-5">${product.price}</Card.Text>
                    
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
                <h3> No encontramos nada similar a "{query}".</h3>
                <p className="text-muted">Intenta buscar por código (ej: POR-001) o una palabra más general.</p>
            </div>
            )}
        </Row>
      )}
    </Container>
  );
}