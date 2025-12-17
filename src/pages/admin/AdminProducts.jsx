import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Table, Button, Badge, Card, Alert, Spinner, Modal, Form, InputGroup, Row, Col, Tabs, Tab } from 'react-bootstrap';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [isAddingCategory, setIsAddingCategory] = useState(false);
  const [newCategoryName, setNewCategoryName] = useState("");
  const [suggestedTitles, setSuggestedTitles] = useState([]);

  // --- ESTADOS DE SUBIDA ---
  const [uploadingPrimary, setUploadingPrimary] = useState(false); // Para la principal
  const [uploadingGallery, setUploadingGallery] = useState(false); // Para la galería

  const [formData, setFormData] = useState({
      title: '', price: '', stock: '', category: '', image: '', description: '',
      specifications: [],
      gallery_images: [] // --- NUEVO: Lista para fotos extra ---
  });

  useEffect(() => { fetchData(); }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
        const { data: prodData } = await supabase.from('products').select('*').order('id', { ascending: true });
        const { data: catData } = await supabase.from('categories').select('*').order('name', { ascending: true });
        setProducts(prodData || []);
        setCategories(catData || []);
        const titlesSet = new Set();
        if (prodData) { prodData.forEach(p => { if (p.specifications) { p.specifications.forEach(spec => { if (spec.title) titlesSet.add(spec.title); }); }}); }
        setSuggestedTitles(Array.from(titlesSet).sort());
    } catch (error) { setErrorMsg("Error: " + error.message); } 
    finally { setLoading(false); }
  };

  // --- FUNCIÓN AUXILIAR PARA SUBIR UN SOLO ARCHIVO A SUPABASE ---
  const uploadFileToSupabase = async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
  };

  // 1. SUBIR IMAGEN PRINCIPAL (Reemplaza la actual)
  const handlePrimaryImageUpload = async (event) => {
    try {
      setUploadingPrimary(true);
      const file = event.target.files[0];
      if (!file) return;
      const publicUrl = await uploadFileToSupabase(file);
      setFormData(prev => ({ ...prev, image: publicUrl })); 
    } catch (error) { alert("Error: " + error.message); } 
    finally { setUploadingPrimary(false); }
  };

  // 2. SUBIR IMÁGENES DE GALERÍA (Múltiples a la vez)
  const handleGalleryUpload = async (event) => {
      try {
          setUploadingGallery(true);
          const files = Array.from(event.target.files); // Convertimos a array
          if (files.length === 0) return;

          const newUrls = [];
          // Subimos una por una
          for (const file of files) {
              const url = await uploadFileToSupabase(file);
              newUrls.push(url);
          }

          // Agregamos las nuevas URLs a la lista existente
          setFormData(prev => ({ 
              ...prev, 
              gallery_images: [...(prev.gallery_images || []), ...newUrls] 
          }));
          
      } catch (error) { alert("Error subiendo galería: " + error.message); }
      finally { setUploadingGallery(false); }
  };

  // 3. BORRAR UNA IMAGEN DE LA GALERÍA
  const removeGalleryImage = (indexToRemove) => {
      setFormData(prev => ({
          ...prev,
          gallery_images: prev.gallery_images.filter((_, index) => index !== indexToRemove)
      }));
  };

  // --- CATEGORÍAS Y UTILIDADES ---
  const saveNewCategory = async (nameToSave) => { /* ... Código de categoría igual que antes ... */
      const { data, error } = await supabase.from('categories').insert([{ name: nameToSave }]).select();
      if (error) throw error;
      const newCat = data[0];
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, category: newCat.name }));
      setIsAddingCategory(false); setNewCategoryName("");
      return newCat.name;
  };
  const handleAddCategoryClick = async () => { if (!newCategoryName.trim()) return; try { await saveNewCategory(newCategoryName); } catch (error) { alert("Error: " + error.message); }};

  // --- FICHA TÉCNICA ---
  const addSpec = () => { setFormData({ ...formData, specifications: [...(formData.specifications || []), { title: "", value: "", isCustom: false }] }); };
  const removeSpec = (index) => { setFormData({ ...formData, specifications: formData.specifications.filter((_, i) => i !== index) }); };
  const handleSpecChange = (index, field, text) => { /* ... Código igual ... */
      const newSpecs = formData.specifications.map((spec, i) => i === index ? { ...spec, [field]: text } : spec);
      setFormData({ ...formData, specifications: newSpecs });
  };
  const handleTitleSelect = (index, selectedValue) => { /* ... Código igual ... */
      const newSpecs = formData.specifications.map((spec, i) => i === index ? (selectedValue === "__NEW__" ? { ...spec, isCustom: true, title: "" } : { ...spec, isCustom: false, title: selectedValue }) : spec);
      setFormData({ ...formData, specifications: newSpecs });
  };
  const switchToSelect = (index) => { /* ... Código igual ... */
      const newSpecs = formData.specifications.map((spec, i) => i === index ? { ...spec, isCustom: false, title: "" } : spec);
      setFormData({ ...formData, specifications: newSpecs });
  };

  // --- OPEN MODAL ---
  const handleOpenModal = (product = null) => {
      setIsAddingCategory(false); setUploadingPrimary(false); setUploadingGallery(false); setNewCategoryName("");
      if (product) {
          setEditingProduct(product);
          // Preparamos specs y gallery
          const existingSpecs = (product.specifications || []).map(s => ({ ...s, isCustom: !suggestedTitles.includes(s.title) }));
          setFormData({ 
              title: product.title || '', price: product.price || '', stock: product.stock || '', category: product.category || '', image: product.image || '', description: product.description || '',
              specifications: existingSpecs,
              gallery_images: product.gallery_images || [] // Cargar galería existente
          });
      } else {
          setEditingProduct(null);
          setFormData({ title: '', price: '', stock: '', category: categories[0]?.name || '', image: '', description: '', specifications: [], gallery_images: [] });
      }
      setShowModal(true);
  };

  // --- SAVE ---
  const handleSave = async () => {
      if (uploadingPrimary || uploadingGallery) return alert("Espera a que terminen de subir las imágenes.");
      try {
          let finalCategory = formData.category;
          if (isAddingCategory && newCategoryName.trim()) finalCategory = await saveNewCategory(newCategoryName);
          else if (isAddingCategory) setIsAddingCategory(false);

          const cleanSpecs = (formData.specifications || []).filter(item => item.title.trim() !== "" || item.value.trim() !== "").map(({ title, value }) => ({ title, value }));
          
          // Aseguramos que gallery sea un array limpio
          const cleanGallery = Array.isArray(formData.gallery_images) ? formData.gallery_images : [];

          const dataToSave = { ...formData, category: finalCategory, specifications: cleanSpecs, gallery_images: cleanGallery };

          if (editingProduct) { await supabase.from('products').update(dataToSave).eq('id', editingProduct.id); } 
          else { await supabase.from('products').insert([dataToSave]); }
          setShowModal(false); fetchData(); alert("¡Guardado exitosamente!");
      } catch (error) { console.error(error); alert("Error: " + error.message); }
  };

  const handleDelete = async (id) => { if (window.confirm("¿Eliminar?")) { await supabase.from('products').delete().eq('id', id); fetchData(); }};
  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

  return (
    <div>
      {/* ... (La tabla de productos se mantiene igual, omitida para ahorrar espacio) ... */}
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-secondary">Inventario</h2>
        <Button variant="dark" onClick={() => handleOpenModal(null)}>+ Nuevo Producto</Button>
      </div>
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}
      <Card className="shadow-sm border-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light border-bottom"><tr><th className="py-3 ps-4">Producto</th><th>Categoría</th><th>Precio</th><th>Stock</th><th className="text-end pe-4">Acciones</th></tr></thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="ps-4"><div className="d-flex align-items-center"><img src={p.image || "https://via.placeholder.com/40"} alt="" style={{width:40, height:40, objectFit:'cover', borderRadius:4}} className="me-2 border"/><span className="fw-bold">{p.title}</span></div></td>
                <td><Badge bg="secondary" className="fw-normal">{p.category}</Badge></td><td>${p.price}</td><td><Badge bg={p.stock < 5 ? "danger" : "success"}>{p.stock}</Badge></td>
                <td className="text-end pe-4"><Button variant="link" size="sm" onClick={() => handleOpenModal(p)}>Editar</Button><Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(p.id)}>Eliminar</Button></td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>


      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
        <Modal.Header closeButton><Modal.Title>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title></Modal.Header>
        <Modal.Body>
          <Form>
            <Tabs defaultActiveKey="general" id="admin-tabs" className="mb-3">
                <Tab eventKey="general" title="Datos Generales">
                    <Row><Col md={8}><Form.Group className="mb-3"><Form.Label>Nombre</Form.Label><Form.Control type="text" value={formData.title} onChange={(e) => setFormData({...formData, title: e.target.value})} /></Form.Group></Col><Col md={4}><Form.Group className="mb-3"><Form.Label>Precio</Form.Label><Form.Control type="number" value={formData.price} onChange={(e) => setFormData({...formData, price: e.target.value})} /></Form.Group></Col></Row>
                    
                    {/* Categoría (Igual que antes) */}
                    <Form.Group className="mb-3">
                        <Form.Label>Categoría</Form.Label>
                        {!isAddingCategory ? (
                            <InputGroup>
                                <Form.Select value={formData.category} onChange={(e) => setFormData({...formData, category: e.target.value})}>
                                    <option value="">-- Seleccionar --</option>
                                    {categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}
                                </Form.Select>
                                <Button variant="outline-primary" onClick={() => setIsAddingCategory(true)}>+ Nueva</Button>
                            </InputGroup>
                        ) : (
                            <InputGroup><Form.Control type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus /><Button variant="success" onClick={handleAddCategoryClick}>Guardar</Button><Button variant="outline-secondary" onClick={() => setIsAddingCategory(false)}>X</Button></InputGroup>
                        )}
                    </Form.Group>

                    <Row><Col><Form.Group className="mb-3"><Form.Label>Stock</Form.Label><Form.Control type="number" value={formData.stock} onChange={(e) => setFormData({...formData, stock: e.target.value})} /></Form.Group></Col></Row>
                    
                    {/* --- SECCIÓN DE IMÁGENES (MODIFICADA) --- */}
                    <div className="border rounded p-3 mb-3 bg-light">
                        <h6 className="text-muted mb-3">Imágenes del Producto</h6>
                        
                        {/* 1. IMAGEN PRINCIPAL */}
                        <Row className="mb-4">
                            <Col md={12}>
                                <Form.Label className="fw-bold">Foto Principal (Portada)</Form.Label>
                                <Form.Control type="file" onChange={handlePrimaryImageUpload} disabled={uploadingPrimary || uploadingGallery} className="mb-2"/>
                                {uploadingPrimary && <small className="text-primary">Subiendo portada...</small>}
                                {formData.image && (
                                    <div className="mt-2 p-2 border bg-white rounded" style={{width: 'fit-content'}}>
                                        <img src={formData.image} alt="Principal" style={{height: 100, objectFit: 'cover'}} />
                                    </div>
                                )}
                            </Col>
                        </Row>
                        
                        <hr />

                        {/* 2. GALERÍA DE IMÁGENES (Múltiple) */}
                        <Row>
                            <Col md={12}>
                                <Form.Label className="fw-bold">Galería (Carrusel) - Puedes seleccionar varias</Form.Label>
                                {/* NOTA EL ATRIBUTO 'multiple' AQUÍ */}
                                <Form.Control type="file" multiple onChange={handleGalleryUpload} disabled={uploadingPrimary || uploadingGallery} className="mb-2"/>
                                
                                {uploadingGallery && <div className="text-primary mb-2"><Spinner size="sm" animation="border"/> Subiendo imágenes a la galería... (Puede tardar)</div>}
                                
                                {/* Vista previa de las miniaturas de la galería */}
                                {formData.gallery_images && formData.gallery_images.length > 0 ? (
                                    <div className="d-flex flex-wrap gap-2 mt-2 bg-white p-2 border rounded">
                                        {formData.gallery_images.map((url, index) => (
                                            <div key={index} className="position-relative" style={{width: 80, height: 80}}>
                                                <img src={url} alt={`Galeria ${index}`} style={{width:'100%', height:'100%', objectFit: 'cover', borderRadius: 4}} className="border" />
                                                <Button 
                                                    variant="danger" size="sm" 
                                                    className="position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center"
                                                    style={{width: 20, height: 20, borderRadius: '50%', transform: 'translate(30%, -30%)'}}
                                                    onClick={() => removeGalleryImage(index)}
                                                >
                                                    <span style={{fontSize: '0.7rem', marginTop: -2}}>×</span>
                                                </Button>
                                            </div>
                                        ))}
                                    </div>
                                ) : (
                                    <small className="text-muted d-block mt-2">No hay imágenes adicionales en la galería.</small>
                                )}
                            </Col>
                        </Row>
                    </div>
                    {/* ------------------------------------------ */}

                    <Form.Group className="mb-3"><Form.Label>Descripción Corta</Form.Label><Form.Control as="textarea" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></Form.Group>
                </Tab>

                {/* Ficha Técnica (Se mantiene igual, omitida por brevedad) */}
                <Tab eventKey="specs" title="Ficha Técnica">
                    <div className="bg-light p-3 rounded border">
                        <div className="d-flex justify-content-between align-items-center mb-3"><h6 className="m-0 text-muted">Características Técnicas</h6><Button variant="outline-primary" size="sm" onClick={addSpec}>+ Agregar Fila</Button></div>
                        {formData.specifications && formData.specifications.map((spec, index) => (
                            <Row key={index} className="mb-2 g-2 align-items-center">
                                <Col xs={5}>{!spec.isCustom ? (<Form.Select value={spec.title} onChange={(e) => handleTitleSelect(index, e.target.value)} className="fw-bold"><option value="">-- Seleccionar --</option>{suggestedTitles.map((t, i) => (<option key={i} value={t}>{t}</option>))}<option value="__NEW__" className="text-primary fw-bold">+ Crear nuevo...</option></Form.Select>) : (<InputGroup><Form.Control type="text" value={spec.title} onChange={(e) => handleSpecChange(index, 'title', e.target.value)} autoFocus className="fw-bold border-primary" /><Button variant="outline-secondary" onClick={() => switchToSelect(index)}>↩</Button></InputGroup>)}</Col>
                                <Col xs={6}><Form.Control type="text" placeholder="Valor" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} /></Col>
                                <Col xs={1} className="text-end"><Button variant="outline-danger" size="sm" onClick={() => removeSpec(index)}>×</Button></Col>
                            </Row>
                        ))}
                    </div>
                </Tab>
            </Tabs>
          </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave} disabled={uploadingPrimary || uploadingGallery}>Guardar Todo</Button></Modal.Footer>
      </Modal>
    </div>
  );
}