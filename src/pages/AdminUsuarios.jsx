import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerClientes } from '../services/usuariosService.js';
import { useBaseAdmin } from '../context/catalogo.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { EncabezadoAdmin, PaginacionAdmin, usePaginaAdmin } from '../components/AdminInterfaz.jsx';
import { useConsultaConectada } from '../hooks/useOperacionesConectadas.js';
import { listarClientesApi } from '../services/operacionesApi.js';

export default function AdminUsuarios({ conectado = false }) {
    const base = useBaseAdmin() + '/usuarios';
    const consulta = useConsultaConectada(conectado, listarClientesApi);
    const [busqueda, setBusqueda] = useState('');
    const clientes = conectado ? consulta.datos ?? [] : obtenerClientes();
    const termino = busqueda.trim().toLowerCase();
    const resultados = clientes.filter((cliente) =>
        [`${cliente.nombre} ${cliente.apellido ?? ''}`, cliente.correo, cliente.comuna].some((dato) => dato?.toLowerCase().includes(termino)));
    const paginacion = usePaginaAdmin(resultados);

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Administración de Usuarios" descripcion={`Clientes registrados: ${conectado && !consulta.datos ? '—' : clientes.length}`}>
            <Link to={base + '/nuevo'} className="btn btn-danger"><i className="bi bi-person-plus me-2" aria-hidden="true" />Nuevo usuario</Link>
        </EncabezadoAdmin>
        {conectado && <EstadoCatalogoAdmin consulta={consulta} />}
        {(!conectado || consulta.datos) && <section className="tienda-panel">
            <label className="d-block mb-3">Buscar cliente
                <input className="form-control" placeholder="Nombre, correo o comuna" value={busqueda}
                    onChange={(evento) => { setBusqueda(evento.target.value); paginacion.setPagina(1); }} />
            </label>
            {resultados.length ? <>
                <div className="table-responsive"><table className="table admin-tabla align-middle">
                    <thead><tr><th>Nombre</th><th>Correo</th><th>Teléfono</th><th>Comuna</th><th>Acciones</th></tr></thead>
                    <tbody>{paginacion.filas.map((cliente) => <tr key={cliente.id}>
                        <td><strong>{[cliente.nombre, cliente.apellido].filter(Boolean).join(' ')}</strong></td>
                        <td>{cliente.correo}</td><td>{cliente.telefono || '—'}</td><td>{cliente.comuna || '—'}</td>
                        <td><div className="admin-acciones">
                            <Link className="btn btn-outline-secondary btn-sm" to={base + '/' + cliente.id}>Ver detalle</Link>
                            <Link className="btn btn-outline-primary btn-sm" to={base + '/' + cliente.id + '/editar'}>Editar</Link>
                        </div></td>
                    </tr>)}</tbody>
                </table></div>
                <PaginacionAdmin datos={paginacion} seccion="clientes" />
            </> : <p className="mb-0 text-body-secondary">No hay clientes que coincidan con la búsqueda.</p>}
        </section>}
    </main>;
}
