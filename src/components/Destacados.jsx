import { Link } from 'react-router-dom';
import { obtenerPrecioFinalProducto, obtenerProductos } from '../services/productosService.js';
import ProductoTarjeta from './ProductoTarjeta.jsx';

export default function Destacados() {
    const productos = obtenerProductos().slice(0, 3);

    return <section className="tienda-contenedor my-5">
        <header className="tienda-encabezado"><h2>Productos destacados</h2>
            <Link to="/productos" className="tienda-regreso mb-0">Ver todos los productos <i className="bi bi-arrow-right" aria-hidden="true" /></Link>
        </header>
        {productos.length ? <div className="producto-grid">{productos.map((producto) =>
            <ProductoTarjeta key={producto.id} producto={producto} ruta={'/productos/' + producto.id}
                precioFinal={obtenerPrecioFinalProducto(producto)} mostrarStock />
        )}</div> : <p className="tienda-vacio">No existen productos disponibles.</p>}
    </section>;
}
