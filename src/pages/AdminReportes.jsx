import { obtenerProductos, productoTieneStockCritico } from '../services/productosService.js';
import { obtenerOrdenes } from '../services/ordenesService.js';
import { obtenerClientes } from '../services/usuariosService.js';
import { obtenerIncidencias } from '../services/incidenciasService.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { EncabezadoAdmin, EtiquetaAdmin, PaginacionAdmin, ReferenciaAdmin, pesosAdmin, usePaginaAdmin } from '../components/AdminInterfaz.jsx';
import { useConsultaConectada } from '../hooks/useOperacionesConectadas.js';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { listarProductosAdmin } from '../services/adminCatalogoApi.js';
import { listarOrdenesApi } from '../services/ordenesApi.js';
import { formatearRegistro, listarClientesApi, listarIncidenciasApi } from '../services/operacionesApi.js';

export default function AdminReportes({ conectado = false }) {
    const catalogo = useConsultaCatalogoAdmin(conectado, listarProductosAdmin);
    const compras = useConsultaConectada(conectado, listarOrdenesApi);
    const cuentas = useConsultaConectada(conectado, listarClientesApi);
    const posventa = useConsultaConectada(conectado, listarIncidenciasApi);
    const consultas = [catalogo, compras, cuentas, posventa];
    const productos = conectado ? catalogo.datos ?? [] : obtenerProductos();
    const ordenes = conectado ? (compras.datos ?? []).map(formatearRegistro) : obtenerOrdenes();
    const clientes = conectado ? cuentas.datos ?? [] : obtenerClientes();
    const incidencias = conectado ? (posventa.datos ?? []).map(formatearRegistro) : obtenerIncidencias();
    const ventas = usePaginaAdmin(ordenes);
    const inventario = usePaginaAdmin(productos);
    const listo = !conectado || consultas.every((consulta) => consulta.datos);

    // Los indicadores usan el conjunto completo, antes de paginar las tablas.
    const total = ordenes.reduce((suma, orden) => suma + orden.total, 0);
    const criticos = productos.filter(productoTieneStockCritico).length;
    const agotados = productos.filter((producto) => producto.stock <= 0).length;
    const indicadores = [
        ['Total de compras simuladas', pesosAdmin.format(total)],
        ['Órdenes registradas', ordenes.length],
        ['Procesando', ordenes.filter((orden) => orden.estado === 'Procesando').length],
        ['Enviadas', ordenes.filter((orden) => orden.estado === 'Enviado').length],
        ['Clientes', clientes.length],
        ['Stock normal', productos.length - criticos - agotados],
        ['Stock crítico', criticos],
        ['Agotados', agotados]
    ];

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Reportes" descripcion="Ventas simuladas, inventario y seguimiento de solicitudes." />
        {conectado && consultas.map((consulta, indice) => <EstadoCatalogoAdmin key={indice} consulta={consulta} />)}
        {listo && <>
            <div className="admin-indicadores mb-4">
                {indicadores.map(([nombre, valor]) => <div className="admin-indicador" key={nombre}><span>{nombre}</span><strong>{valor}</strong></div>)}
            </div>
            <section className="tienda-panel mb-3">
                <h2 className="h5">Estado de incidencias</h2>
                <div className="admin-indicadores">
                    {['Pendiente', 'En revisión', 'Resuelta'].map((estado) => <div className="admin-indicador" key={estado}>
                        <EtiquetaAdmin estado={estado} />
                        <strong>{incidencias.filter((incidencia) => incidencia.estado === estado).length}</strong>
                    </div>)}
                </div>
            </section>
            <section className="tienda-panel mb-3" aria-label="Resumen de ventas">
                <h2 className="h5">Resumen de ventas</h2>
                {ordenes.length ? <>
                    <div className="table-responsive"><table className="table admin-tabla align-middle">
                        <thead><tr><th>Orden</th><th>Fecha</th>{!conectado && <th>Cliente</th>}<th>Total</th>{!conectado && <th>Pago</th>}<th>Estado</th></tr></thead>
                        <tbody>{ventas.filas.map((orden) => <tr key={orden.id}>
                            <td><ReferenciaAdmin id={orden.id} /></td><td className="admin-fecha">{orden.fecha}</td>
                            {!conectado && <td>{orden.cliente?.nombre || 'Sin información'}</td>}
                            <td>{pesosAdmin.format(orden.total)}</td>{!conectado && <td>{orden.metodoPago || '—'}</td>}
                            <td><EtiquetaAdmin estado={orden.estado} /></td>
                        </tr>)}</tbody>
                    </table></div>
                    <PaginacionAdmin datos={ventas} seccion="ventas" />
                </> : <p className="mb-0">No existen ventas registradas.</p>}
            </section>
            <section className="tienda-panel" aria-label="Estado de inventario">
                <h2 className="h5">Estado de inventario</h2>
                {productos.length ? <>
                    <div className="table-responsive"><table className="table admin-tabla align-middle">
                        <thead><tr><th>Código</th><th>Producto</th><th>Categoría</th><th>Stock</th><th>Umbral crítico</th><th>Estado</th></tr></thead>
                        <tbody>{inventario.filas.map((producto) => <tr key={producto.id}>
                            <td>{producto.codigo}</td><td>{producto.nombre}</td><td>{producto.categoria}</td>
                            <td>{producto.stock}</td><td>{producto.stockCritico}</td>
                            <td><EtiquetaAdmin estado={producto.stock <= 0 ? 'Agotado' : productoTieneStockCritico(producto) ? 'Stock crítico' : 'Normal'} /></td>
                        </tr>)}</tbody>
                    </table></div>
                    <PaginacionAdmin datos={inventario} seccion="inventario" />
                </> : <p className="mb-0">No existen productos registrados.</p>}
            </section>
        </>}
    </main>;
}
