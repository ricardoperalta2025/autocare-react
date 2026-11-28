import { useState } from 'react';
import { Link } from 'react-router-dom';
import { obtenerSesion, actualizarUsuarioPerfil } from '../services/usuariosService.js';
import { RUTA_CATALOGO_CONECTADO } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import EstadoEscrituraConectada from '../components/EstadoEscrituraConectada.jsx';
import { useConsultaConectada, useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { editarPerfilApi, obtenerPerfilApi } from '../services/operacionesApi.js';

const campos = [
    ['nombre', 'Nombre', 'text', 'given-name', ''],
    ['apellido', 'Apellido', 'text', 'family-name', ''],
    ['correo', 'Correo electrónico', 'email', 'email', ''],
    ['telefono', 'Teléfono', 'tel', 'tel', 'Ej: 912345678'],
    ['comuna', 'Comuna', 'text', 'address-level2', 'Ej: Puente Alto'],
    ['direccion', 'Dirección', 'text', 'street-address', 'Ej: Avenida Siempre Viva 123']
];

export default function Perfil({ conectado = false }) {
    if (conectado) return <PerfilConectado />;
    return <FormularioPerfil sesion={obtenerSesion()} />;
}

function PerfilConectado() {
    const consulta = useConsultaConectada(true, obtenerPerfilApi);
    if (consulta.datos) return <FormularioPerfil sesion={consulta.datos} conectado />;
    return <main className="tienda-contenedor tienda-pagina perfil-pagina">
        <h1>Mi perfil</h1><EstadoCatalogoAdmin consulta={consulta} mensajeCarga="Cargando perfil…" />
    </main>;
}

function FormularioPerfil({ sesion, conectado = false }) {
    const escritura = useEscrituraConectada();
    const { usuario, restaurarSesion } = useSesionConectada();
    // Mantiene intacto el nombre que se guardó antes de existir un apellido independiente.
    const [datos, setDatos] = useState(() => Object.fromEntries(campos.map(([campo]) => [campo, sesion?.[campo] ?? ''])));
    const [mensaje, setMensaje] = useState('');

    if (!sesion) return <main className="tienda-contenedor tienda-pagina"><p className="alert alert-warning">Debes iniciar sesión para ver tu perfil.</p></main>;

    async function guardar(evento) {
        evento.preventDefault();
        setMensaje('');
        if (conectado) {
            if (!await escritura.ejecutar(editarPerfilApi, datos)) return;
            await restaurarSesion({ forzar: true });
        } else {
            await actualizarUsuarioPerfil(sesion.id, datos);
        }
        setMensaje('Perfil actualizado correctamente.');
    }

    return <main className="tienda-contenedor tienda-pagina perfil-pagina" style={{ maxWidth: 780 }}>
        <Link className="tienda-regreso" to={conectado ? RUTA_CATALOGO_CONECTADO : '/'}><i className="bi bi-arrow-left" aria-hidden="true" /> Volver a la tienda</Link>
        <header className="tienda-encabezado"><div><h1>Mi perfil</h1><p className="text-body-secondary mb-0">Actualiza tus datos personales y de entrega.</p></div>
            {usuario?.rol && conectado && <span className="estado-pedido">{usuario.rol === 'ADMIN' ? 'Administración' : 'Cliente'}</span>}</header>
        <section className="tienda-panel">
            {conectado && <EstadoEscrituraConectada escritura={escritura} mensajeBloqueo="La edición del perfil no está disponible por el momento." />}
            {mensaje && <p className="alert alert-success" role="status">{mensaje}</p>}
            <form className="row g-3" onSubmit={guardar}>
                {campos.map(([campo, etiqueta, tipo, auto, ejemplo]) => <div className={campo === 'direccion' ? 'col-12' : 'col-md-6'} key={campo}>
                    <label className="form-label" htmlFor={'perfil-' + campo}>{etiqueta}</label>
                    <input id={'perfil-' + campo} type={tipo} autoComplete={auto} className="form-control" value={datos[campo]}
                        placeholder={ejemplo || undefined} required={['nombre', 'correo'].includes(campo) || (campo === 'apellido' && !conectado)}
                        onChange={(evento) => setDatos({ ...datos, [campo]: evento.target.value })} />
                    {campo === 'apellido' && conectado && !sesion.apellido && <small className="form-text">Si tu nombre incluye los apellidos, puedes separarlos aquí.</small>}
                </div>)}
                <div className="col-12">
                    <button type="submit" disabled={conectado && (!escritura.habilitada || escritura.procesando)} className="btn btn-danger">Guardar cambios</button>
                </div>
            </form>
        </section>
    </main>;
}
