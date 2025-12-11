import React from 'react';
import { Carousel, Container, Button } from 'react-bootstrap';

export function Hero() {
  return (
    <div className="bg-light mb-5">
        <Container fluid className="p-0">
            <Carousel>
                <Carousel.Item>
                    <div style={{ height: '450px', position: 'relative' }}>
                        <img
                        className="d-block w-100 h-100"
                        src="https://images.unsplash.com/photo-1576013551627-0cc20b96c2a7?w=1200&q=80"
                        alt="Piscina Travertino"
                        style={{ objectFit: 'cover' }}
                        />
                        <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center ps-5" style={{background: 'linear-gradient(90deg, rgba(255,255,255,0.9) 0%, rgba(255,255,255,0) 60%)'}}>
                            <Container>
                                <h2 className="display-4 text-secondary">Nueva Colección</h2>
                                <h1 className="display-3 fw-bold text-dark">TRAVERTINO</h1>
                                <Button variant="outline-dark" size="lg" className="mt-3 rounded-0 px-5">VER MÁS</Button>
                            </Container>
                        </div>
                    </div>
                </Carousel.Item>
                {/* Puedes agregar más Carousel.Item aquí */}
            </Carousel>
        </Container>
    </div>
  );
}