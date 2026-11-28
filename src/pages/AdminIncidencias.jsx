import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerIncidencias, actualizarEstadoIncidencia } from '../services/incidenciasService.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import EstadoEscrituraConectada from '../components/EstadoEscrituraConectada.jsx';
import { EncabezadoAdmin, EtiquetaAdmin, PaginacionAdmin, ReferenciaAdmin, usePaginaAdmin } from '../components/AdminInterfaz.jsx';
import { useConsultaConectada, useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { actualizarIncidenciaApi, formatearRegistro, listarIncidenciasApi, resolverIncidenciaApi } from '../services/operacionesApi.js';
import { RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';

const estados = { PENDIENTE: 'Pendiente', EN_REVISION: 'En revisión', RESUELTA: 'Resuelta' };

export default function AdminIncidencias({ conectado = false }) {
    const consulta = useConsultaConectada(conectado, listarIncidenciasApi);
    const escritura = useEscrituraConectada();
    const [local, setLocal] = useState(() => conectado ? [] : obtenerIncidencias());
    const [filtro, setFiltro] = useState('');
    const [activa, setActiva] = useState(null);
    const [aviso, setAviso] = useState('');
    const incidencias = conectado ? (consulta.datos ?? []).map(formatearRegistro) : local;
    const resultados = incidencias.filter((incidencia) => !filtro || incidencia.estado === filtro);
    const paginacion = usePaginaAdmin(resultados);

    async function resolver(id) {
        if (!window.confirm('¿Deseas marcar esta incidencia como resuelta?')) return;
        setAviso('');
        if (conectado) {
            if (!await escritura.ejecutar(resolverIncidenciaApi, id)) return;
            consulta.recargar();
        } else {
            actualizarEstadoIncidencia(id, 'Resuelta');
            setLocal(obtenerIncidencias());
        }
        setAviso('Incidencia resuelta.');
    }

    async function guardar(id, datos) {
        setAviso('');
        if (await escritura.ejecutar(actualizarIncidenciaApi, id, datos)) {
            consulta.recargar();
            setAviso('Incidencia actualizada.');
        }
    }

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Administración de Incidencias" descripcion={`Incidencias registradas: ${conectado && !consulta.datos ? '—' : incidencias.length}`} />
        {conectado && <EstadoCatalogoAdmin consulta={consulta} />}
        {conectado && <EstadoEscrituraConectada escritura={escritura} mensajeBloqueo="La gestión de incidencias no está disponible por el momento." />}
        {aviso && <p className="alert alert-success" role="status">{aviso}</p>}
        {(!conectado || consulta.datos) && <section className="tienda-panel">
            <label className="d-inline-block mb-2">Filtrar incidencias por estado
                <select className="form-select" value={filtro} onChange={(evento) => {
                    setFiltro(evento.target.value);
                    paginacion.setPagina(1);
                }}><option value="">Todos</option>{Object.values(estados).filter((estado) => conectado || estado !== 'En revisión')
                    .map((estado) => <option key={estado}>{estado}</option>)}</select>
            </label>
            {resultados.length ? <>
                {paginacion.filas.map((incidencia) => <details className="admin-incidencia" key={incidencia.id} open={activa === incidencia.id}>
                    <summary onClick={(evento) => {
                        evento.preventDefault();
                        setActiva(activa === incidencia.id ? null : incidencia.id);
                    }}><strong>{incidencia.asunto}</strong> <EtiquetaAdmin estado={incidencia.estado} /></summary>
                    <div className="admin-incidencia-datos">
                        <div className="d-flex flex-wrap gap-2 mb-2">
                            <span className="admin-fecha">{incidencia.fecha}</span>
                            {incidencia.ordenId && <Link to={(conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes') + '/' + incidencia.ordenId}>
                                Ver orden <ReferenciaAdmin id={incidencia.ordenId} />
                            </Link>}
                        </div>
                        <p>{incidencia.descripcion}</p>
                        {conectado && <FormularioGestion key={`${incidencia.estado}:${incidencia.fechaActualizacion ?? ''}`}
                            incidencia={incidencia} escritura={escritura} guardar={guardar} />}
                        {incidencia.estado !== 'Resuelta' && <button type="button" className="btn btn-outline-success mt-2"
                            disabled={conectado && (!escritura.habilitada || escritura.procesando)}
                            onClick={() => resolver(incidencia.id)}>Marcar resuelta</button>}
                    </div>
                </details>)}
                <PaginacionAdmin datos={paginacion} seccion="incidencias" />
            </> : <p className="mb-0 text-body-secondary">No hay incidencias que coincidan con el estado.</p>}
        </section>}
    </main>;
}

function FormularioGestion({ incidencia, escritura, guardar }) {
    const inicial = Object.keys(estados).find((estado) => estados[estado] === incidencia.estado) ?? 'PENDIENTE';
    const [estado, setEstado] = useState(inicial);
    const [respuesta, setRespuesta] = useState(incidencia.respuestaAdmin ?? '');
    return <form onSubmit={(evento) => {
        evento.preventDefault();
        const datos = { estado };
        if (respuesta !== (incidencia.respuestaAdmin ?? '')) datos.respuestaAdmin = respuesta;
        guardar(incidencia.id, datos);
    }}>
        <fieldset disabled={!escritura.habilitada || escritura.procesando} className="row g-2">
            <label className="col-md-4">Estado
                <select className="form-select" value={estado} onChange={(evento) => setEstado(evento.target.value)}>
                    {Object.entries(estados).slice(Object.keys(estados).indexOf(inicial)).map(([valor, nombre]) =>
                        <option value={valor} key={valor}>{nombre}</option>)}
                </select>
            </label>
            <label className="col-md-8">Respuesta administrativa
                <textarea className="form-control" rows={3} maxLength={2000} value={respuesta}
                    onChange={(evento) => setRespuesta(evento.target.value)} />
            </label>
            <div className="col-12"><button className="btn btn-danger" type="submit">Guardar gestión</button></div>
        </fieldset>
    </form>;
}
