import React, { useEffect, useState } from 'react';
import { Carousel, Container, Button, Spinner } from 'react-bootstrap';
import { Link } from 'react-router-dom';
import { supabase } from '../supabaseClient'; 

export function Hero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);

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
                            <div className="position-absolute top-0 start-0 w-100 h-100 d-flex align-items-center ps-5">
                                <Container>
                                    <h2 className="display-4 text-danger fw-bold">
                                        {slide.subtitle}
                                    </h2>
                                    <h1 className="display-8 fw-bold text-dark">
                                        {slide.title}
                                    </h1>
                                    
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