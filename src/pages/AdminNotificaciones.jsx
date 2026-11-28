import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerProductos, productoTieneStockCritico } from '../services/productosService.js';
import { useBaseAdmin } from '../context/catalogo.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { EncabezadoAdmin, EtiquetaAdmin, PaginacionAdmin, usePaginaAdmin } from '../components/AdminInterfaz.jsx';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { listarProductosAdmin, adminCatalogoApi } from '../services/adminCatalogoApi.js';

export default function AdminNotificaciones({ conectado = false, cliente = adminCatalogoApi }) {
    const baseAdmin = useBaseAdmin();
    const [filtro, setFiltro] = useState('');
    const consulta = useConsultaCatalogoAdmin(conectado, listarProductosAdmin);
    const productos = conectado ? consulta.datos : obtenerProductos();
    const alertas = (productos ?? []).filter((producto) => producto.stock <= 0 || productoTieneStockCritico(producto));
    const resultados = alertas.filter((producto) => !filtro || (producto.stock <= 0 ? filtro === 'Agotado' : filtro === 'Stock crítico'));
    const paginacion = usePaginaAdmin(resultados);

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Notificaciones" descripcion="Alertas de stock crítico y productos agotados." />
        {conectado && <EstadoCatalogoAdmin consulta={consulta} />}
        {productos && <section className="tienda-panel">
            <div className="d-flex flex-wrap justify-content-between align-items-end gap-2 mb-3">
                <h2 className="h5 mb-0">Alertas de inventario <span className="badge text-bg-secondary">{alertas.length}</span></h2>
                <label>Tipo de alerta <select className="form-select" value={filtro} onChange={(evento) => {
                    setFiltro(evento.target.value);
                    paginacion.setPagina(1);
                }}><option value="">Todas</option><option>Stock crítico</option><option>Agotado</option></select></label>
            </div>
            {resultados.length ? <>
                <div className="table-responsive"><table className="table admin-tabla align-middle">
                    <thead><tr><th>Producto</th><th>Stock actual</th><th>Umbral</th><th>Estado</th><th>Acción</th></tr></thead>
                    <tbody>{paginacion.filas.map((producto) => <tr key={producto.id}>
                        <td><strong>{producto.nombre}</strong><div className="small text-body-secondary">{producto.codigo}</div></td>
                        <td>{producto.stock}</td><td>Stock crítico: {producto.stockCritico}</td>
                        <td><EtiquetaAdmin estado={producto.stock <= 0 ? 'Agotado' : 'Stock crítico'} /></td>
                        <td><Link className="btn btn-outline-secondary btn-sm" to={baseAdmin + '/productos/editar/' + producto.id}>
                            {!conectado || cliente.puedeEditar('productos', producto) ? 'Editar producto' : 'Ver producto'}
                        </Link></td>
                    </tr>)}</tbody>
                </table></div>
                <PaginacionAdmin datos={paginacion} seccion="notificaciones" />
            </> : <p className="mb-0 text-body-secondary">No hay alertas que coincidan con el filtro.</p>}
        </section>}
    </main>;
}
