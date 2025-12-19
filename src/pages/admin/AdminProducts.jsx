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
  const [filtroNombre, setFiltroNombre] = useState('');
  const [filtroCategoria, setFiltroCategoria] = useState('Todas');
  const [ordenarPor, setOrdenarPor] = useState('defecto');
  const [limiteCritico, setLimiteCritico] = useState(5);

  // Estados de subida
  const [uploadingPrimary, setUploadingPrimary] = useState(false);
  const [uploadingGallery, setUploadingGallery] = useState(false);

  // --- ESTADO PARA ERRORES DE VALIDACIÓN ---
  const [errors, setErrors] = useState({}); 

  // --- ESTADO PARA VERIFICACIÓN DE SKU ---
  const [skuCheckStatus, setSkuCheckStatus] = useState(null);
  const [skuCheckMsg, setSkuCheckMsg] = useState("");

  const [formData, setFormData] = useState({
      title: '', price: '', stock: '', category: '', image: '', description: '',
      product_code: '', 
      specifications: [],
      gallery_images: []
  });

  useEffect(() => { fetchData(); 
    fetchSettings();
  }, []);

  const fetchSettings = async () => {
    // Leemos la configuración de la fila 1
    const { data, error } = await supabase
        .from('app_settings')
        .select('critical_stock_limit')
        .eq('id', 1)
        .single();
    
    if (data) {
        setLimiteCritico(data.critical_stock_limit);
    }
};

    // FUNCIÓN PARA GUARDAR EN LA BD (Se ejecutará al soltar la casilla)
    const saveCriticalLimit = async () => {
        const { error } = await supabase
            .from('app_settings')
            .update({ critical_stock_limit: limiteCritico })
            .eq('id', 1);

        if (error) alert("Error guardando config: " + error.message);
        else console.log("Límite crítico guardado en la nube");
    };

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

  const uploadFileToSupabase = async (file) => {
      const fileExt = file.name.split('.').pop();
      const fileName = `${Date.now()}-${Math.random().toString(36).substring(2)}.${fileExt}`;
      const filePath = `${fileName}`;
      const { error: uploadError } = await supabase.storage.from('images').upload(filePath, file);
      if (uploadError) throw uploadError;
      const { data } = supabase.storage.from('images').getPublicUrl(filePath);
      return data.publicUrl;
  };

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

  const handleGalleryUpload = async (event) => {
      try {
          setUploadingGallery(true);
          const files = Array.from(event.target.files);
          if (files.length === 0) return;
          const newUrls = [];
          for (const file of files) {
              const url = await uploadFileToSupabase(file);
              newUrls.push(url);
          }
          setFormData(prev => ({ ...prev, gallery_images: [...(prev.gallery_images || []), ...newUrls] }));
      } catch (error) { alert("Error subiendo galería: " + error.message); }
      finally { setUploadingGallery(false); }
  };

  const removeGalleryImage = (indexToRemove) => {
      setFormData(prev => ({ ...prev, gallery_images: prev.gallery_images.filter((_, index) => index !== indexToRemove) }));
  };

  const validateForm = () => {
      const newErrors = {};
      if (!formData.title || !formData.title.trim()) newErrors.title = "El nombre del producto es obligatorio.";
      if (!formData.price || formData.price <= 0) newErrors.price = "Ingresa un precio válido.";
      if (formData.stock === "" || formData.stock < 0) newErrors.stock = "El stock no puede estar vacío.";
      if (!formData.category && !isAddingCategory) newErrors.category = "Selecciona una categoría.";
      if (!formData.product_code || !formData.product_code.trim()) newErrors.product_code = "El Código SKU es obligatorio para sincronizar.";
      setErrors(newErrors);
      return Object.keys(newErrors).length === 0;
  };

  const saveNewCategory = async (nameToSave) => {
      const { data, error } = await supabase.from('categories').insert([{ name: nameToSave }]).select();
      if (error) throw error;
      const newCat = data[0];
      setCategories(prev => [...prev, newCat]);
      setFormData(prev => ({ ...prev, category: newCat.name }));
      setIsAddingCategory(false); setNewCategoryName("");
      return newCat.name;
  };

  const handleAddCategoryClick = async () => { if (!newCategoryName.trim()) return; try { await saveNewCategory(newCategoryName); } catch (error) { alert("Error: " + error.message); }};

  // Ficha Técnica
  const addSpec = () => { setFormData({ ...formData, specifications: [...(formData.specifications || []), { title: "", value: "", isCustom: false }] }); };
  const removeSpec = (index) => { setFormData({ ...formData, specifications: formData.specifications.filter((_, i) => i !== index) }); };
  const handleSpecChange = (index, field, text) => { 
      const newSpecs = formData.specifications.map((spec, i) => i === index ? { ...spec, [field]: text } : spec);
      setFormData({ ...formData, specifications: newSpecs });
  };
  const handleTitleSelect = (index, selectedValue) => { 
      const newSpecs = formData.specifications.map((spec, i) => i === index ? (selectedValue === "__NEW__" ? { ...spec, isCustom: true, title: "" } : { ...spec, isCustom: false, title: selectedValue }) : spec);
      setFormData({ ...formData, specifications: newSpecs });
  };
  const switchToSelect = (index) => { 
      const newSpecs = formData.specifications.map((spec, i) => i === index ? { ...spec, isCustom: false, title: "" } : spec);
      setFormData({ ...formData, specifications: newSpecs });
  };

  const checkSku = async () => {
    const code = formData.product_code;
    if (!code) return alert("Escribe un código primero.");
    
    setSkuCheckStatus('loading');
    
    const { data, error } = await supabase
        .from('local_products_ref')
        .select('*')
        .eq('code', code)
        .single();

    if (error || !data) { 
        setSkuCheckStatus('error'); 
        setSkuCheckMsg("Esta incorrecto o no existe en la base de datos."); 
    } else { 
        setSkuCheckStatus('success'); 
        setSkuCheckMsg(`  Se encontro: "${data.name}"`);
        setFormData(prev => ({ 
            ...prev, 
            stock: data.stock 
        }));

        if (errors.stock) setErrors({...errors, stock: null});
        }
    };

  const handleOpenModal = (product = null) => {
      setIsAddingCategory(false); setUploadingPrimary(false); setUploadingGallery(false); setNewCategoryName("");
      setErrors({}); 
      setSkuCheckStatus(null); setSkuCheckMsg("");

      if (product) {
          setEditingProduct(product);
          const existingSpecs = (product.specifications || []).map(s => ({ ...s, isCustom: !suggestedTitles.includes(s.title) }));
          setFormData({ 
              title: product.title || '', price: product.price || '', stock: product.stock || '', category: product.category || '', image: product.image || '', description: product.description || '',
              product_code: product.product_code || '',
              specifications: existingSpecs,
              gallery_images: product.gallery_images || []
          });
      } else {
          setEditingProduct(null);
          setFormData({ title: '', price: '', stock: '', category: categories[0]?.name || '', image: '', description: '', product_code: '', specifications: [], gallery_images: [] });
      }
      setShowModal(true);
  };

  const handleSave = async () => {
      if (uploadingPrimary || uploadingGallery) return alert("Espera a que terminen de subir las imágenes.");

      if (!validateForm()) {
          alert("Faltan datos importantes.");
          return; 
      }

      try {
          let finalCategory = formData.category;
          if (isAddingCategory && newCategoryName.trim()) finalCategory = await saveNewCategory(newCategoryName);
          else if (isAddingCategory) setIsAddingCategory(false);

          const cleanSpecs = (formData.specifications || []).filter(item => item.title.trim() !== "" || item.value.trim() !== "").map(({ title, value }) => ({ title, value }));
          const cleanGallery = Array.isArray(formData.gallery_images) ? formData.gallery_images : [];

          const dataToSave = { ...formData, category: finalCategory, specifications: cleanSpecs, gallery_images: cleanGallery };

          if (editingProduct) { await supabase.from('products').update(dataToSave).eq('id', editingProduct.id); } 
          else { await supabase.from('products').insert([dataToSave]); }
          
          setShowModal(false); 
          fetchData(); 
          alert("¡Guardado exitosamente!");
      } catch (error) { console.error(error); alert("Error: " + error.message); }
  };

  const handleDelete = async (id) => { if (window.confirm("¿Eliminar?")) { await supabase.from('products').delete().eq('id', id); fetchData(); }};
  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

  const categoriasUnicas = ['Todas', ...new Set(products.map(p => p.category).filter(Boolean))];

  const productosFiltrados = products.filter(producto => {
      const termino = filtroNombre.toLowerCase();
      const coincideNombre = producto.title?.toLowerCase().includes(termino) || 
                             producto.product_code?.toLowerCase().includes(termino);
      const coincideCategoria = filtroCategoria === 'Todas' || producto.category === filtroCategoria;

      return coincideNombre && coincideCategoria;
  }).sort((a, b) => {
      if (ordenarPor === 'precio-menor') return (a.price || 0) - (b.price || 0);
      if (ordenarPor === 'precio-mayor') return (b.price || 0) - (a.price || 0);
      if (ordenarPor === 'stock-menor') return (a.stock || 0) - (b.stock || 0); 
      if (ordenarPor === 'stock-mayor') return (b.stock || 0) - (a.stock || 0);
      return 0; 
  });
    return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-secondary">Inventario</h2>
        <Button variant="dark" onClick={() => handleOpenModal(null)}>+ Nuevo Producto</Button>
      </div>
      
      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      {/* --- BARRA DE HERRAMIENTAS --- */}
      <Card className="mb-4 shadow-sm border-0 bg-light">
        <Card.Body>
            <Row className="g-2 align-items-end">
                {/* BUSCADOR */}
                <Col md={4}>
                    <Form.Label className="small text-muted mb-1">Buscar</Form.Label>
                    <InputGroup>
                        
                        <Form.Control 
                            type="text" 
                            placeholder="Nombre o SKU..." 
                            value={filtroNombre}
                            onChange={(e) => setFiltroNombre(e.target.value)}
                            className="border-start-0"
                        />
                    </InputGroup>
                </Col>

                {/* FILTRO CATEGORÍA */}
                <Col md={3}>
                    <Form.Label className="small text-muted mb-1">Categoría</Form.Label>
                    <Form.Select 
                        value={filtroCategoria} 
                        onChange={(e) => setFiltroCategoria(e.target.value)}
                    >
                        {categoriasUnicas.map(cat => (
                            <option key={cat} value={cat}>{cat}</option>
                        ))}
                    </Form.Select>
                </Col>

                {/* ORDENAR */}
                <Col md={3}>
                    <Form.Label className="small text-muted mb-1">Ordenar por</Form.Label>
                    <Form.Select 
                        value={ordenarPor} 
                        onChange={(e) => setOrdenarPor(e.target.value)}
                    >
                        <option value="defecto">Defecto</option>
                        <option value="precio-menor">Precio Menor a Mayor</option>
                        <option value="precio-mayor">Precio Mayor a Menor</option>
                        <option value="stock-menor">Stock Menos Stock</option>
                        <option value="stock-mayor">Stock Más Stock</option>
                    </Form.Select>
                </Col>

                {/*CONFIGURADOR DE ALERTA CRÍTICA */}
                <Col md={2}>
                    <Form.Label className="small text-danger fw-bold mb-1" title="Se guarda automáticamente">
                        Limite de Critico Stock:
                    </Form.Label>
                    <Form.Control 
                        type="number" 
                        min="1"
                        value={limiteCritico} 
                        onChange={(e) => setLimiteCritico(Number(e.target.value))}
                        onBlur={saveCriticalLimit} 
                        className=" text-center fw-bold"
                    />
                </Col>
            </Row>
        </Card.Body>
      </Card>

      {/* --- TABLA DE PRODUCTOS --- */}
      <Card className="shadow-sm border-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light border-bottom">
            <tr>
                <th className="py-3 ps-4">Producto</th>
                <th>SKU</th>
                <th>Categoría</th>
                <th>Precio</th>
                <th>Stock</th>
                <th className="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {productosFiltrados.length > 0 ? (
                productosFiltrados.map((p) => {
                    let badgeBg = "success"; 
                    let badgeText = "white";
                    
                    if (p.stock <= 0) {
                        badgeBg = "danger"; 
                    } else if (p.stock <= limiteCritico) {
                        badgeBg = "warning";
                        badgeText = "dark";  
                    }

                    return (
                        <tr key={p.id}>
                            <td className="ps-4">
                                <div className="d-flex align-items-center">
                                    <img src={p.image || "https://via.placeholder.com/40"} alt="" style={{width:40, height:40, objectFit:'cover', borderRadius:4}} className="me-2 border"/>
                                    <span className="fw-bold">{p.title}</span>
                                </div>
                            </td>
                            <td><small className="text-muted font-monospace">{p.product_code || '-'}</small></td>
                            <td><Badge bg="secondary" className="fw-normal">{p.category}</Badge></td>
                            <td>${p.price}</td>
                            <td>
                                {/* Aquí aplicamos el color calculado arriba */}
                                <Badge bg={badgeBg} text={badgeText} style={{fontSize: '0.9em'}}>
                                    {p.stock}
                                </Badge>
                            </td>
                            <td className="text-end pe-4">
                                <Button variant="link" size="sm" onClick={() => handleOpenModal(p)}>Editar</Button>
                                <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(p.id)}>Eliminar</Button>
                            </td>
                        </tr>
                    );
                })
            ) : (
                <tr>
                    <td colSpan="6" className="text-center py-5 text-muted">
                        No se encontraron productos 🕵️‍♂️
                    </td>
                </tr>
            )}
          </tbody>
        </Table>
      </Card>

      <Modal show={showModal} onHide={() => setShowModal(false)} size="lg" backdrop="static">
         <Modal.Header closeButton><Modal.Title>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title></Modal.Header>
        <Modal.Body>
            <Form>
               <Tabs defaultActiveKey="general" id="admin-tabs" className="mb-3">
                   <Tab eventKey="general" title="Datos Generales">
                       <Row>
                           <Col md={8}>
                               <Form.Group className="mb-3">
                                   <Form.Label>Nombre <span className="text-danger">*</span></Form.Label>
                                   <Form.Control type="text" value={formData.title} onChange={(e) => {setFormData({...formData, title: e.target.value}); if (errors.title) setErrors({...errors, title: null});}} isInvalid={!!errors.title} />
                                   <Form.Control.Feedback type="invalid">{errors.title}</Form.Control.Feedback>
                               </Form.Group>
                           </Col>
                           <Col md={4}>
                               <Form.Group className="mb-3">
                                   <Form.Label>Precio <span className="text-danger">*</span></Form.Label>
                                   <Form.Control type="number" value={formData.price} onChange={(e) => {setFormData({...formData, price: e.target.value}); if (errors.price) setErrors({...errors, price: null});}} isInvalid={!!errors.price} />
                                   <Form.Control.Feedback type="invalid">{errors.price}</Form.Control.Feedback>
                               </Form.Group>
                           </Col>
                       </Row>
                       <Row>
                           <Col md={6}>
                               <Form.Group className="mb-3">
                                   <Form.Label>Código Interno (SKU) <span className="text-danger">*</span></Form.Label>
                                   <InputGroup hasValidation>
                                       <Form.Control type="text" placeholder="Ej: POR-001" value={formData.product_code} onChange={(e) => { setFormData({...formData, product_code: e.target.value}); setSkuCheckStatus(null); setSkuCheckMsg(""); if (errors.product_code) setErrors({...errors, product_code: null});}} className={skuCheckStatus === 'success' ? 'border-success' : skuCheckStatus === 'error' ? 'border-danger' : ''} isInvalid={!!errors.product_code}/>
                                       <Button variant={skuCheckStatus === 'success' ? "success" : "outline-secondary"} onClick={checkSku} disabled={skuCheckStatus === 'loading'}>{skuCheckStatus === 'loading' ? <Spinner size="sm" animation="border"/> : 'Verificar'}</Button>
                                       <Form.Control.Feedback type="invalid">{errors.product_code}</Form.Control.Feedback>
                                   </InputGroup>
                                   {skuCheckMsg && <Form.Text className={skuCheckStatus === 'success' ? "text-success fw-bold" : "text-danger fw-bold"}>{skuCheckMsg}</Form.Text>}
                               </Form.Group>
                           </Col>
                           <Col md={6}>
                               <Form.Group className="mb-3">
                                   <Form.Label>Stock Inicial <span className="text-danger">*</span></Form.Label>
                                   <Form.Control type="number" value={formData.stock} onChange={(e) => {setFormData({...formData, stock: e.target.value}); if (errors.stock) setErrors({...errors, stock: null});}} isInvalid={!!errors.stock}/>
                                   <Form.Control.Feedback type="invalid">{errors.stock}</Form.Control.Feedback>
                               </Form.Group>
                           </Col>
                       </Row>
                       <Form.Group className="mb-3">
                           <Form.Label>Categoría <span className="text-danger">*</span></Form.Label>
                           {!isAddingCategory ? (<InputGroup hasValidation><Form.Select value={formData.category} onChange={(e) => {setFormData({...formData, category: e.target.value}); if (errors.category) setErrors({...errors, category: null});}} isInvalid={!!errors.category}><option value="">-- Seleccionar --</option>{categories.map(cat => <option key={cat.id} value={cat.name}>{cat.name}</option>)}</Form.Select><Button variant="outline-primary" onClick={() => setIsAddingCategory(true)}>+ Nueva</Button><Form.Control.Feedback type="invalid">{errors.category}</Form.Control.Feedback></InputGroup>) : (<InputGroup><Form.Control type="text" value={newCategoryName} onChange={(e) => setNewCategoryName(e.target.value)} autoFocus placeholder="Nombre nueva categoría..." /><Button variant="success" onClick={handleAddCategoryClick}>Guardar</Button><Button variant="outline-secondary" onClick={() => setIsAddingCategory(false)}>X</Button></InputGroup>)}
                       </Form.Group>
                       <div className="border rounded p-3 mb-3 bg-light">
                           <h6 className="text-muted mb-3">Imágenes del Producto</h6>
                           <Row className="mb-4"><Col md={12}><Form.Label className="fw-bold">Foto Principal</Form.Label><Form.Control type="file" onChange={handlePrimaryImageUpload} disabled={uploadingPrimary || uploadingGallery} className="mb-2"/>{uploadingPrimary && <small className="text-primary">Subiendo portada...</small>}{formData.image && (<div className="mt-2 p-2 border bg-white rounded" style={{width: 'fit-content'}}><img src={formData.image} alt="Principal" style={{height: 100, objectFit: 'cover'}} /></div>)}</Col></Row><hr /><Row><Col md={12}><Form.Label className="fw-bold">Galería (Carrusel)</Form.Label><Form.Control type="file" multiple onChange={handleGalleryUpload} disabled={uploadingPrimary || uploadingGallery} className="mb-2"/>{uploadingGallery && <div className="text-primary mb-2"><Spinner size="sm" animation="border"/> Subiendo imágenes...</div>}{formData.gallery_images && formData.gallery_images.length > 0 && (<div className="d-flex flex-wrap gap-2 mt-2 bg-white p-2 border rounded">{formData.gallery_images.map((url, index) => (<div key={index} className="position-relative" style={{width: 80, height: 80}}><img src={url} alt={`Galeria ${index}`} style={{width:'100%', height:'100%', objectFit: 'cover', borderRadius: 4}} className="border" /><Button variant="danger" size="sm" className="position-absolute top-0 end-0 p-0 d-flex align-items-center justify-content-center" style={{width: 20, height: 20, borderRadius: '50%', transform: 'translate(30%, -30%)'}} onClick={() => removeGalleryImage(index)}><span>×</span></Button></div>))}</div>)}</Col></Row>
                       </div>
                       <Form.Group className="mb-3"><Form.Label>Descripción Corta</Form.Label><Form.Control as="textarea" rows={2} value={formData.description} onChange={(e) => setFormData({...formData, description: e.target.value})} /></Form.Group>
                   </Tab>
                   <Tab eventKey="specs" title="Ficha Técnica">
                       <div className="bg-light p-3 rounded border"><div className="d-flex justify-content-between align-items-center mb-3"><h6 className="m-0 text-muted">Características Técnicas</h6><Button variant="outline-primary" size="sm" onClick={addSpec}>+ Agregar Fila</Button></div>{formData.specifications && formData.specifications.map((spec, index) => (<Row key={index} className="mb-2 g-2 align-items-center"><Col xs={5}>{!spec.isCustom ? (<Form.Select value={spec.title} onChange={(e) => handleTitleSelect(index, e.target.value)} className="fw-bold"><option value="">-- Seleccionar --</option>{suggestedTitles.map((t, i) => (<option key={i} value={t}>{t}</option>))}<option value="__NEW__" className="text-primary fw-bold">+ Crear nuevo...</option></Form.Select>) : (<InputGroup><Form.Control type="text" value={spec.title} onChange={(e) => handleSpecChange(index, 'title', e.target.value)} autoFocus className="fw-bold border-primary" /><Button variant="outline-secondary" onClick={() => switchToSelect(index)}>↩</Button></InputGroup>)}</Col><Col xs={6}><Form.Control type="text" placeholder="Valor" value={spec.value} onChange={(e) => handleSpecChange(index, 'value', e.target.value)} /></Col><Col xs={1} className="text-end"><Button variant="outline-danger" size="sm" onClick={() => removeSpec(index)}>×</Button></Col></Row>))}</div>
                   </Tab>
               </Tabs>
            </Form>
        </Modal.Body>
        <Modal.Footer><Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button><Button variant="primary" onClick={handleSave} disabled={uploadingPrimary || uploadingGallery}>Guardar Todo</Button></Modal.Footer>
      </Modal>
    </div>
  );
}