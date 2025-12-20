import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Container, Table, Button, Form, Modal, Row, Col, Card, Spinner, Alert } from 'react-bootstrap';

export function AdminHero() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);

  const [formData, setFormData] = useState({
    title: '',
    subtitle: '',
    button_text: '',
    link: '',
    image_url: ''
  });

  useEffect(() => {
    fetchSlides();
  }, []);

  const fetchSlides = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('hero_slides').select('*').order('id', { ascending: true });
    if (error) console.error(error);
    else setSlides(data || []);
    setLoading(false);
  };

  // --- SUBIDA DE IMAGEN ---
  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;

      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(fileName, file);

      if (uploadError) throw uploadError;

      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error) {
      alert("Error subiendo imagen: " + error.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!formData.title.trim() || 
        !formData.subtitle.trim() || 
        !formData.button_text.trim() || 
        !formData.link.trim() || 
        !formData.image_url) {
      alert("Todos los campos son obligatorios.");
      return;
    }

    try {
      if (editingId) {
        const { error } = await supabase.from('hero_slides').update(formData).eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('hero_slides').insert([formData]);
        if (error) throw error;
      }

      setShowModal(false);
      fetchSlides();
      alert(" Guardado correctamente");
    } catch (error) {
      alert("Error: " + error.message);
    }
  };

  const handleEdit = (slide) => {
    setEditingId(slide.id);
    setFormData({
      title: slide.title,
      subtitle: slide.subtitle,
      button_text: slide.button_text,
      link: slide.link,
      image_url: slide.image_url
    });
    setShowModal(true);
  };

  const handleDelete = async (id) => {
    if (window.confirm("¿Seguro que quieres borrar este slide?")) {
      await supabase.from('hero_slides').delete().eq('id', id);
      fetchSlides();
    }
  };

  const openNewModal = () => {
    setEditingId(null);
    setFormData({ title: '', subtitle: '', button_text: '', link: '', image_url: '' });
    setShowModal(true);
  };

  if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

  return (
    <Container className="py-4">
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="fw-bold text-secondary">Editor del Carrusel (Home)</h2>
        <Button variant="dark" onClick={openNewModal}>+ Nueva Diapositiva</Button>
      </div>

      <Alert variant="info">
        <strong>Nota sobre Links:</strong> Para redirigir a una página interna usa <code>/catalogo</code> o <code>/producto/1</code>. 
        Para enlaces externos usa <code>https://instagram.com</code>.
      </Alert>

      <Card className="shadow-sm border-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light">
            <tr>
              <th>Imagen</th>
              <th>Contenido</th>
              <th>Link / Botón</th>
              <th className="text-end">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {slides.length === 0 ? (
              <tr><td colSpan="4" className="text-center p-4">No hay diapositivas. Agrega la primera.</td></tr>
            ) : (
              slides.map(slide => (
                <tr key={slide.id}>
                  <td>
                    <img src={slide.image_url} alt="slide" style={{width: '100px', height: '60px', objectFit: 'cover', borderRadius: '4px'}} />
                  </td>
                  <td>
                    <div className="fw-bold">{slide.title}</div>
                    <small className="text-muted">{slide.subtitle}</small>
                  </td>
                  <td>
                    <div className="badge bg-dark">{slide.button_text}</div>
                    <div className="small text-primary text-truncate" style={{maxWidth: '150px'}}>{slide.link}</div>
                  </td>
                  <td className="text-end">
                    <Button variant="link" size="sm" onClick={() => handleEdit(slide)}>Editar</Button>
                    <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(slide.id)}>Borrar</Button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </Table>
      </Card>

      {/* MODAL DE EDICIÓN */}
      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Editar Diapositiva' : 'Nueva Diapositiva'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Título Principal (Grande) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="Ej: PORCELANATO" value={formData.title} onChange={e => setFormData({...formData, title: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Subtítulo (Pequeño) <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="Ej: Nuevos Destacados" value={formData.subtitle} onChange={e => setFormData({...formData, subtitle: e.target.value})} />
                </Form.Group>
              </Col>
            </Row>

            <Row className="mb-3">
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Texto del Botón <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="Ej: Ver más" value={formData.button_text} onChange={e => setFormData({...formData, button_text: e.target.value})} />
                </Form.Group>
              </Col>
              <Col md={6}>
                <Form.Group>
                  <Form.Label>Link de Redirección <span className="text-danger">*</span></Form.Label>
                  <Form.Control type="text" placeholder="Ej: /catalogo" value={formData.link} onChange={e => setFormData({...formData, link: e.target.value})} />
                  <Form.Text className="text-muted">Copia y pega la ruta a donde quieres ir desde la página.</Form.Text>
                </Form.Group>
              </Col>
            </Row>

            <Form.Group className="mb-3">
              <Form.Label>Imagen de Fondo <span className="text-danger">*</span></Form.Label>
              <Form.Control type="file" onChange={handleImageUpload} disabled={uploading} className={!formData.image_url ? "is-invalid" : "is-valid"} />
              {uploading && <div className="text-primary mt-2">Subiendo imagen...</div>}
              {formData.image_url && (
                <div className="mt-2 border p-1 rounded">
                  <img src={formData.image_url} alt="Preview" style={{width: '100%', maxHeight: '200px', objectFit: 'cover', borderRadius: '4px'}} />
                </div>
              )}
              {!formData.image_url && <div className="invalid-feedback d-block">La imagen es obligatoria.</div>}
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={uploading}>Guardar Todo</Button>
        </Modal.Footer>
      </Modal>
    </Container>
  );
}