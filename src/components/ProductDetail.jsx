import React, { useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { Container, Row, Col, Button, Badge } from 'react-bootstrap';
import { products } from '../data/products';
import { NotFound } from './NotFound';

export function ProductDetail() {
  const { id } = useParams();
  const product = products.find(p => p.id === parseInt(id));
  const [mainImg, setMainImg] = useState(product ? product.image : '');

  if (!product) return <NotFound />;

  const getImgPath = (path) => path.startsWith('http') ? path : import.meta.env.BASE_URL + path;

  return (
    <Container className="py-5">
      <Link to="/" className="btn btn-outline-secondary mb-4">← Volver</Link>
      <Row>
        <Col md={6}>
            <img src={getImgPath(mainImg || product.image)} className="w-100 border mb-2" style={{maxHeight:'500px', objectFit:'contain'}} />
            <div className="d-flex gap-2">
                {product.gallery && product.gallery.map((img, i) => (
                    <img key={i} src={getImgPath(img)} width="80" height="80" className="border" onClick={() => setMainImg(img)} style={{cursor:'pointer'}} />
                ))}
            </div>
        </Col>
        <Col md={6}>
            <h1>{product.title}</h1>
            <h3 className="text-danger">${product.price.toFixed(2)}</h3>
            <p>{product.description}</p>
            <div className="mb-3">{product.stock > 0 ? <Badge bg="success">En Stock</Badge> : <Badge bg="danger">Agotado</Badge>}</div>
            <Button variant="dark" size="lg" disabled={product.stock === 0}>Añadir al Carrito</Button>
        </Col>
      </Row>
    </Container>
  );
}