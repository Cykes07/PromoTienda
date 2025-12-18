import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Row, Col, Card, Spinner, Alert, Form } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

export function CategoryPage() {
  const { slug } = useParams(); 
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [sortOption, setSortOption] = useState('relevance');

  useEffect(() => {
    const fetchByCategory = async () => {
      setLoading(true);
      setProducts([]); 
      try {
        const categoryName = decodeURIComponent(slug);

        let query = supabase
            .from('products')
            .select('*')
            .ilike('category', categoryName); 

        switch (sortOption) {
            case 'price-asc':
                query = query.order('price', { ascending: true });
                break;
            case 'price-desc':
                query = query.order('price', { ascending: false }); 
                break;
            case 'name-asc':
                query = query.order('title', { ascending: true });
                break;
            case 'name-desc':
                query = query.order('title', { ascending: false });
                break;
            case 'rating':
                query = query.order('id', { ascending: false }); 
                break;
            case 'relevance':
            default:
                break;
        }

        const { data, error } = await query;

        if (error) throw error;
        setProducts(data || []);

      } catch (error) {
        console.error("Error cargando categoría:", error.message);
      } finally {
        setLoading(false);
      }
    };

    fetchByCategory();
  }, [slug, sortOption]);

  const displayTitle = slug.charAt(0).toUpperCase() + slug.slice(1).replace(/-/g, ' ');

  return (
    <Container className="py-5">
      <Helmet>
        <title>{displayTitle} | PromoConstruye</title>
        <meta name="description" content={`Explora nuestra colección de ${displayTitle}.`} />
      </Helmet>


      <div className="d-flex flex-column flex-md-row justify-content-between align-items-center mb-4 border-bottom pb-3">
          <h2 className="fw-bold text-secondary m-0 mb-3 mb-md-0">
            Categoría: <span className="text-dark">{displayTitle}</span>
          </h2>
          
          <div className="d-flex align-items-center">
              <span className="me-2 text-muted fw-bold small">Ordenar por:</span>
              <Form.Select 
                  size="sm" 
                  style={{ width: '200px', cursor: 'pointer' }}
                  value={sortOption}
                  onChange={(e) => setSortOption(e.target.value)}
                  className="border-secondary shadow-sm"
              >
                  <option value="relevance">Relevancia</option>
                  <option value="rating">Mejor valorados</option>
                  <option value="name-asc">Nombre (A-Z)</option>
                  <option value="name-desc">Nombre (Z-A)</option>
                  <option value="price-asc">Precio: Más bajo primero</option>
                  <option value="price-desc">Precio: Más alto primero</option>
              </Form.Select>
          </div>
      </div>
      
      {loading ? (
        <div className="text-center py-5"><Spinner animation="border" variant="dark"/></div>
      ) : products.length === 0 ? (
        <Alert variant="info" className="text-center">
            <h4>No hay productos en esta categoría.</h4>
            <Link to="/" className="btn btn-outline-dark mt-3">Ver todo el catálogo</Link>
        </Alert>
      ) : (
        <Row>
          {products.map((product) => (
            <Col key={product.id} md={4} lg={3} className="mb-4">
               {/* TARJETA DE PRODUCTO */}
               <Card className="h-100 border-0 shadow-sm hover-effect">
                  <Link to={`/product/${product.id}`} className="position-relative overflow-hidden d-block" style={{ height: '250px' }}>
                      <Card.Img 
                          variant="top" 
                          src={product.image || "https://via.placeholder.com/300?text=Sin+Foto"} 
                          className="h-100 w-100" 
                          style={{ objectFit: 'cover' }}
                          onError={(e) => {e.target.src = "https://via.placeholder.com/300?text=Sin+Foto"}}
                      />
                      {product.stock <= 0 && <div className="position-absolute top-0 end-0 bg-danger text-white px-2 py-1 m-2 small fw-bold">AGOTADO</div>}
                  </Link>
                  <Card.Body className="text-center">
                    <Link to={`/product/${product.id}`} className="text-decoration-none">
                        <h6 className="fw-bold text-secondary mb-2 text-truncate">{product.title}</h6>
                    </Link>
                    <h5 className="text-danger fw-bold">${product.price}</h5>
                    <Link to={`/product/${product.id}`} className="btn btn-dark w-100 rounded-0 text-uppercase mt-2">
                      Ver Detalles
                    </Link>
                  </Card.Body>
              </Card>
            </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}