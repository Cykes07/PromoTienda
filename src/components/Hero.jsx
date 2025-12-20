import React, { useEffect, useState } from 'react';
import { Carousel, Container, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

  // 1. CARGAR DATOS REALES DE SUPABASE
  useEffect(() => {
    const fetchHeroSlides = async () => {
      try {
        const { data, error } = await supabase
          .from('hero_slides')
          .select('*')
          .order('id', { ascending: true });
        
        if (error) throw error;
        setSlides(data || []);
      } catch (error) {
        console.error("Error cargando carrusel:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchHeroSlides();
  }, []);

  if (loading) return <div className="bg-light d-flex align-items-center justify-content-center" style={{height: '450px'}}><Spinner animation="border" /></div>;
  
  if (slides.length === 0) return null; 

  return (
    <div className="bg-light mb-5">
        <style>
          {`
            /* TUS ESTILOS FAVORITOS DE FLECHAS */
            .custom-carousel .carousel-control-prev,
            .custom-carousel .carousel-control-next {
                width: 45px !important;
                height: 45px !important;
                top: auto !important;
                bottom: 30px !important;
                opacity: 1 !important;
                background-color: transparent !important; 
                border: 2px solid #212529;
                border-radius: 50%;
                transition: all 0.3s ease;
                z-index: 100;
            }
            .custom-carousel .carousel-control-prev:hover,
            .custom-carousel .carousel-control-next:hover {
                background-color: rgba(33, 37, 41, 0.1) !important;
                transform: scale(1.1);
            }
            .custom-carousel .carousel-control-next { right: 30px !important; }
            .custom-carousel .carousel-control-prev { left: auto !important; right: 85px !important; }
            .carousel-control-prev-icon, .carousel-control-next-icon { width: 20px; height: 20px; }
          `}
        </style>

        <Container fluid className="p-0">
            <Carousel fade interval={5000} className="custom-carousel" variant="dark"> 
                {slides.map((slide) => (
                    <Carousel.Item key={slide.id}>
                        <div style={{ height: '450px', position: 'relative' }}>
                            <img
                                className="d-block w-100 h-100"
                                src={slide.image_url}
                                alt={slide.title}
                                style={{ objectFit: 'cover' }}
                            />
                            
                            <div 
                                className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center ps-5" 
                                style={{background: 'linear-gradient(90deg, rgba(255,255,255,0.95) 0%, rgba(255,255,255,0.7) 35%, rgba(255,255,255,0) 100%)'}}
                            >
                                <Container>
                                    <h2 className="display-4 text-secondary">{slide.subtitle}</h2>
                                    <h1 className="display-3 fw-bold text-dark">{slide.title}</h1>
                                    
                                    {/* Detectamos si es link interno o externo */}
                                    {slide.link.startsWith('http') ? (
                                       <a href={slide.link} target="_blank" rel="noopener noreferrer">
                                          <Button variant="outline-dark" size="lg" className="mt-3 rounded-0 px-5">
                                              {slide.button_text}
                                          </Button>
                                       </a>
                                    ) : (
                                       <Link to={slide.link}>
                                          <Button variant="outline-dark" size="lg" className="mt-3 rounded-0 px-5">
                                              {slide.button_text}
                                          </Button>
                                       </Link>
                                    )}
                                    
                                </Container>
                            </div>
                        </div>
                    </Carousel.Item>
                ))}
            </Carousel>
        </Container>
    </div>
  );
}