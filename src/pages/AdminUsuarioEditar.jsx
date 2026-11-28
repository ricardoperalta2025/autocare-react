import { useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { obtenerUsuarioPorId, actualizarUsuarioAdmin } from '../services/usuariosService.js';
import { useBaseAdmin } from '../context/catalogo.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { EncabezadoAdmin } from '../components/AdminInterfaz.jsx';
import EstadoEscrituraConectada from '../components/EstadoEscrituraConectada.jsx';
import { useConsultaConectada, useEscrituraConectada } from '../hooks/useOperacionesConectadas.js';
import { editarClienteApi, obtenerClienteApi } from '../services/operacionesApi.js';

const campos = [['nombre', 'Nombre'], ['apellido', 'Apellido'], ['correo', 'Correo'], ['telefono', 'Teléfono'],
    ['comuna', 'Comuna'], ['direccion', 'Dirección']];

export default function AdminUsuarioEditar({ conectado = false }) {
    const { id } = useParams();
    const base = useBaseAdmin() + '/usuarios';
    const consulta = useConsultaConectada(conectado, obtenerClienteApi, id);
    const usuario = conectado ? consulta.datos : obtenerUsuarioPorId(id);
    const valido = usuario && (conectado || usuario.rol === 'cliente');

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Editar Usuario" descripcion="Actualiza los datos del cliente."
            regreso={valido ? base + '/' + id : base} textoRegreso={valido ? 'Volver al cliente' : 'Volver a usuarios'} />
        {conectado && <EstadoCatalogoAdmin consulta={consulta} />}
        {!conectado && !valido && <p role="alert" className="alert alert-warning">Usuario no encontrado.</p>}
        {valido && <FormularioEdicion key={id} usuario={usuario} conectado={conectado} destino={base + '/' + id} />}
    </main>;
}

function FormularioEdicion({ usuario, conectado, destino }) {
    const escritura = useEscrituraConectada();
    const navigate = useNavigate();
    const [error, setError] = useState('');
    const [formulario, setFormulario] = useState(() => Object.fromEntries(campos.map(([campo]) => [campo, usuario[campo] ?? ''])));

    async function guardar(evento) {
        evento.preventDefault();
        setError('');
        if (conectado) {
            if (!await escritura.ejecutar(editarClienteApi, usuario.id, formulario)) return;
        } else {
            const resultado = await actualizarUsuarioAdmin(usuario.id, formulario);
            if (!resultado.exito) { setError(resultado.mensaje); return; }
        }
        navigate(destino, { state: { confirmacion: 'Datos del cliente actualizados.' } });
    }

    return <section className="tienda-panel">
        {conectado && <EstadoEscrituraConectada escritura={escritura} />}
        {error && <p className="alert alert-danger" role="alert">{error}</p>}
        <form onSubmit={guardar}>
            <fieldset disabled={conectado && (!escritura.habilitada || escritura.procesando)} className="row g-3">
                {campos.map(([campo, etiqueta]) => <div className="col-md-6" key={campo}>
                    <label className="form-label" htmlFor={campo}>{etiqueta}</label>
                    <input id={campo} className="form-control" name={campo} type={campo === 'correo' ? 'email' : campo === 'telefono' ? 'tel' : 'text'}
                        value={formulario[campo]} onChange={(evento) => setFormulario({ ...formulario, [campo]: evento.target.value })}
                        required={['nombre', 'correo'].includes(campo) || (campo === 'apellido' && !conectado)} />
                </div>)}
                <div className="col-12"><button type="submit" className="btn btn-danger">Guardar cambios</button></div>
            </fieldset>
        </form>
    </section>;
}
