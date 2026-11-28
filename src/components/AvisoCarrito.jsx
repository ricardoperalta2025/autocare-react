import { useEffect } from 'react';
import { Link } from 'react-router-dom';

export default function AvisoCarrito({ aviso, cerrar, rutaCarrito }) {
    useEffect(() => {
        if (!aviso) return;
        const tiempo = setTimeout(() => cerrar(null), 5000);
        return () => clearTimeout(tiempo);
    }, [aviso, cerrar]);

    if (!aviso) return null;
    const exito = aviso.cantidad > 0;

    return (
        <div className="aviso-carrito" role={exito ? 'status' : 'alert'}>
            <i className={exito ? 'bi bi-check-circle-fill aviso-icono' : 'bi bi-exclamation-circle-fill aviso-icono'} aria-hidden="true" />
            <div className="aviso-contenido">
                <strong>{exito ? 'Agregado al carrito' : 'No se pudo agregar'}</strong>
                <p className="mb-2">{exito ? aviso.nombre + ' × ' + aviso.cantidad : aviso.mensaje}</p>
                {exito && <div className="d-flex flex-wrap align-items-center gap-2">
                    <Link className="btn btn-danger btn-sm" to={rutaCarrito}>Ver carrito</Link>
                    <button type="button" className="btn btn-sm btn-link" onClick={() => cerrar(null)}>Seguir comprando</button>
                </div>}
            </div>
            <button type="button" className="btn-close" aria-label="Cerrar aviso" onClick={() => cerrar(null)} />
        </div>
    );
}
