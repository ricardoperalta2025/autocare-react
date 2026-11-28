import { useEffect, useState } from 'react';
import { Link, NavLink, useLocation, useMatch, useNavigate } from 'react-router-dom';
import { obtenerSesion, cerrarSesion } from '../services/usuariosService.js';
import { useCarrito } from '../context/CarritoContext.jsx';
import { RUTA_ADMIN_CONECTADA, RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO,
    RUTA_LOGIN_CONECTADO, RUTA_ORDENES_CONECTADAS, RUTA_PERFIL_CONECTADO,
    RUTA_INCIDENCIAS_CONECTADAS, RUTA_CONTACTO_CONECTADO } from '../context/catalogo.js';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { useSesionConectada } from '../context/sesionConectada.js';

export default function Navbar() {
    const rutaConectada = Boolean(useMatch(RUTA_CATALOGO_CONECTADO + '/*'));
    const { key, pathname } = useLocation();
    const [menuAbierto, setMenuAbierto] = useState(null);
    const abierto = menuAbierto === key;
    useEffect(() => { window.scrollTo(0, 0); }, [pathname]);
    const navegar = useNavigate();
    const sesionConectada = useSesionConectada();
    const { demostracion } = sesionConectada;
    const conectado = demostracion || rutaConectada;
    const sesion = conectado ? sesionConectada.usuario : obtenerSesion();
    const vendedor = conectado && sesion?.rol === 'VENDEDOR';
    const local = useCarrito();
    const remoto = useCarritoConectado();
    const productos = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';
    const cantidad = conectado ? remoto.cantidadTotal : local.cantidadTotal;

    const enlaces = [
        ...(!vendedor && !demostracion ? [['/', 'Inicio']] : []),
        [productos, 'Productos'],
        ...(!vendedor ? [[conectado ? productos + '/categorias' : '/categorias', 'Categorías'],
            [conectado ? productos + '/ofertas' : '/ofertas', 'Ofertas']] : []),
        [conectado ? RUTA_ORDENES_CONECTADAS : '/ordenes',
            conectado && ['ADMIN', 'VENDEDOR'].includes(sesion?.rol) ? 'Órdenes' : 'Mis órdenes'],
        ...(['cliente', 'CLIENTE'].includes(sesion?.rol)
            ? [[conectado ? RUTA_INCIDENCIAS_CONECTADAS : '/incidencias', 'Mis incidencias']] : []),
        ...(sesion?.rol === (conectado ? 'ADMIN' : 'admin')
            ? [[conectado ? RUTA_ADMIN_CONECTADA : '/admin', 'Administración']] : []),
        ...(!vendedor && !demostracion ? [['/nosotros', 'Nosotros'], ['/blog', 'Blog']] : []),
        ...(!vendedor ? [[conectado ? RUTA_CONTACTO_CONECTADO : '/contacto', 'Contacto']] : [])
    ];

    function salir() {
        setMenuAbierto(null);
        if (conectado) {
            sesionConectada.cerrarSesion();
            navegar(vendedor ? RUTA_LOGIN_CONECTADO : RUTA_CATALOGO_CONECTADO, { replace: true });
        } else {
            cerrarSesion();
            window.location.href = '/';
        }
    }

    const identidad = <><i className="bi bi-person-circle" aria-hidden="true" /><span>{sesion?.nombre}</span></>;

    return <nav className="tienda-nav" aria-label="Navegación principal">
        <div className="tienda-contenedor navegacion-distribucion">
            <Link to={conectado ? productos : '/'} aria-label="AutoCarePro" className="tienda-marca" onClick={() => setMenuAbierto(null)}>
                <span className="marca-icono"><i className="bi bi-speedometer2" aria-hidden="true" /></span>
                AutoCare<span className="marca-pro">Pro</span>
            </Link>
            <div id="tienda-menu" className={'tienda-menu' + (abierto ? ' abierto' : '')}>
                <div className="tienda-enlaces">
                    {enlaces.map(([ruta, nombre]) => <NavLink key={ruta} to={ruta} end className="tienda-enlace"
                        onClick={() => setMenuAbierto(null)}>{nombre}</NavLink>)}
                </div>
                <div className="tienda-cuenta">
                    {sesion ? <>
                        {vendedor ? <span className="nav-identidad" title={sesion.nombre}>{identidad}</span> :
                            <Link to={conectado ? RUTA_PERFIL_CONECTADO : '/perfil'} title={sesion.nombre}
                                className="nav-identidad" onClick={() => setMenuAbierto(null)}>{identidad}</Link>}
                        <button type="button" className="nav-icono nav-salir" aria-label="Cerrar sesión" title="Cerrar sesión" onClick={salir}>
                            <i className="bi bi-box-arrow-right" aria-hidden="true" /><span>Cerrar sesión</span>
                        </button>
                    </> : <Link className="nav-identidad" to={conectado ? RUTA_LOGIN_CONECTADO : '/login'}
                        onClick={() => setMenuAbierto(null)}><i className="bi bi-person-circle" aria-hidden="true" /><span>Iniciar sesión</span></Link>}
                </div>
            </div>
            <div className="nav-herramientas">
                {!vendedor && <Link className="nav-icono nav-carrito" to={conectado ? RUTA_CARRITO_CONECTADO : '/carrito'}
                    aria-label="Carrito" onClick={() => setMenuAbierto(null)}>
                    <i className="bi bi-cart3" aria-hidden="true" /><span aria-hidden="true">{cantidad}</span>
                </Link>}
                <button type="button" className="nav-icono nav-menu-boton" aria-expanded={abierto} aria-controls="tienda-menu"
                    aria-label={abierto ? 'Cerrar navegación' : 'Abrir navegación'} onClick={() => setMenuAbierto(abierto ? null : key)}>
                    <i className={abierto ? 'bi bi-x-lg' : 'bi bi-list'} aria-hidden="true" />
                </button>
            </div>
        </div>
    </nav>;
}
