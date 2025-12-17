import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { supabase } from '../../supabaseClient'; 

export function AdminHome() {
    // 1. Agregamos 'visits' al estado inicial
    const [stats, setStats] = useState({ products: 0, lowStock: 0, visits: 0 });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function loadStats() {
            try {
                // A. Contamos los productos
                const { count: prodCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true });
                
                // B. Contamos stock bajo (< 5)
                const { count: stockCount } = await supabase
                    .from('products')
                    .select('*', { count: 'exact', head: true })
                    .lt('stock', 5);

                // C. Contamos las VISITAS REALES (Nueva tabla)
                // Si aún no creas la tabla en SQL, esto dará error, por eso el try/catch
                const { count: visitCount, error } = await supabase
                    .from('visits')
                    .select('*', { count: 'exact', head: true });

                if (error && error.code !== 'PGRST116') {
                    console.error("Error cargando visitas (quizás falta la tabla):", error);
                }

                setStats({ 
                    products: prodCount || 0, 
                    lowStock: stockCount || 0,
                    visits: visitCount || 0  // Guardamos el dato real
                });

            } catch (error) {
                console.error("Error general:", error);
            } finally {
                setLoading(false);
            }
        }
        loadStats();
    }, []);

    if (loading) return <div className="p-5 text-center"><Spinner animation="border" /></div>;

  return (
    <div>
      <h2 className="mb-4 text-secondary fw-bold">Resumen del Negocio</h2>
      <Row>
        {/* Productos Totales */}
        <Col md={3} className="mb-3">
            <Card className="bg-primary text-white p-3 shadow-sm text-center h-100 border-0">
                <h1 className="fw-bold display-4">{stats.products}</h1>
                <h6 className="text-uppercase opacity-75">Total Productos</h6>
            </Card>
        </Col>

        {/* Stock Crítico */}
        <Col md={3} className="mb-3">
            <Card className="bg-danger text-white p-3 shadow-sm text-center h-100 border-0">
                <h1 className="fw-bold display-4">{stats.lowStock}</h1>
                <h6 className="text-uppercase opacity-75">Stock Crítico</h6>
            </Card>
        </Col>

        {/* Visitas REALES */}
        <Col md={3} className="mb-3">
            <Card className="bg-success text-white p-3 shadow-sm text-center h-100 border-0">
                {/* Aquí mostramos el dato real de la BD */}
                <h1 className="fw-bold display-4">{stats.visits}</h1>
                <h6 className="text-uppercase opacity-75">Visitas Totales</h6>
            </Card>
        </Col>

        {/* Usuarios (Por ahora lo dejamos fijo o podemos contar la tabla users si quieres) */}
        <Col md={3} className="mb-3">
            <Card className="bg-info text-white p-3 shadow-sm text-center h-100 border-0">
                <h1 className="fw-bold display-4">--</h1>
                <h6 className="text-uppercase opacity-75">Usuarios (Pronto)</h6>
            </Card>
        </Col>
      </Row>
    </div>
  );
}