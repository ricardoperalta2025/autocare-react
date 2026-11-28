import { useState } from 'react';
import { Link, useOutletContext } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CATALOGO_CONECTADO, RUTA_CHECKOUT_CONECTADO } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { mostrarImagenProductoAlternativa, obtenerImagenProducto } from '../services/productosService.js';
import ImportarCarritoLocal from '../components/ImportarCarritoLocal.jsx';
import SelectorCantidad from '../components/SelectorCantidad.jsx';
import ResumenCompra from '../components/ResumenCompra.jsx';

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function Carrito({ conectado = false }) {
    const local = useCarrito();
    const remoto = useCarritoConectado();
    const revision = useOutletContext();
    const { cambiarCantidad, eliminarProducto } = conectado ? remoto : local;
    const carrito = conectado ? revision.lineas : local.carrito;
    const total = conectado ? revision.total : local.total;
    const bloqueado = conectado && Boolean(remoto.intento);
    const { usuario: comprador, demostracion } = useSesionConectada();
    const [advertencia, setAdvertencia] = useState(null);
    const catalogo = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';
    const checkout = conectado ? RUTA_CHECKOUT_CONECTADO : '/checkout';

    if (conectado && comprador?.rol === 'VENDEDOR') return <main className="tienda-contenedor tienda-pagina">
        <p>El rol VENDEDOR permite consultar productos y órdenes.</p><Link to={catalogo}>Ver productos</Link>
    </main>;

    return <main className="tienda-contenedor tienda-pagina">
        <Link className="tienda-regreso" to={catalogo}><i className="bi bi-arrow-left" aria-hidden="true" /> Seguir comprando</Link>
        <header className="tienda-encabezado"><div><h1>{conectado ? 'Carrito' : 'Carrito de Compras'}</h1>
            <p className="text-body-secondary mb-0">Revisa tus productos antes de continuar.</p></div></header>

        {!carrito.length ? <section className="tienda-vacio">
            <i className="bi bi-cart3" aria-hidden="true" />
            <h2>Tu carrito está vacío</h2><p>Agrega productos antes de continuar con la compra.</p>
            <Link className="btn btn-danger" to={catalogo}>Ver productos</Link>
        </section> : <div className="compra-distribucion">
            <section className="carrito-lineas" aria-label="Productos del carrito">
                {carrito.map((item) => {
                    const oferta = item.descuento > 0 && item.precioOriginal > item.precio;
                    return <article className="tienda-panel carrito-linea" key={item.id}>
                        <img src={obtenerImagenProducto(item)} alt={item.nombre}
                            onError={(evento) => mostrarImagenProductoAlternativa(evento, item.imagen)} />
                        <div className="linea-datos">
                            <h2>{item.nombre}</h2>
                            <p className="linea-precios">{oferta && <><del>{pesos.format(item.precioOriginal)}</del>
                                <span className="descuento-texto">-{item.descuento}%</span></>} <strong>{pesos.format(item.precio)}</strong> por unidad</p>
                            <div className="linea-controles">
                                <label className="visually-hidden" htmlFor={'cantidad-' + item.id}>Cantidad:</label>
                                <SelectorCantidad id={'cantidad-' + item.id} nombre={item.nombre} cantidad={item.cantidad}
                                    maximo={item.stock} deshabilitado={bloqueado || item.stock < 1}
                                    cambiar={(valor) => { cambiarCantidad(item.id, valor, item.stock); setAdvertencia(null); }}
                                    advertir={() => setAdvertencia(item.id)} ajustarAlMaximo={!conectado} />
                                <button type="button" className="btn btn-link text-danger btn-sm" disabled={bloqueado}
                                    onClick={() => eliminarProducto(item.id)}>Eliminar</button>
                            </div>
                            {advertencia === item.id && <p className="stock-advertencia" role="alert">Alcanzaste el límite de unidades disponibles.</p>}
                        </div>
                        <div className="linea-subtotal"><small>Subtotal</small><strong>{pesos.format(item.precio * item.cantidad)}</strong></div>
                    </article>;
                })}
            </section>

            <ResumenCompra lineas={carrito} total={total} estimado={conectado}>
                {conectado && !revision.puedeContinuar
                    ? <button type="button" className="btn btn-danger w-100" disabled>Continuar al checkout</button>
                    : <Link to={checkout} className="btn btn-danger w-100">Continuar al checkout</Link>}
            </ResumenCompra>
        </div>}

        {conectado && !demostracion && !bloqueado && (
            <ImportarCarritoLocal key={comprador?.id ?? 'sin-sesion'} carritoLocal={local.carrito}
                productos={revision.productos} aplicar={remoto.aplicarPropuesta} />
        )}
        {conectado && !bloqueado && comprador && (
            <ImportarCarritoLocal key={'anonimo-' + comprador.id} carritoLocal={remoto.carritoSinSesion}
                productos={revision.productos} aplicar={remoto.aplicarPropuesta} origen="carrito sin sesión" />
        )}
    </main>;
}
