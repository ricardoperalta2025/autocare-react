import { Link, useMatch } from 'react-router-dom';
import { RUTA_CATALOGO_CONECTADO, RUTA_CONTACTO_CONECTADO, RUTA_ORDENES_CONECTADAS } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';

export default function Footer() {
    const { usuario, demostracion } = useSesionConectada();
    const rutaConectada = useMatch(RUTA_CATALOGO_CONECTADO + '/*');
    const conectado = demostracion || Boolean(rutaConectada);
    const vendedor = conectado && usuario?.rol === 'VENDEDOR';
    const productos = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';

    return <footer className="tienda-footer">
        <div className="tienda-contenedor">
            <div className="footer-distribucion">
                <div>
                    <Link className="tienda-marca" to={productos}><span className="marca-icono"><i className="bi bi-speedometer2" aria-hidden="true" /></span>
                        AutoCare<span className="marca-pro">Pro</span></Link>
                    <p>Repuestos y accesorios automotrices.</p>
                    <p className="footer-nota">Tienda demostrativa · Compras y pagos simulados.</p>
                </div>
                <div>
                    <h2>Tienda</h2>
                    <Link to={productos}>Explorar productos</Link>
                    {vendedor ? <Link to={RUTA_ORDENES_CONECTADAS}>Consultar órdenes</Link> : <>
                        <Link to={conectado ? productos + '/categorias' : '/categorias'}>Ver categorías</Link>
                        <Link to={conectado ? productos + '/ofertas' : '/ofertas'}>Ver promociones</Link>
                    </>}
                </div>
                {!vendedor && <div>
                    <h2>Contacto demostrativo</h2>
                    <p><i className="bi bi-geo-alt" aria-hidden="true" /> Santiago, Región Metropolitana</p>
                    <p><i className="bi bi-clock" aria-hidden="true" /> Lun–vie, 09:00–18:00</p>
                    <p><i className="bi bi-envelope" aria-hidden="true" /> contacto@autocarepro.example</p>
                    <Link to={conectado ? RUTA_CONTACTO_CONECTADO : '/contacto'}>Formulario de contacto</Link>
                </div>}
            </div>
            <p className="footer-derechos">© {new Date().getFullYear()} AutoCarePro</p>
        </div>
    </footer>;
}
