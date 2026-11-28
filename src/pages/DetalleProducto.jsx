import { useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { obtenerProductos, obtenerDescuentoProducto, obtenerPrecioFinalProducto, obtenerImagenProducto,
    mostrarImagenProductoAlternativa, productoEstaEnOferta } from '../services/productosService.js';
import { useCarrito } from '../context/CarritoContext.jsx';
import { RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO, useCatalogoConectado } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { mismoIdProducto } from '../services/carritoService.js';
import SelectorCantidad from '../components/SelectorCantidad.jsx';
import StockProducto from '../components/StockProducto.jsx';
import AvisoCarrito from '../components/AvisoCarrito.jsx';

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function DetalleProducto() {
    const { id } = useParams();
    const catalogo = useCatalogoConectado();
    const productos = catalogo ? catalogo.productos : obtenerProductos();
    const producto = productos.find((item) => catalogo ? mismoIdProducto(item.id, id) : item.id === Number(id));
    const ruta = catalogo ? RUTA_CATALOGO_CONECTADO : '/productos';
    if (!producto) return <main className="tienda-contenedor tienda-vacio">
        <h1>Producto no encontrado</h1>
        <Link className="btn btn-danger" to={ruta}>Volver al catálogo</Link>
    </main>;

    return <FichaProducto key={id} producto={producto} conectado={Boolean(catalogo)} ruta={ruta} />;
}

function FichaProducto({ producto, conectado, ruta }) {
    const local = useCarrito();
    const remoto = useCarritoConectado();
    const rol = useSesionConectada().usuario?.rol;
    const vendedor = conectado && rol === 'VENDEDOR';
    const mostrarStock = !conectado || ['ADMIN', 'VENDEDOR'].includes(rol);
    const [cantidad, setCantidad] = useState(1);
    const [advertencia, setAdvertencia] = useState('');
    const [aviso, setAviso] = useState(null);

    const carrito = conectado ? remoto.carrito : local.carrito;
    const enCarrito = carrito.find((linea) => mismoIdProducto(linea.id, producto.id))?.cantidad ?? 0;
    const maximo = Math.max(0, producto.stock - enCarrito);
    const elegida = Math.min(cantidad, Math.max(1, maximo));
    const bloqueado = maximo === 0 || (conectado && Boolean(remoto.intento));
    const precioFinal = conectado ? producto.precioFinal : obtenerPrecioFinalProducto(producto);
    const imagen = obtenerImagenProducto(producto);
    const oferta = productoEstaEnOferta(producto);

    function agregar() {
        if (bloqueado || vendedor) return;
        const unidades = conectado ? remoto.agregarProducto(producto, elegida) : local.agregarProducto({
            ...producto, precioOriginal: producto.precio, precio: precioFinal, descuento: obtenerDescuentoProducto(producto)
        }, elegida);
        setAviso({ nombre: producto.nombre, cantidad: unidades,
            mensaje: 'No se pudo agregar esa cantidad. Revisa las unidades que ya tienes en el carrito.' });
        if (unidades) {
            setCantidad(1);
            setAdvertencia('');
        }
    }

    return (
        <main className="tienda-contenedor ficha-producto">
            <Link to={ruta} className="tienda-regreso"><i className="bi bi-arrow-left" aria-hidden="true" /> Volver</Link>
            <div className="ficha-distribucion">
                <figure className="ficha-imagen">
                    <img src={imagen} alt={producto.nombre} onError={(evento) => mostrarImagenProductoAlternativa(evento, producto.imagen)} />
                    {producto.imagen && imagen !== producto.imagen && <figcaption>Imagen referencial</figcaption>}
                </figure>
                <div className="ficha-datos">
                    <p className="tienda-etiqueta"><span /> {producto.categoria}</p>
                    <h1>{producto.nombre}</h1>
                    <p className="text-body-secondary">Código {producto.codigo}</p>
                    <StockProducto producto={producto} mostrarStock={mostrarStock} />
                    <div className="ficha-precios">
                        <strong>{pesos.format(precioFinal)}</strong>
                        {oferta && <><del>{pesos.format(producto.precio)}</del><span className="producto-oferta">-{producto.descuento}%</span></>}
                    </div>
                    <p className="ficha-descripcion">{producto.descripcion}</p>
                    {!vendedor && <div className="ficha-compra">
                        <label htmlFor="cantidad-producto" className="form-label">Cantidad</label>
                        <div className="ficha-acciones">
                            <SelectorCantidad id="cantidad-producto" nombre={producto.nombre} cantidad={elegida}
                                maximo={maximo} deshabilitado={bloqueado} cambiar={(valor) => { setCantidad(valor); setAdvertencia(''); }}
                                advertir={() => setAdvertencia('No puedes agregar más unidades de las disponibles.')} />
                            <button type="button" className="btn btn-danger" disabled={bloqueado} onClick={agregar}>
                                <i className="bi bi-cart-plus" aria-hidden="true" /> Agregar al carrito
                            </button>
                        </div>
                        {advertencia && <p className="stock-advertencia" role="alert">{advertencia}</p>}
                        {!advertencia && enCarrito > 0 && maximo === 0 && producto.stock > 0 &&
                            <p className="stock-advertencia" role="status">Ya agregaste todas las unidades disponibles.</p>}
                        {conectado && remoto.intento && <p className="stock-advertencia">Hay una compra pendiente de verificar.</p>}
                    </div>}
                </div>
            </div>
            <AvisoCarrito aviso={aviso} cerrar={setAviso} rutaCarrito={conectado ? RUTA_CARRITO_CONECTADO : '/carrito'} />
        </main>
    );
}
