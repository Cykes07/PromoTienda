import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge, Tabs, Tab } from 'react-bootstrap';
import { products } from '../data/products'; 
import { NotFound } from './NotFound';
import AdditionalInfoTable from './AdditionalInfoTable';

export function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));

  // 1. DETECTOR DE INFORMACIÓN ADICIONAL
  // Verificamos si existe al menos uno de los campos técnicos importantes.
  // Si tu base de datos devuelve null o undefined, esto será false.
  const hasAdditionalInfo = product && (
      product.brand || 
      product.application || 
      product.code || 
      product.m2PerBox
  );

  // 2. LÓGICA DE PESTAÑA INICIAL
  // Si hay info adicional, empezamos ahí. Si no, forzamos 'description'.
  const [activeTab, setActiveTab] = useState(hasAdditionalInfo ? 'info' : 'description');
  
  const [mainImg, setMainImg] = useState(product ? product.image : '');
  const stockReal = product ? Number(product.stock) : 0; 

  if (!product) { return <NotFound />; }

  const getImgPath = (path) => path.startsWith('http') ? path : import.meta.env.BASE_URL + path;

  return (
    <Container className="py-5">
      <Link to="/" className="btn btn-outline-secondary mb-4">← Volver al Catálogo</Link>

      {/* --- SECCIÓN SUPERIOR (Igual que antes) --- */}
      <Row className="mb-5">
        <Col md={6}>
            <div className="border mb-3 bg-white">
                <img src={getImgPath(mainImg || product.image)} alt={product.title} className="w-100" style={{ objectFit: 'contain', maxHeight: '500px' }} />
            </div>
            <div className="d-flex gap-2">
                {product.gallery && product.gallery.map((img, index) => (
                    <img key={index} src={getImgPath(img)} className="border cursor-pointer" width="80" height="80" style={{ objectFit: 'cover', cursor: 'pointer' }} onClick={() => setMainImg(img)} />
                ))}
            </div>
        </Col>

        <Col md={6}>
            <h6 className="text-muted text-uppercase">{product.category}</h6>
            <h1 className="fw-bold">{product.title}</h1>
            <h3 className="text-danger my-3">${product.price}</h3>
            <p className="lead text-secondary">{product.description}</p>
            
            <div className="mb-4">
                {stockReal > 0 ? (
                    <Badge bg="success" className="p-2 fs-6">En Stock: {stockReal} unidades</Badge>
                ) : (
                    <Badge bg="danger" className="p-2 fs-6">Agotado</Badge>
                )}
            </div>

            <div className="d-grid gap-2">
                <Button variant="dark" size="lg" disabled={stockReal <= 0}>
                    {stockReal > 0 ? 'Añadir al Carrito' : 'Sin Stock'}
                </Button>
            </div>
        </Col>
      </Row>

      {/* --- SECCIÓN INFERIOR CONDICIONAL --- */}
      <Row>
          <Col>
              <div className="bg-white p-4 shadow-sm rounded border">
                  
                  {/* CASO A: TIENE INFORMACIÓN TÉCNICA -> Mostramos Tabs */}
                  {hasAdditionalInfo ? (
                      <Tabs
                          id="product-tabs"
                          activeKey={activeTab}
                          onSelect={(k) => setActiveTab(k)}
                          className="mb-3"
                      >
                          <Tab eventKey="info" title="INFORMACIÓN ADICIONAL">
                              <h5 className="mb-3 text-secondary">Ficha Técnica</h5>
                              <AdditionalInfoTable product={product} />
                          </Tab>
                          
                          <Tab eventKey="description" title="DESCRIPCIÓN COMPLETA">
                               <div className="p-2">
                                  <p>{product.description}</p>
                               </div>
                          </Tab>
                      </Tabs>
                  ) : (
                      // CASO B: NO TIENE INFORMACIÓN -> Solo mostramos la descripción (Sin Tabs)
                      <div>
                          <h5 className="mb-3 text-secondary border-bottom pb-2">DESCRIPCIÓN COMPLETA</h5>
                          <p>{product.description}</p>
                      </div>
                  )}

              </div>
          </Col>
      </Row>
    </Container>
  );
}