import { useEffect, useState } from 'react';
import { Link, useParams } from 'react-router-dom';
import { RUTA_ADMIN_CONECTADA, RUTA_CATALOGO_CONECTADO, RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { listarOrdenesApi, obtenerOrdenApi } from '../services/ordenesApi.js';

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 16 });
const descuentos = new Intl.NumberFormat('es-CL', { maximumFractionDigits: 16 });
const fechaCompra = new Intl.DateTimeFormat('es-CL', { dateStyle: 'medium', timeStyle: 'short', timeZone: 'America/Santiago' });

function FechaOrden({ fecha }) {
    const instante = fecha ? new Date(fecha) : null;
    return Number.isFinite(instante?.getTime())
        ? <time dateTime={fecha}>{fechaCompra.format(instante)}</time> : 'Fecha no disponible';
}

function EstadoOrden({ estado }) {
    if (!estado) return null;
    const texto = estado === 'ENVIADO' ? 'Enviado' : estado === 'PROCESANDO' ? 'Procesando' : estado;
    return <span className={'estado-pedido' + (estado === 'ENVIADO' ? ' enviado' : '')}>{texto}</span>;
}

function TablaOrden({ productos }) {
    return <div className="tabla-pedido table-responsive" tabIndex={0} aria-label="Productos del pedido">
        <table className="table align-middle">
            <thead><tr>
                <th scope="col">Producto</th><th scope="col">Cantidad</th><th scope="col">Precio original</th>
                <th scope="col">Descuento</th><th scope="col">Precio unitario</th><th scope="col">Subtotal</th>
            </tr></thead>
            <tbody>{productos.map((linea) => <tr key={linea.productoId}>
                <th scope="row">{linea.nombre}</th><td>{linea.cantidad}</td><td>{pesos.format(linea.precioOriginal)}</td>
                <td>{descuentos.format(linea.descuento)} %</td><td>{pesos.format(linea.precioUnitario)}</td><td>{pesos.format(linea.subtotal)}</td>
            </tr>)}</tbody>
        </table>
    </div>;
}

function ResumenOrden({ orden, comprobante, vendedor, rutaDetalle }) {
    return <section className="tienda-panel resumen-orden">
        <div className="orden-cabecera">
            <div>
                <p className="tienda-etiqueta"><span /> {comprobante ? 'Comprobante informativo' : 'Pedido'}</p>
                <h2 className="referencia-orden">Orden {orden.id}</h2>
                <FechaOrden fecha={orden.fechaCreacion} />
            </div>
            <EstadoOrden estado={orden.estado} />
        </div>
        <TablaOrden productos={orden.productos} />
        <p className="orden-total">{'Total confirmado: ' + pesos.format(orden.total)}</p>

        {!comprobante && !vendedor && orden.entrega && <section className="datos-entrega" aria-label="Datos de entrega">
            <h3><i className="bi bi-truck" aria-hidden="true" /> Datos de entrega</h3>
            <p>{orden.entrega.tipo} · {orden.entrega.nombre}</p>
            <p>{orden.entrega.direccion}, {orden.entrega.comuna}</p>
            <p>{orden.entrega.correo} · {orden.entrega.telefono}</p>
        </section>}
        {comprobante ? <p className="nota-compra">Comprobante informativo de AutoCarePro, sin validez tributaria.</p> :
            <Link className="btn btn-danger" to={rutaDetalle + '/boleta'}>Ver comprobante</Link>}
    </section>;
}

export default function OrdenesConectadas({ comprobante = false }) {
    const { id } = useParams();
    const { usuario, solicitar } = useSesionConectada();
    const [consulta, setConsulta] = useState(null);
    const usuarioId = usuario?.id;

    useEffect(() => {
        let vigente = true;
        if (!usuarioId) return undefined;
        const operacion = id ? (token) => obtenerOrdenApi(id, token) : listarOrdenesApi;
        solicitar(operacion, usuarioId).then((datos) => {
            if (vigente) setConsulta({ id, usuarioId, datos });
        }).catch((error) => {
            if (!vigente) return;
            const mensaje = { 401: 'Inicia sesión de nuevo.', 403: 'No tienes permiso para consultar órdenes.',
                404: 'Orden no encontrada.' }[error.estado] ?? 'No se pudieron consultar las órdenes.';
            setConsulta({ id, usuarioId, mensaje });
        });
        return () => { vigente = false; };
    }, [id, usuarioId, solicitar]);

    const actual = consulta?.id === id && consulta?.usuarioId === usuarioId ? consulta : null;
    const rutaDetalle = RUTA_ORDENES_CONECTADAS + '/' + id;
    const listaOrdenes = usuario?.rol === 'ADMIN' ? RUTA_ADMIN_CONECTADA + '/ordenes' : RUTA_ORDENES_CONECTADAS;
    const titulo = comprobante ? 'Comprobante de compra' : id ? 'Detalle de la orden'
        : usuario?.rol === 'CLIENTE' ? 'Mis órdenes' : 'Órdenes';

    return <main className="tienda-contenedor tienda-pagina ordenes-pagina">
        <Link className="tienda-regreso" to={comprobante ? rutaDetalle : id ? listaOrdenes : RUTA_CATALOGO_CONECTADO}>
            <i className="bi bi-arrow-left" aria-hidden="true" /> {comprobante ? 'Volver al detalle de la orden' : id ? 'Volver a las órdenes' : 'Volver al catálogo'}
        </Link>
        <header className="tienda-encabezado"><div><h1>{titulo}</h1>
            {!id && <p className="text-body-secondary mb-0">Consulta el estado y el comprobante de cada pedido.</p>}</div></header>
        {!actual && <p role="status">Consultando {id ? 'orden' : 'órdenes'}…</p>}
        {actual?.mensaje && <p className="alert alert-warning" role="alert">{actual.mensaje}</p>}
        {id && actual?.datos && <ResumenOrden orden={actual.datos} comprobante={comprobante}
            vendedor={usuario?.rol === 'VENDEDOR'} rutaDetalle={rutaDetalle} />}
        {!id && Array.isArray(actual?.datos) && (actual.datos.length ? <div className="orden-lista">
            {actual.datos.map((orden) => {
                const ruta = RUTA_ORDENES_CONECTADAS + '/' + orden.id;
                return <article className="tienda-panel orden-tarjeta" key={orden.id}>
                    <div><Link className="orden-referencia" to={ruta} title={orden.id} aria-label={'Orden ' + orden.id}>
                        Orden #{orden.id.slice(-8).toUpperCase()}</Link><p className="mb-0"><FechaOrden fecha={orden.fechaCreacion} /></p></div>
                    <EstadoOrden estado={orden.estado} />
                    <strong>{pesos.format(orden.total)}</strong>
                    <div className="d-flex gap-2 flex-wrap">
                        <Link className="btn btn-outline-dark btn-sm" to={ruta}>Ver detalle</Link>
                        <Link className="btn btn-outline-danger btn-sm" to={ruta + '/boleta'}>Ver comprobante</Link>
                    </div>
                </article>;
            })}
        </div> : <p className="tienda-vacio">Todavía no hay órdenes.</p>)}
    </main>;
}
