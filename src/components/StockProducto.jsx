import { productoTieneStockCritico } from '../services/productosService.js';

export default function StockProducto({ producto, mostrarStock }) {
    const agotado = producto.stock <= 0;
    const critico = productoTieneStockCritico(producto);
    const clase = agotado ? ' agotado' : critico ? ' critico' : '';
    const estado = agotado ? 'Agotado' : critico ? (mostrarStock ? 'Stock crítico' : 'Últimas unidades') : 'Disponible';

    return <div className="stock-producto">
        <span className={'stock-badge' + clase}>{estado}</span>
        {mostrarStock && <small className="text-body-secondary">Stock disponible: {producto.stock}</small>}
    </div>;
}
