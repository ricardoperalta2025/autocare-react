import { useState } from 'react';
import { Link, useLocation, useNavigate, useOutletContext } from 'react-router-dom';
import { useCarrito } from '../context/CarritoContext.jsx';
import { RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO, RUTA_COMPRA_CONECTADA } from '../context/catalogo.js';
import { obtenerSesion } from '../services/usuariosService.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import ResumenCompra from '../components/ResumenCompra.jsx';

const campos = [
    ['nombre', 'Nombre completo', 'text', 150, 'name'],
    ['correo', 'Correo electrónico', 'email', 254, 'email'],
    ['telefono', 'Teléfono', 'tel', 30, 'tel'],
    ['comuna', 'Comuna', 'text', 100, 'address-level2'],
    ['direccion', 'Dirección de entrega', 'text', 300, 'street-address']
];

export default function Checkout({ conectado = false }) {
    const [error, setError] = useState('');
    const local = useCarrito();
    const revision = useOutletContext();
    const carrito = conectado ? revision.lineas : local.carrito;
    const total = conectado ? revision.total : local.total;
    const { state } = useLocation();
    const navegar = useNavigate();
    const sesionRemota = useSesionConectada();
    const sesion = conectado ? sesionRemota.usuario : obtenerSesion();
    const previa = conectado && state?.compradorId === sesion?.id ? state : null;
    const [datosCliente, setDatosCliente] = useState(previa?.datosCliente ?? {
        nombre: [sesion?.nombre, sesion?.apellido].filter(Boolean).join(' '),
        correo: sesion?.correo || '', telefono: sesion?.telefono || '',
        comuna: sesion?.comuna || '', direccion: sesion?.direccion || ''
    });
    const [tipoEntrega, setTipoEntrega] = useState(previa?.tipoEntrega ?? '');
    const rutaCarrito = conectado ? RUTA_CARRITO_CONECTADO : '/carrito';

    function continuar(evento) {
        evento.preventDefault();
        if (!carrito.length || (conectado && !revision.puedeContinuar)) return;
        if (campos.some(([campo]) => !datosCliente[campo]?.trim()) || !tipoEntrega.trim()) {
            setError('Completa todos los datos de entrega con un valor válido.');
            return;
        }
        const entrega = Object.fromEntries(campos.map(([campo]) => [campo, datosCliente[campo].trim()]));
        navegar(conectado ? RUTA_COMPRA_CONECTADA : '/pago', {
            state: conectado ? { datosCliente: entrega, tipoEntrega, compradorId: sesion.id } : { datosCliente: entrega, tipoEntrega }
        });
    }

    if (!carrito.length) return <main className="tienda-contenedor tienda-pagina">
        <section className="tienda-vacio">
            <h1>Tu carrito está vacío</h1><p>Agrega al menos un producto antes de continuar.</p>
            <Link className="btn btn-danger" to={conectado ? RUTA_CATALOGO_CONECTADO : '/productos'}>Ver productos</Link>
            {conectado && <Link className="btn btn-outline-dark ms-2" to={rutaCarrito}>Revisar carrito</Link>}
        </section>
    </main>;

    return <main className="tienda-contenedor tienda-pagina">
        <Link className="tienda-regreso" to={rutaCarrito}><i className="bi bi-arrow-left" aria-hidden="true" /> Volver al carrito</Link>
        <header className="tienda-encabezado"><div><h1>{conectado ? 'Finalizar compra' : 'Checkout'}</h1>
            <p className="text-body-secondary mb-0">Completa la entrega y revisa tu pedido.</p></div></header>
        <form className="compra-distribucion" onSubmit={continuar}>
            <section className="tienda-panel checkout-formulario">
                <h2><i className="bi bi-truck" aria-hidden="true" /> Datos de entrega</h2>
                {sesion && <p className="text-body-secondary">Puedes ajustar los datos de tu perfil para este pedido.</p>}
                {error && <p className="alert alert-danger" role="alert">{error}</p>}
                <div className="row g-3">
                    {campos.map(([campo, etiqueta, tipo, maximo, auto]) => <div key={campo} className={campo === 'direccion' ? 'col-12' : 'col-md-6'}>
                        <label htmlFor={campo} className="form-label">{etiqueta}</label>
                        <input className="form-control" id={campo} name={campo} type={tipo} autoComplete={auto}
                            maxLength={conectado ? maximo : undefined} value={datosCliente[campo]} required
                            onChange={(evento) => setDatosCliente({ ...datosCliente, [campo]: evento.target.value })} />
                    </div>)}
                    <div className="col-12">
                        <label htmlFor="tipoEntrega" className="form-label">Método de entrega</label>
                        <select id="tipoEntrega" className="form-select" value={tipoEntrega} onChange={(evento) => setTipoEntrega(evento.target.value)} required>
                            <option value="">Selecciona una opción</option>
                            <option value="Envío estándar">Envío estándar - 2 a 5 días hábiles</option>
                            <option value="Envío express">Envío express - 24 a 48 horas</option>
                        </select>
                    </div>
                </div>
            </section>
            <ResumenCompra lineas={carrito} total={total} estimado={conectado} mostrarDetalle>
                <p className="nota-compra"><i className="bi bi-info-circle" aria-hidden="true" /> Compra y pago simulados.</p>
                <button type="submit" className="btn btn-danger w-100" disabled={conectado && !revision.puedeContinuar}>
                    {conectado ? 'Revisar compra' : 'Continuar al pago'}
                </button>
            </ResumenCompra>
        </form>
    </main>;
}
