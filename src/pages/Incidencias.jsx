import { Link } from 'react-router-dom';
import { obtenerIncidenciasUsuario } from '../services/incidenciasService.js';
import { obtenerSesion } from '../services/usuariosService.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { RUTA_INCIDENCIAS_CONECTADAS, RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { useConsultaConectada } from '../hooks/useOperacionesConectadas.js';
import { formatearRegistro, listarIncidenciasApi } from '../services/operacionesApi.js';

export default function Incidencias({ conectado = false }) {
    const { usuario } = useSesionConectada();
    const consulta = useConsultaConectada(conectado, listarIncidenciasApi);
    const sesion = conectado ? usuario : obtenerSesion();
    const incidencias = conectado ? (consulta.datos ?? []).map(formatearRegistro) : sesion ? obtenerIncidenciasUsuario(sesion) : [];
    const nueva = conectado ? RUTA_INCIDENCIAS_CONECTADAS + '/nueva' : '/incidencias/nueva';
    const ordenes = conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes';

    if (!sesion) return <main className="tienda-contenedor tienda-pagina">
        <p className="alert alert-warning">Debes iniciar sesión para consultar tus incidencias.</p>
        <Link to="/login" className="btn btn-danger">Iniciar sesión</Link>
    </main>;

    return <main className="tienda-contenedor tienda-pagina">
        <header className="tienda-encabezado"><div>
            <h1>Mis incidencias</h1><p className="text-body-secondary mb-0">Consulta las solicitudes relacionadas con tus pedidos.</p>
        </div><Link to={nueva} className="btn btn-danger"><i className="bi bi-plus-lg" aria-hidden="true" /> Nueva incidencia</Link></header>
        {conectado && <EstadoCatalogoAdmin consulta={consulta} mensajeCarga="Cargando incidencias…" />}
        {(!conectado || consulta.datos) && (incidencias.length ? <div className="incidencias-lista">
            {incidencias.map((incidencia) => <details className="tienda-panel incidencia" key={incidencia.id}>
                <summary>
                    <div><strong>{incidencia.asunto}</strong><small>{incidencia.fecha}</small></div>
                    <span className={'estado-pedido' + (incidencia.estado === 'Resuelta' ? ' enviado' : incidencia.estado === 'En revisión' ? ' revision' : '')}>{incidencia.estado}</span>
                    <i className="bi bi-chevron-down" aria-hidden="true" />
                </summary>
                <div className="incidencia-datos">
                    <p>{incidencia.descripcion || 'Sin descripción registrada.'}</p>
                    {incidencia.ordenId && <Link to={ordenes + '/' + incidencia.ordenId}>Ver orden #{String(incidencia.ordenId).slice(-8)}</Link>}
                    {conectado && <div className="admin-incidencia-datos mt-3">
                        <h2 className="h6">Respuesta de atención al cliente</h2>
                        <p className="incidencia-respuesta mb-0">{incidencia.respuestaAdmin || 'Todavía no hay una respuesta.'}</p>
                    </div>}
                </div>
            </details>)}
        </div> : <p className="tienda-vacio">No tienes incidencias registradas.</p>)}
    </main>;
}
