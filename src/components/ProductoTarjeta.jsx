import { Link } from 'react-router-dom';
import { mostrarImagenProductoAlternativa, obtenerImagenProducto, productoEstaEnOferta } from '../services/productosService.js';
import StockProducto from './StockProducto.jsx';

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function ProductoTarjeta({ producto, ruta, precioFinal, mostrarStock, agregar, bloqueado,
    etiquetaDetalle = 'Ver detalle' }) {
    const oferta = productoEstaEnOferta(producto);

    return <article className="card producto-tarjeta h-100">
        <Link to={ruta} className="producto-imagen" aria-label={'Ver imagen y detalle de ' + producto.nombre}>
            <img src={obtenerImagenProducto(producto)} alt={producto.nombre} loading="lazy"
                onError={(evento) => mostrarImagenProductoAlternativa(evento, producto.imagen)} />
        </Link>
        {oferta && <span className="producto-oferta">-{producto.descuento}%</span>}
        <div className="card-body d-flex flex-column">
            <p className="producto-categoria">{producto.categoria}</p>
            <h2 className="producto-nombre">
                <Link to={ruta}>{producto.nombre}</Link>
            </h2>
            <p className="producto-descripcion">{producto.descripcion}</p>
            <div className="mt-auto">
                <div className="producto-precios">
                    <strong>{pesos.format(precioFinal)}</strong>
                    {oferta && <del>{pesos.format(producto.precio)}</del>}
                </div>
                <StockProducto producto={producto} mostrarStock={mostrarStock} />
                <div className="producto-acciones">
                    <Link to={ruta} className="btn btn-outline-dark">{etiquetaDetalle}</Link>
                    {agregar && <button type="button" className="btn btn-danger" disabled={bloqueado || producto.stock < 1}
                        aria-label={'Agregar ' + producto.nombre + ' al carrito'} onClick={agregar}>
                        <i className="bi bi-cart-plus" aria-hidden="true" /> <span>Agregar</span>
                    </button>}
                </div>
            </div>
        </div>
    </article>;
}
