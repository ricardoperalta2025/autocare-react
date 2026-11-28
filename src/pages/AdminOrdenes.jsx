import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerOrdenes, actualizarEstadoOrden } from '../services/ordenesService.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import EstadoEscrituraConectada from '../components/EstadoEscrituraConectada.jsx';
import { EncabezadoAdmin, EtiquetaAdmin, PaginacionAdmin, ReferenciaAdmin, pesosAdmin, usePaginaAdmin } from '../components/AdminInterfaz.jsx';
import { useConsultaConectada, useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { formatearRegistro, marcarOrdenEnviadaApi } from '../services/operacionesApi.js';
import { listarOrdenesApi } from '../services/ordenesApi.js';
import { RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';

export default function AdminOrdenes({ conectado = false }) {
    const consulta = useConsultaConectada(conectado, listarOrdenesApi);
    const escritura = useEscrituraConectada();
    const [local, setLocal] = useState(() => conectado ? [] : obtenerOrdenes());
    const [busqueda, setBusqueda] = useState('');
    const [estado, setEstado] = useState('');
    const [aviso, setAviso] = useState('');
    const ordenes = conectado ? (consulta.datos ?? []).map(formatearRegistro) : local;
    const termino = busqueda.trim().replace(/^#/, '').toLowerCase();
    const resultados = ordenes.filter((orden) =>
        String(orden.id).toLowerCase().includes(termino) && (!estado || orden.estado === estado));
    const paginacion = usePaginaAdmin(resultados);
    const ruta = conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes';

    async function marcarComoEnviado(orden) {
        if (!window.confirm(`¿Deseas marcar la orden #${orden.id} como Enviado?`)) return;
        setAviso('');
        if (conectado) {
            if (!await escritura.ejecutar(marcarOrdenEnviadaApi, orden.id)) return;
            consulta.recargar();
        } else {
            actualizarEstadoOrden(orden.id, 'Enviado');
            setLocal(obtenerOrdenes());
        }
        setAviso('La orden se marcó como enviada.');
    }

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Administración de Órdenes" descripcion={`Órdenes registradas: ${conectado && !consulta.datos ? '—' : ordenes.length}`} />
        {aviso && <p className="alert alert-success" role="status">{aviso}</p>}
        {conectado && <><EstadoCatalogoAdmin consulta={consulta} /><EstadoEscrituraConectada escritura={escritura} /></>}
        {(!conectado || consulta.datos) && <section className="tienda-panel">
            <div className="row g-3 mb-3">
                <label className="col-sm-6">Buscar por número de orden
                    <input className="form-control" value={busqueda} onChange={(evento) => {
                        setBusqueda(evento.target.value);
                        paginacion.setPagina(1);
                    }} />
                </label>
                <label className="col-sm-6">Estado de la orden
                    <select className="form-select" value={estado} onChange={(evento) => {
                        setEstado(evento.target.value);
                        paginacion.setPagina(1);
                    }}><option value="">Todos</option><option>Procesando</option><option>Enviado</option>{!conectado && <option>Entregado</option>}</select>
                </label>
            </div>
            {resultados.length ? <>
                <div className="table-responsive"><table className="table admin-tabla align-middle">
                    <thead><tr><th>Orden</th><th>Fecha</th><th>Unidades</th>{!conectado && <th>Pago</th>}<th>Total</th><th>Estado</th><th>Acciones</th></tr></thead>
                    <tbody>{paginacion.filas.map((orden) => <tr key={orden.id}>
                        <td><ReferenciaAdmin id={orden.id} /><span className="visually-hidden"> Orden {orden.id}</span></td>
                        <td className="admin-fecha">{orden.fecha}</td><td>{orden.productos.reduce((suma, producto) => suma + producto.cantidad, 0)}</td>
                        {!conectado && <td>{orden.metodoPago}</td>}<td><strong>{pesosAdmin.format(orden.total)}</strong></td>
                        <td><EtiquetaAdmin estado={orden.estado} /></td>
                        <td><div className="admin-acciones">
                            <Link className="btn btn-outline-secondary btn-sm" to={ruta + '/' + orden.id}>Ver detalle</Link>
                            {orden.estado === 'Procesando' && <button type="button" className="btn btn-outline-success btn-sm"
                                disabled={conectado && (!escritura.habilitada || escritura.procesando)}
                                onClick={() => marcarComoEnviado(orden)}>Marcar enviado</button>}
                        </div></td>
                    </tr>)}</tbody>
                </table></div>
                <PaginacionAdmin datos={paginacion} seccion="órdenes" />
            </> : <p className="mb-0 text-body-secondary">No hay órdenes que coincidan con la consulta.</p>}
        </section>}
    </main>;
}
