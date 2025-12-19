import React, { useEffect, useState } from 'react';
import { Row, Col, Card, Spinner } from 'react-bootstrap';
import { supabase } from '../../supabaseClient'; 

export function AdminHome() {
    // Estado unificado
    const [stats, setStats] = useState({ 
        products: 0, 
        lowStock: 0, 
        visits: 0,
        users: 0 
    });
    const [loading, setLoading] = useState(true);
    const [limiteUsado, setLimiteUsado] = useState(5); 

    useEffect(() => {
        async function loadDashboardData() {
            try {
                let limiteCritico = 5; 
                
                const { data: configData } = await supabase
                    .from('app_settings')
                    .select('critical_stock_limit')
                    .single();

                if (configData) {
                    limiteCritico = configData.critical_stock_limit;
                    setLimiteUsado(limiteCritico); 
                }

                const [prodRes, stockRes, visitRes, userRes] = await Promise.all([
                    supabase.from('products').select('*', { count: 'exact', head: true }),
                    supabase.from('products').select('*', { count: 'exact', head: true })
                            .lt('stock', limiteCritico), 

                    // C. Visitas
                    supabase.from('visits').select('*', { count: 'exact', head: true }),
                    supabase.from('profiles').select('*', { count: 'exact', head: true }) 
                ]);

                // PASO 3: GUARDAR RESULTADOS
                setStats({ 
                    products: prodRes.count || 0, 
                    lowStock: stockRes.count || 0,
                    visits: visitRes.count || 0,
                    users: userRes.count || 0
                });

            } catch (error) {
                console.error("Error cargando dashboard:", error);
            } finally {
                setLoading(false);
            }
        }

        loadDashboardData();
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
                <h6 className="text-uppercase opacity-75">
                    Stock Crítico 
                    <small style={{fontSize: '0.6em', display: 'block'}}>(Menos de {limiteUsado} un.)</small>
                </h6>
            </Card>
        </Col>

        {/* Visitas REALES */}
        <Col md={3} className="mb-3">
            <Card className="bg-success text-white p-3 shadow-sm text-center h-100 border-0">
                <h1 className="fw-bold display-4">{stats.visits}</h1>
                <h6 className="text-uppercase opacity-75">Visitas Totales</h6>
            </Card>
        </Col>

        {/* Usuarios */}
        <Col md={3} className="mb-3">
            <Card className="bg-info text-white p-3 shadow-sm text-center h-100 border-0">
                <h1 className="fw-bold display-4">{stats.users}</h1>
                <h6 className="text-uppercase opacity-75">Usuarios Registrados</h6>
            </Card>
        </Col>
      </Row>
    </div>
  );
}