import { Link, useLocation, useParams } from 'react-router-dom';
import { obtenerUsuarioPorId } from '../services/usuariosService.js';
import { obtenerOrdenesUsuario } from '../services/ordenesService.js';
import { RUTA_ORDENES_CONECTADAS, useBaseAdmin } from '../context/catalogo.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { EncabezadoAdmin, EtiquetaAdmin, PaginacionAdmin, ReferenciaAdmin, pesosAdmin, usePaginaAdmin } from '../components/AdminInterfaz.jsx';
import { useConsultaConectada } from '../hooks/useOperacionesConectadas.js';
import { formatearRegistro, listarOrdenesClienteApi, obtenerClienteApi } from '../services/operacionesApi.js';

export default function AdminUsuarioDetalle({ conectado = false }) {
    const base = useBaseAdmin() + '/usuarios';
    const { id } = useParams();
    const { state } = useLocation();
    const cliente = useConsultaConectada(conectado, obtenerClienteApi, id);
    const historial = useConsultaConectada(conectado, listarOrdenesClienteApi, id);
    const usuario = conectado ? cliente.datos : obtenerUsuarioPorId(id);
    const valido = usuario && (conectado || usuario.rol === 'cliente');
    const ordenes = conectado ? (historial.datos ?? []).map(formatearRegistro) : valido ? obtenerOrdenesUsuario(usuario) : [];
    const paginacion = usePaginaAdmin(ordenes);
    const rutaOrdenes = conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes';

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Detalle del cliente" regreso={base} textoRegreso="Volver a usuarios">
            {valido && <Link className="btn btn-danger" to={base + '/' + id + '/editar'}>Editar cliente</Link>}
        </EncabezadoAdmin>
        {conectado && <EstadoCatalogoAdmin consulta={cliente} />}
        {valido && state?.confirmacion && <p role="status" className="alert alert-success">{state.confirmacion}</p>}
        {!conectado && !valido && <p role="alert" className="alert alert-warning">Usuario no encontrado.</p>}
        {valido && <>
            <section className="tienda-panel mb-3">
                <h2 className="h5">{[usuario.nombre, usuario.apellido].filter(Boolean).join(' ')}</h2>
                <dl className="row mb-0">
                    {[['Correo', usuario.correo], ['Teléfono', usuario.telefono], ['Comuna', usuario.comuna], ['Dirección', usuario.direccion]]
                        .map(([etiqueta, dato]) => <div className="col-sm-6 mb-2" key={etiqueta}>
                            <dt>{etiqueta}</dt><dd className="mb-0 text-break">{dato || 'Sin registrar'}</dd>
                        </div>)}
                </dl>
            </section>
            <section className="tienda-panel" aria-label="Historial de compras">
                <h2 className="h5">Historial de compras</h2>
                {conectado && <EstadoCatalogoAdmin consulta={historial} />}
                {(!conectado || historial.datos) && (ordenes.length ? <>
                    <div className="table-responsive"><table className="table admin-tabla align-middle">
                        <thead><tr><th>Orden</th><th>Fecha</th><th>Total</th>{!conectado && <th>Pago</th>}<th>Estado</th><th>Acción</th></tr></thead>
                        <tbody>{paginacion.filas.map((orden) => <tr key={orden.id}>
                            <td><ReferenciaAdmin id={orden.id} /><span className="visually-hidden"> Orden {orden.id}</span></td>
                            <td className="admin-fecha">{orden.fecha}</td><td>{pesosAdmin.format(orden.total)}</td>
                            {!conectado && <td>{orden.metodoPago || '—'}</td>}<td><EtiquetaAdmin estado={orden.estado} /></td>
                            <td><Link className="btn btn-outline-secondary btn-sm" to={rutaOrdenes + '/' + orden.id}>Ver orden</Link></td>
                        </tr>)}</tbody>
                    </table></div>
                    <PaginacionAdmin datos={paginacion} seccion="historial" />
                </> : <p className="mb-0">Este cliente todavía no tiene compras registradas.</p>)}
            </section>
        </>}
    </main>;
}
