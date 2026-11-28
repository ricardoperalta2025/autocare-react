import { Link, useLocation, useOutletContext } from 'react-router-dom';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CATALOGO_CONECTADO, RUTA_CHECKOUT_CONECTADO, RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';
import { crearEnvioOrden, obtenerOrdenApi, prepararSolicitudOrden, solicitudDelIntento,
    sonProductosTemporales } from '../services/ordenesApi.js';
import { modoPruebaOrdenesActivo } from '../services/ordenesConfiguracion.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import ResumenCompra from '../components/ResumenCompra.jsx';

const formatoPrecio = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

function MensajeCompra({ mensaje }) {
    if (!mensaje) return null;
    const campos = Object.entries(mensaje.campos ?? {});
    return (
        <div className="alert alert-warning" role="alert">
            {mensaje.texto}
            {campos.length > 0 && <ul className="mb-0">{campos.map(([campo, detalle]) => (
                <li key={campo}>{campo} · {detalle}</li>
            ))}</ul>}
        </div>
    );
}

export default function CompraConectada({ envioHabilitado, enviar, consultar = obtenerOrdenApi }) {
    const { state } = useLocation();
    const { usuario, demostracion, escriturasHabilitadas } = useSesionConectada();
    const habilitado = demostracion ? escriturasHabilitadas === true : envioHabilitado ?? modoPruebaOrdenesActivo();
    const enviarCompra = enviar ?? crearEnvioOrden({ habilitado, soloTemporales: !demostracion });
    const { datosCliente, tipoEntrega } = (state?.compradorId === usuario?.id ? state : null) ?? {};
    const { ordenConfirmada, intento, mensaje, procesando, registrarCompra, consultarPendiente,
        reintentarCompra } = useCarritoConectado();
    const { lineas, total, puedeContinuar, productos } = useOutletContext();
    const rolPuedeComprar = ['ADMIN', 'CLIENTE'].includes(usuario?.rol);

    if (ordenConfirmada) {
        return (
            <main className="tienda-contenedor tienda-pagina">
                <section className="tienda-panel compra-confirmada">
                    <span className="confirmacion-icono"><i className="bi bi-check-lg" aria-hidden="true" /></span>
                    <h1>Orden confirmada</h1>
                    <p className="text-body-secondary">Compra y pago simulados. No se realizó ningún cobro.</p>
                    <p className="referencia-orden">ID de la orden: <strong>{ordenConfirmada.id}</strong></p>
                    <p className="resumen-total">Total confirmado: <strong>{formatoPrecio.format(ordenConfirmada.total)}</strong></p>
                    {ordenConfirmada.productos && (
                        <ul aria-label="Productos confirmados">{ordenConfirmada.productos.map((producto) => (
                            <li key={producto.productoId}>{producto.nombre} × {producto.cantidad}</li>
                        ))}</ul>
                    )}
                    <div className="d-flex flex-wrap justify-content-center gap-2">
                        <Link className="btn btn-danger" to={`${RUTA_ORDENES_CONECTADAS}/${ordenConfirmada.id}/boleta`}>Ver comprobante</Link>
                        <Link className="btn btn-outline-dark" to={RUTA_CATALOGO_CONECTADO}>Seguir comprando</Link>
                    </div>
                </section>
            </main>
        );
    }

    if (intento) {
        const solicitudGuardada = solicitudDelIntento(intento);
        const productosPermitidos = demostracion || sonProductosTemporales(solicitudGuardada, productos);
        return (
            <main className="tienda-contenedor tienda-pagina">
                <section className="tienda-panel">
                    <h1>Compra pendiente de verificación</h1>
                    <p role="status">{procesando ? 'Comprobando el resultado…' : 'El carrito sigue guardado.'}</p>
                    <MensajeCompra mensaje={mensaje} />
                    {solicitudGuardada ? (
                        <>
                            <p className="referencia-orden">ID de la orden: {intento.id}</p>
                            <div className="d-flex gap-2 flex-wrap">
                                <button type="button" className="btn btn-outline-secondary" disabled={procesando}
                                    onClick={() => consultarPendiente(consultar)}>Consultar orden</button>
                                <button type="button" className="btn btn-danger"
                                    disabled={procesando || !rolPuedeComprar || !habilitado || !productosPermitidos}
                                    onClick={() => reintentarCompra(enviarCompra, consultar)}>Reintentar la misma compra</button>
                            </div>
                            {!habilitado && <p className="text-muted mt-2">Envío de órdenes deshabilitado durante la revisión.</p>}
                            {habilitado && !productosPermitidos && <p className="text-muted mt-2">
                                El reintento requiere verificar todos los productos temporales con código TEST-.
                            </p>}
                        </>
                    ) : <p>Este intento anterior no tiene una solicitud verificable. Consulta su estado con administración.</p>}
                </section>
            </main>
        );
    }

    if (!datosCliente || !tipoEntrega || !lineas.length) {
        return (
            <main className="tienda-contenedor tienda-pagina">
                <h1>Revisar compra</h1>
                <p>Completa el checkout con productos y datos de entrega para preparar una orden.</p>
                <Link to={RUTA_CHECKOUT_CONECTADO}>Ir al checkout</Link>
            </main>
        );
    }

    const solicitud = prepararSolicitudOrden(lineas, { ...datosCliente, tipo: tipoEntrega });
    const productosPermitidos = demostracion || sonProductosTemporales(solicitud, productos);
    return (
        <main className="tienda-contenedor tienda-pagina">
            <Link className="tienda-regreso" to={RUTA_CHECKOUT_CONECTADO}
                state={{ datosCliente, tipoEntrega, compradorId: usuario.id }}>
                <i className="bi bi-arrow-left" aria-hidden="true" /> Volver al checkout
            </Link>
            <header className="tienda-encabezado"><div><h1>Revisar compra</h1>
                <p className="text-body-secondary mb-0">Verifica tus productos y datos de entrega.</p></div></header>
            {!habilitado && <div className="alert alert-warning">Envío de órdenes deshabilitado durante la revisión.</div>}
            {habilitado && !productosPermitidos && <p>La prueba admite únicamente productos temporales con código TEST-.</p>}
            <MensajeCompra mensaje={mensaje} />
            <div className="compra-distribucion">
                <section className="tienda-panel checkout-formulario" aria-label="Datos de entrega">
                    <h2><i className="bi bi-truck" aria-hidden="true" /> Datos de entrega</h2>
                    <p>Entrega seleccionada: {tipoEntrega}</p>
                    <address className="mb-0">
                        <strong>{datosCliente.nombre}</strong><br />
                        <span>{datosCliente.direccion}, {datosCliente.comuna}</span><br />
                        <span>{datosCliente.correo} · {datosCliente.telefono}</span>
                    </address>
                </section>
                <ResumenCompra lineas={lineas} total={total} mostrarDetalle>
                    <p className="nota-compra"><i className="bi bi-info-circle" aria-hidden="true" /> Compra y pago simulados.</p>
                    <button type="button" className="btn btn-danger w-100"
                        disabled={!rolPuedeComprar || !habilitado || !productosPermitidos || !puedeContinuar || procesando}
                        onClick={() => registrarCompra(solicitud, enviarCompra, consultar)}>Confirmar compra</button>
                </ResumenCompra>
            </div>
        </main>
    );
}
