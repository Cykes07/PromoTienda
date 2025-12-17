import React, { useEffect, useState } from 'react';
import { supabase } from '../../supabaseClient';
import { Table, Button, Badge, Card, Alert, Spinner, Modal, Form } from 'react-bootstrap';

export function AdminProducts() {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [errorMsg, setErrorMsg] = useState(null);

  // Estados para el Modal (Ventana emergente)
  const [showModal, setShowModal] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null); // Si es null, estamos creando. Si tiene datos, editamos.
  const [formData, setFormData] = useState({
      title: '', price: '', stock: '', category: '', image: '', description: ''
  });

  useEffect(() => {
    fetchProducts();
  }, []);

  const fetchProducts = async () => {
    setLoading(true);
    const { data, error } = await supabase.from('products').select('*').order('id', { ascending: true });
    if (error) setErrorMsg("Error cargando productos");
    else setProducts(data || []);
    setLoading(false);
  };

  // 1. ABRIR EL MODAL (Para crear o editar)
  const handleOpenModal = (product = null) => {
      if (product) {
          // MODO EDITAR: Llenamos el formulario con los datos existentes
          setEditingProduct(product);
          setFormData({ 
              title: product.title, 
              price: product.price, 
              stock: product.stock, 
              category: product.category || '', 
              image: product.image || '', 
              description: product.description || ''
          });
      } else {
          // MODO CREAR: Formulario vacío
          setEditingProduct(null);
          setFormData({ title: '', price: '', stock: '', category: '', image: '', description: '' });
      }
      setShowModal(true);
  };

  // 2. GUARDAR CAMBIOS (Conexión a Base de Datos)
  const handleSave = async () => {
      try {
          if (editingProduct) {
              // ACTUALIZAR (UPDATE)
              const { error } = await supabase
                  .from('products')
                  .update(formData)
                  .eq('id', editingProduct.id);
              if (error) throw error;
          } else {
              // CREAR NUEVO (INSERT)
              const { error } = await supabase
                  .from('products')
                  .insert([formData]);
              if (error) throw error;
          }

          setShowModal(false);
          fetchProducts(); // Recargamos la lista para ver los cambios
          alert("¡Guardado exitosamente!");
      } catch (error) {
          alert("Error al guardar: " + error.message);
      }
  };

  // 3. ELIMINAR PRODUCTO
  const handleDelete = async (id) => {
      if (window.confirm("¿Seguro que quieres eliminar este producto?")) {
          const { error } = await supabase.from('products').delete().eq('id', id);
          if (!error) fetchProducts();
      }
  };

  if (loading) return <div className="text-center p-5"><Spinner animation="border" /></div>;

  return (
    <div>
      <div className="d-flex justify-content-between align-items-center mb-4">
        <h2 className="mb-0 fw-bold text-secondary">Inventario</h2>
        <Button variant="dark" onClick={() => handleOpenModal(null)}>
            + Nuevo Producto
        </Button>
      </div>

      {errorMsg && <Alert variant="danger">{errorMsg}</Alert>}

      <Card className="shadow-sm border-0">
        <Table responsive hover className="mb-0 align-middle">
          <thead className="bg-light border-bottom">
            <tr>
              <th className="py-3 ps-4">Producto</th>
              <th>Precio</th>
              <th>Stock</th>
              <th className="text-end pe-4">Acciones</th>
            </tr>
          </thead>
          <tbody>
            {products.map((p) => (
              <tr key={p.id}>
                <td className="ps-4">
                    <div className="fw-bold">{p.title}</div>
                </td>
                <td>${p.price}</td>
                <td><Badge bg={p.stock < 5 ? "danger" : "success"}>{p.stock}</Badge></td>
                <td className="text-end pe-4">
                    <Button variant="link" size="sm" onClick={() => handleOpenModal(p)}>Editar</Button>
                    <Button variant="link" size="sm" className="text-danger" onClick={() => handleDelete(p.id)}>Eliminar</Button>
                </td>
              </tr>
            ))}
          </tbody>
        </Table>
      </Card>

      {/* --- EL MODAL (FORMULARIO EMERGENTE) --- */}
      <Modal show={showModal} onHide={() => setShowModal(false)}>
        <Modal.Header closeButton>
          <Modal.Title>{editingProduct ? 'Editar Producto' : 'Nuevo Producto'}</Modal.Title>
        </Modal.Header>
        <Modal.Body>
          <Form>
            <Form.Group className="mb-3">
                <Form.Label>Nombre del Producto</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.title} 
                    onChange={(e) => setFormData({...formData, title: e.target.value})} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Precio</Form.Label>
                <Form.Control 
                    type="number" 
                    value={formData.price} 
                    onChange={(e) => setFormData({...formData, price: e.target.value})} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Stock</Form.Label>
                <Form.Control 
                    type="number" 
                    value={formData.stock} 
                    onChange={(e) => setFormData({...formData, stock: e.target.value})} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Categoría</Form.Label>
                <Form.Control 
                    type="text" 
                    value={formData.category} 
                    onChange={(e) => setFormData({...formData, category: e.target.value})} 
                />
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>URL de Imagen</Form.Label>
                <Form.Control 
                    type="text" 
                    placeholder="https://..."
                    value={formData.image} 
                    onChange={(e) => setFormData({...formData, image: e.target.value})} 
                />
                <Form.Text className="text-muted">Por ahora, pega el link de una imagen de internet.</Form.Text>
            </Form.Group>
            <Form.Group className="mb-3">
                <Form.Label>Descripción</Form.Label>
                <Form.Control 
                    as="textarea" 
                    rows={3}
                    value={formData.description} 
                    onChange={(e) => setFormData({...formData, description: e.target.value})} 
                />
            </Form.Group>
          </Form>
        </Modal.Body>
        <Modal.Footer>
          <Button variant="secondary" onClick={() => setShowModal(false)}>Cancelar</Button>
          <Button variant="primary" onClick={handleSave}>Guardar Cambios</Button>
        </Modal.Footer>
      </Modal>
    </div>
  );
}