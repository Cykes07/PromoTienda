import React, { useEffect, useState } from 'react';
import { useParams, useSearchParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Row, Col, Spinner, Alert, Badge, Breadcrumb } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';
import { NotFound } from '../components/NotFound';

export function CategoryPage() {
  const { slug } = useParams();
  const [searchParams] = useSearchParams();
  const subFilter = searchParams.get('sub');

  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [isNotFound, setIsNotFound] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      setIsNotFound(false);
      
      try {

        if (slug.toLowerCase() !== 'promociones') {
            const { data: categoryData, error: catError } = await supabase
                .from('categories')
                .select('is_visible_in_menu')
                .eq('name', slug)
                .single();
            if (catError || !categoryData || categoryData.is_visible_in_menu === false) {
                setIsNotFound(true);
                setLoading(false);
                return; 
            }
        }

        let query = supabase.from('products').select('*');

        if (slug.toLowerCase() === 'promociones') {
           query = query.contains('category', ['Promociones']);
        } else {
           query = query.contains('category', [slug]);
        }

        const { data, error } = await query;
        if (error) throw error;

        let filteredProducts = data || [];

        if (subFilter && filteredProducts.length > 0) {
            filteredProducts = filteredProducts.filter(p => 
                p.subcategory && 
                Array.isArray(p.subcategory) && 
                p.subcategory.includes(subFilter)
            );
        }

        setProducts(filteredProducts);

      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [slug, subFilter]); 
  if (isNotFound) {
      return <NotFound />;
  }

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;

  return (
    <Container className="py-4">
      <Helmet><title>{slug} - PromoConstruye</title></Helmet>

      <Breadcrumb className="mb-4">
          <Breadcrumb.Item linkAs={Link} linkProps={{ to: "/" }}>Inicio</Breadcrumb.Item>
          <Breadcrumb.Item active={!subFilter} linkAs={Link} linkProps={{ to: `/category/${slug}` }}>{slug}</Breadcrumb.Item>
          {subFilter && <Breadcrumb.Item active>{subFilter}</Breadcrumb.Item>}
      </Breadcrumb>

      <div className="d-flex align-items-center mb-4">
        <h1 className="fw-bold mb-0 text-uppercase">{slug}</h1>
        {subFilter && <Badge bg="danger" className="ms-3 fs-6">{subFilter}</Badge>}
      </div>

      {products.length === 0 ? (
        <Alert variant="info" className="text-center py-5">
            <h4>No hay productos aquí 🧐</h4>
            <p>No encontramos productos en <strong>{slug}</strong>.</p>
            <Link to="/" className="btn btn-dark mt-2">Volver</Link>
        </Alert>
      ) : (
        <Row>
          {products.map((product) => (
             <Col key={product.id} xs={6} md={4} lg={3} className="mb-4">
                <div className="card h-100 shadow-sm border-0">
                    <Link to={`/product/${product.id}`} className="text-decoration-none text-dark">
                        <div style={{height: '250px', overflow: 'hidden', position: 'relative'}}>
                             <img src={product.image} className="card-img-top w-100 h-100" style={{objectFit: 'cover'}} alt={product.title}/>
                             {product.stock <= 0 && <span className="position-absolute top-0 end-0 bg-dark text-white px-2 py-1 m-2 small fw-bold">AGOTADO</span>}
                        </div>
                        <div className="card-body">
                            <h6 className="card-title fw-bold text-truncate">{product.title}</h6>
                            <p className="card-text text-danger fw-bold fs-5 mb-1">${product.price}</p>
                            <small className="text-muted">Stock: {product.stock}</small>
                        </div>
                    </Link>
                </div>
             </Col>
          ))}
        </Row>
      )}
    </Container>
  );
}