import { useCatalogoConectado, RUTA_CATALOGO_CONECTADO } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { obtenerProductos, obtenerPrecioFinalProducto, productoEstaEnOferta } from '../services/productosService.js';
import ProductoTarjeta from '../components/ProductoTarjeta.jsx';

export default function Ofertas() {
    const catalogo = useCatalogoConectado();
    const rol = useSesionConectada().usuario?.rol;
    const ruta = catalogo ? RUTA_CATALOGO_CONECTADO : '/productos';
    const ofertas = (catalogo?.productos ?? obtenerProductos()).filter(productoEstaEnOferta);
    return <main className="tienda-contenedor tienda-pagina">
        <header className="tienda-encabezado"><div><h1>Ofertas</h1><p className="text-body-secondary mb-0">Productos con descuento vigente.</p></div></header>
        {ofertas.length ? <div className="producto-grid">
            {ofertas.map((producto) => <ProductoTarjeta key={producto.id} producto={producto}
                ruta={ruta + '/' + producto.id} precioFinal={catalogo ? producto.precioFinal : obtenerPrecioFinalProducto(producto)}
                etiquetaDetalle="Ver producto" mostrarStock={!catalogo || ['ADMIN', 'VENDEDOR'].includes(rol)} />)}
        </div> : <p className="tienda-vacio">Actualmente no existen productos en oferta.</p>}
    </main>;
}
