import React from 'react';
import { Table } from 'react-bootstrap';

const AdditionalInfoTable = ({ product }) => {
    // Definimos los campos exactos de tu foto de referencia
    const details = [
        { label: 'Producto', value: product.title },
        { label: 'Marca', value: product.brand || 'Grifine' },
        { label: 'Aplicación', value: product.application || 'Piso / Pared' },
        { label: 'Destonificado', value: product.destonificado ? 'V3 (Alto)' : 'V1 (Bajo)' },
        { label: 'Acabado', value: product.finish || 'N/A' },
        { label: 'Código', value: product.code || `SKU-${product.id}` }, 
        { label: 'Unidad de venta', value: product.unitOfSale || 'm²' },
        { label: 'M2 por caja', value: product.m2PerBox || '1.44' },
        { label: 'Caras Diferenciadas', value: product.differentiatedFaces ? 'Sí' : 'No' },
    ];

  return (
    <Table hover responsive className="mt-3 align-middle">
        <tbody>
            {details.map((detail, index) => (
                <tr key={index}>
                    {/* Estilo para que parezca la foto: Título en negrita y ancho fijo */}
                    <td className="bg-white fw-bold text-secondary" style={{ width: '30%' }}>
                        {detail.label}
                    </td>
                    <td className="bg-white text-dark">
                        {detail.value}
                    </td>
                </tr>
            ))}
        </tbody>
    </Table>
  );
};

export default AdditionalInfoTable;