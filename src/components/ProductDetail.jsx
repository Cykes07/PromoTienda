import React, { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '../supabaseClient';
import { Container, Row, Col, Button, Spinner, Badge, Tabs, Tab, Table, Carousel } from 'react-bootstrap';
import { Helmet } from 'react-helmet-async';

export function ProductDetail() {
  const { id } = useParams();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  
  const [index, setIndex] = useState(0); 

  useEffect(() => {
    const fetchProduct = async () => {
      try {
        const { data, error } = await supabase.from('products').select('*').eq('id', id).single();
        if (error) throw error;
        setProduct(data);
      } catch (error) { console.error("Error:", error); } 
      finally { setLoading(false); }
    };
    fetchProduct();
  }, [id]);

  const handleSelect = (selectedIndex) => {
    setIndex(selectedIndex);
  };

  if (loading) return <Container className="py-5 text-center"><Spinner animation="border" /></Container>;
  if (!product) return <Container className="py-5 text-center"><h2>Producto no encontrado 😕</h2><Link to="/"><Button variant="dark" className="mt-3">Volver al Inicio</Button></Link></Container>;

  const specs = product.specifications || [];
  const allImages = [];
  if (product.image) allImages.push(product.image);
  if (product.gallery_images && Array.isArray(product.gallery_images)) {
      allImages.push(...product.gallery_images);
  }
  const defaultImage = "https://via.placeholder.com/500?text=Sin+Imagen";

  return (
    <Container className="py-5">
      {product && (
          <Helmet>
              <title>{product.title} | PromoConstruye</title>
              <meta name="description" content={`Compra ${product.title} al mejor precio. ${product.description?.substring(0, 100)}...`} />
          </Helmet>
      )}
      <style>
        {`
          .custom-tabs .nav-link {
            color: #555 !important;
            font-weight: 600;
          }
          .custom-tabs .nav-link.active {
            color: #000 !important;
            border-bottom: 2px solid #000 !important;
          }
        `}
      </style>

      <Link to="/" className="btn btn-outline-secondary mb-4">← Volver al catálogo</Link>
      
      <Row className="mb-5">
        <Col md={6}>
            <Carousel activeIndex={index} onSelect={handleSelect} className="shadow-sm rounded overflow-hidden mb-3" style={{ background: '#f8f9fa' }} interval={null}>
                {allImages.length > 0 ? (
                    allImages.map((imgUrl, i) => (
                        <Carousel.Item key={i}>
                            <img className="d-block w-100" src={imgUrl} alt={`Slide ${i}`} style={{ maxHeight: '500px', objectFit: 'contain', minHeight: '300px' }} onError={(e) => {e.target.src = defaultImage}} />
                        </Carousel.Item>
                    ))
                ) : ( <Carousel.Item><img className="d-block w-100" src={defaultImage} alt="Sin imagen" /></Carousel.Item> )}
            </Carousel>
            {allImages.length > 1 && (
                <div className="d-flex justify-content-center gap-2 overflow-auto py-2">
                    {allImages.map((imgUrl, i) => (
                        <div key={i} onClick={() => setIndex(i)} style={{ width: '70px', height: '70px', cursor: 'pointer', border: index === i ? '2px solid #333' : '1px solid #dee2e6', borderRadius: '6px', padding: '2px', opacity: index === i ? 1 : 0.6 }}>
                            <img src={imgUrl} alt={`Thumb ${i}`} style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '4px' }} />
                        </div>
                    ))}
                </div>
            )}
        </Col>

        <Col md={6}>
            <div className="ps-md-4 mt-3 mt-md-0">
                <Badge bg="dark" className="mb-2">{product.category}</Badge> 
                <h1 className="fw-bold">{product.title}</h1>
                <h2 className="text-danger fw-bold my-3" style={{ fontSize: '2.5rem' }}> ${product.price}</h2>
                <p className="lead text-muted">{product.description}</p>
                <hr />
                <div className="d-flex align-items-center mb-4">
                    <span className={`px-3 py-2 rounded text-white fw-bold shadow-sm ${product.stock > 0 ? 'bg-success' : 'bg-danger'}`} style={{ fontSize: '1.2rem' }}>
                        {product.stock > 0 ? `En Stock: ${product.stock} unidades` : 'Agotado'}
                    </span>
                </div>
                
                {/* BOTÓN DE CARRITO */}
                <Button variant="dark" size="lg" className="w-100 mb-3" disabled={product.stock <= 0}>
                    {product.stock > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
                </Button>

                {/*"CLICK TO VIEW"  */}
                {product.external_url && (
                    <div>
                        <a 
                            href={product.external_url} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="btn btn-outline-dark" 
                        >
                            Click to View 
                        </a>
                    </div>
                )}

            </div>
        </Col>
      </Row>

      <Row>
          <Col>
            <div className="bg-white p-4 rounded shadow-sm border">
                <Tabs 
                    defaultActiveKey="desc" 
                    id="product-tabs" 
                    className="mb-3 custom-tabs" 
                >
                    <Tab eventKey="desc" title="DESCRIPCIÓN COMPLETA">
                        <div className="p-2">
                            <p className="text-dark" style={{fontSize: '1.1rem'}}>
                                {product.description || "Sin descripción detallada."}
                            </p>
                            <p className="text-muted small mt-4">
                                * Las imágenes son referenciales y pueden variar ligeramente del producto real.
                            </p>
                        </div>
                    </Tab>

                    <Tab eventKey="info" title="INFORMACIÓN ADICIONAL">
                        <h5 className="mb-3 text-secondary">Ficha Técnica</h5>
                        {specs.length > 0 ? (
                            <Table striped bordered hover responsive>
                                <tbody>
                                    {specs.map((item, i) => (
                                        <tr key={i}>
                                            <th style={{width: '30%'}} className="text-secondary bg-light">{item.title}</th>
                                            <td className="text-dark fw-bold">{item.value}</td>
                                        </tr>
                                    ))}
                                </tbody>
                            </Table>
                        ) : ( <p className="text-muted">No hay detalles técnicos.</p> )}
                    </Tab>

                </Tabs>
            </div>
          </Col>
      </Row>
    </Container>
  );
}