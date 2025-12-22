import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Container, Row, Col, Tab, Nav, Card, Table, Button, Form, Modal, Spinner, Alert, ListGroup, Badge } from 'react-bootstrap';

function HeroEditor() {
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [editingId, setEditingId] = useState(null);
  const [formData, setFormData] = useState({ title: '', subtitle: '', button_text: '', link: '', image_url: '' });

  useEffect(() => { fetchSlides(); }, []);

  const fetchSlides = async () => {
    setLoading(true);
    const { data } = await supabase.from('hero_slides').select('*').order('id', { ascending: true });
    setSlides(data || []);
    setLoading(false);
  };

  const handleImageUpload = async (event) => {
    try {
      setUploading(true);
      const file = event.target.files[0];
      if (!file) return;
      const fileExt = file.name.split('.').pop();
      const fileName = `hero-${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage.from('images').upload(fileName, file);
      if (error) throw error;
      const { data } = supabase.storage.from('images').getPublicUrl(fileName);
      setFormData(prev => ({ ...prev, image_url: data.publicUrl }));
    } catch (error) { alert("Error imagen: " + error.message); } 
    finally { setUploading(false); }
  };

  const handleSave = async () => {
    if (!formData.title || !formData.image_url) return alert("Faltan datos obligatorios.");
    try {
      if (editingId) await supabase.from('hero_slides').update(formData).eq('id', editingId);
      else await supabase.from('hero_slides').insert([formData]);
      setShowModal(false); fetchSlides();
    } catch (error) { alert(error.message); }
  };

  const handleDelete = async (id) => {
    if (confirm("¿Borrar slide?")) { await supabase.from('hero_slides').delete().eq('id', id); fetchSlides(); }
  };

  const openModal = (slide = null) => {
    setEditingId(slide?.id || null);
    setFormData(slide ? { ...slide } : { title: '', subtitle: '', button_text: '', link: '', image_url: '' });
    setShowModal(true);
  };

  if (loading) return <Spinner animation="border" />;

  return (
    <div>
      <Alert variant="info" className="mb-3 py-2 small">
        <strong>Nota sobre Links:</strong> Para redirigir a una página interna usa <code>/catalogo</code> o <code>/producto/1</code>. Para enlaces externos usa <code>https://instagram.com</code>.
      </Alert>

      <div className="d-flex justify-content-between align-items-center mb-3">
        <h5 className="text-secondary">Diapositivas del Carrusel</h5>
        <Button variant="dark" size="sm" onClick={() => openModal(null)}>+ Nueva Diapositiva</Button>
      </div>
      <Table responsive hover className="align-middle">
        <thead className="bg-light"><tr><th>Img</th><th>Texto</th><th>Acción</th></tr></thead>
        <tbody>
          {slides.map(s => (
            <tr key={s.id}>
              <td><img src={s.image_url} alt="slide" style={{width: 60, height: 40, objectFit:'cover', borderRadius: 4}}/></td>
              <td><div className="fw-bold">{s.title}</div><small>{s.subtitle}</small></td>
              <td>
                <Button variant="link" size="sm" onClick={() => openModal(s)}>Editar</Button>
                <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(s.id)}>Eliminar</Button>
              </td>
            </tr>
          ))}
          {slides.length === 0 && <tr><td colSpan="3" className="text-center">Sin diapositivas.</td></tr>}
        </tbody>
      </Table>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg">
        <Modal.Header closeButton><Modal.Title>{editingId ? 'Editar' : 'Crear'} Slide</Modal.Title></Modal.Header>
        <Modal.Body>
           <Form>
             <Row className="mb-2"><Col><Form.Control placeholder="Subtítulo (pequeño)" value={formData.subtitle} onChange={e=>setFormData({...formData, subtitle: e.target.value})}/></Col><Col><Form.Control placeholder="TÍTULO (GRANDE)" value={formData.title} onChange={e=>setFormData({...formData, title: e.target.value})}/></Col></Row>
             <Row className="mb-2"><Col><Form.Control placeholder="Texto Botón" value={formData.button_text} onChange={e=>setFormData({...formData, button_text: e.target.value})}/></Col><Col><Form.Control placeholder="Link (/catalogo)" value={formData.link} onChange={e=>setFormData({...formData, link: e.target.value})}/></Col></Row>
             <Form.Control type="file" onChange={handleImageUpload} disabled={uploading} />
             {uploading && <small>Subiendo...</small>}
             {formData.image_url && <img src={formData.image_url} className="mt-2 w-100 rounded" style={{maxHeight: 150, objectFit: 'cover'}} />}
           </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave} disabled={uploading}>Guardar</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}

function CategoryHeaderEditor() {
    const [categories, setCategories] = useState([]);
    const [subcategories, setSubcategories] = useState([]);
    const [newCat, setNewCat] = useState("");
    const [newSub, setNewSub] = useState("");
    const [selectedParent, setSelectedParent] = useState("");

    useEffect(() => { fetchCats(); }, []);

    const fetchCats = async () => {
        const { data: c } = await supabase.from('categories').select('*').order('name');
        const { data: s } = await supabase.from('subcategories').select('*, categories(name)').order('name');
        
        setCategories(c || []);
        setSubcategories(s || []);
        
        if (c && c.length > 0 && !selectedParent) {
            setSelectedParent(c[0].id);
        }
    };

    const addCategory = async () => {
        if (!newCat.trim()) return;
        const { data, error } = await supabase.from('categories').insert([{ name: newCat, is_visible_in_menu: true }]).select();
        if (!error && data) {
            setCategories([...categories, data[0]]);
            setNewCat("");
            setSelectedParent(data[0].id);
        } else {
            alert("Error: " + error?.message);
        }
    };

    const toggleCatVisibility = async (category) => {
        try {
            const newVal = !(category.is_visible_in_menu === true);
            setCategories(prev => prev.map(c => c.id === category.id ? {...c, is_visible_in_menu: newVal} : c));
            await supabase.from('categories').update({ is_visible_in_menu: newVal }).eq('id', category.id);
        } catch (error) { alert("Error: " + error.message); fetchCats(); }
    };

    const addSubcategory = async () => {
        if (!newSub.trim()) return alert("Escribe un nombre");
        if (!selectedParent) return alert("Selecciona una categoría primero");

        const { data, error } = await supabase.from('subcategories')
            .insert([{ name: newSub, category_id: selectedParent, is_visible_in_menu: true }])
            .select('*, categories(name)');

        if (!error && data) {
            setSubcategories([...subcategories, data[0]]);
            setNewSub("");
        } else {
            alert("Error: " + error?.message);
        }
    };

    const toggleSubVisibility = async (sub) => {
        try {
            const newVal = !(sub.is_visible_in_menu === true);
            setSubcategories(prev => prev.map(s => s.id === sub.id ? {...s, is_visible_in_menu: newVal} : s));
            await supabase.from('subcategories').update({ is_visible_in_menu: newVal }).eq('id', sub.id);
        } catch (error) { alert("Error: " + error.message); fetchCats(); }
    };

    const deleteSub = async (id) => {
        if (confirm("¿Eliminar subcategoría? Se borrará de los productos también.")) {
            await supabase.from('subcategories').delete().eq('id', id);
            setSubcategories(prev => prev.filter(s => s.id !== id));
        }
    };

    const visibleSubcategories = subcategories.filter(s => String(s.category_id) === String(selectedParent));
    const selectedParentName = categories.find(c => String(c.id) === String(selectedParent))?.name || "Selecciona Categoría";

    return (
        <div>
            <Alert variant="secondary" className="py-2 small mb-4">
                <strong>Gestor del Menú:</strong> Selecciona una categoría a la izquierda para ver y editar sus subcategorías a la derecha.
            </Alert>
            
            <Row>
                <Col md={5} className="border-end">
                    <h6 className="fw-bold text-dark mb-3">1. Categorías Principales</h6>
                    
                    <div className="d-flex gap-2 mb-3">
                        <Form.Control size="sm" placeholder="Nueva Categoría..." value={newCat} onChange={e => setNewCat(e.target.value)} />
                        <Button size="sm" variant="dark" onClick={addCategory}>+</Button>
                    </div>
                    
                    <div className="bg-light border rounded" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        <ListGroup variant="flush">
                            {categories.map(c => (
                                <ListGroup.Item 
                                    key={c.id} 
                                    active={String(c.id) === String(selectedParent)}
                                    className="d-flex justify-content-between align-items-center py-2 px-3 action-item"
                                    style={{cursor: 'pointer', borderColor: '#eee'}}
                                    onClick={() => setSelectedParent(c.id)} 
                                >
                                    <div className="d-flex align-items-center gap-2">
                                        <Form.Check 
                                            type="switch"
                                            checked={c.is_visible_in_menu === true}
                                            onChange={(e) => {
                                                e.stopPropagation();
                                                toggleCatVisibility(c);
                                            }}
                                            style={{cursor: 'pointer'}}
                                        />
                                        <span className={c.is_visible_in_menu === false ? "text-decoration-line-through opacity-50" : "fw-bold"}>
                                            {c.name}
                                        </span>
                                    </div>
                                    {String(c.id) === String(selectedParent) && <span></span>}
                                </ListGroup.Item>
                            ))}
                        </ListGroup>
                    </div>
                </Col>

                <Col md={7}>
                    <div className="d-flex justify-content-between align-items-center mb-3">
                        <h6 className="fw-bold text-dark m-0">
                            2. Subcategorías de: <span className="text-primary">{selectedParentName}</span>
                        </h6>
                    </div>

                    <div className="input-group input-group-sm mb-3">
                        <span className="input-group-text bg-white">Nueva para {selectedParentName}:</span>
                        <Form.Control placeholder="Nombre subcategoría..." value={newSub} onChange={e => setNewSub(e.target.value)} disabled={!selectedParent} />
                        <Button variant="outline-dark" onClick={addSubcategory} disabled={!selectedParent}>Crear</Button>
                    </div>

                    <div className="border rounded" style={{maxHeight: '400px', overflowY: 'auto'}}>
                        <Table striped hover size="sm" className="mb-0">
                            <thead className="bg-light sticky-top">
                                <tr>
                                    <th className="ps-3">Nombre</th>
                                    <th className="text-center">Visible</th>
                                    <th className="text-end pe-3">Acción</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleSubcategories.length > 0 ? (
                                    visibleSubcategories.map(s => (
                                        <tr key={s.id} className="align-middle">
                                            <td className="ps-3">{s.name}</td>
                                            <td className="text-center">
                                                <Form.Check 
                                                    type="switch"
                                                    className="d-inline-block"
                                                    checked={s.is_visible_in_menu === true}
                                                    onChange={() => toggleSubVisibility(s)}
                                                />
                                            </td>
                                            <td className="text-end pe-3">
                                                <span 
                                                    className="text-muted small cursor-pointer hover-danger" 
                                                    onClick={() => deleteSub(s.id)}
                                                    style={{cursor:'pointer'}}
                                                    title="Eliminar"
                                                >
                                                    
                                                </span>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan="3" className="text-center py-4 text-muted">
                                            {selectedParent ? (
                                                <>No hay subcategorías en <strong>{selectedParentName}</strong>.<br/><small>Crea una arriba</small></>
                                            ) : (
                                                <>Selecciona una categoría a la izquierda.</>
                                            )}
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </Table>
                    </div>
                </Col>
            </Row>
            <style>{`
                .action-item.active {
                    background-color: #f8f9fa !important;
                    color: #000 !important;
                    border-left: 4px solid #0d6efd !important;
                }
                .hover-danger:hover { color: red !important; }
            `}</style>
        </div>
    );
}


export function AdminPagesEditor() {
  return (
    <Container fluid className="py-2">
      <h3 className="fw-bold text-secondary mb-4">Editor de Páginas</h3>
      
      <Tab.Container id="pages-tabs" defaultActiveKey="home">
        <Row>
          <Col sm={3}>
            <Nav variant="pills" className="flex-column bg-white shadow-sm rounded p-2">
              <Nav.Item>
                <Nav.Link eventKey="home" className="fw-bold text-dark">Página de Inicio (Home)</Nav.Link>
              </Nav.Item>
              <Nav.Item>
                <Nav.Link eventKey="about" disabled className="text-muted">Quiénes Somos (Pronto)</Nav.Link>
              </Nav.Item>
            </Nav>
          </Col>
          
          <Col sm={9}>
            <Tab.Content>
              <Tab.Pane eventKey="home">
                 <Card className="shadow-sm border-0">
                    <Card.Header className="bg-white border-bottom">
                        <h5 className="m-0 fw-bold">Configuración del Home</h5>
                    </Card.Header>
                    <Card.Body>
                        <Tab.Container defaultActiveKey="carousel">
                            <Nav variant="tabs" className="mb-3">
                                <Nav.Item><Nav.Link eventKey="carousel">Carrusel Principal</Nav.Link></Nav.Item>
                                <Nav.Item><Nav.Link eventKey="categories">Categorías del Menú</Nav.Link></Nav.Item>
                            </Nav>
                            
                            <Tab.Content>
                                <Tab.Pane eventKey="carousel">
                                    <HeroEditor />
                                </Tab.Pane>
                                
                                <Tab.Pane eventKey="categories">
                                    <CategoryHeaderEditor />
                                </Tab.Pane>
                            </Tab.Content>
                        </Tab.Container>
                    </Card.Body>
                 </Card>
              </Tab.Pane>
            </Tab.Content>
          </Col>
        </Row>
      </Tab.Container>
    </Container>
  );
}