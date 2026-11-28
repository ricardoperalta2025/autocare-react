import { useState } from 'react';
import { Link } from 'react-router-dom';
import { useBaseAdmin } from '../context/catalogo.js';

export const pesosAdmin = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 16 });

export function EncabezadoAdmin({ titulo, descripcion, children, regreso, textoRegreso = 'Volver al panel' }) {
    const baseAdmin = useBaseAdmin();
    return <>
        {regreso !== false && <Link className="tienda-regreso" to={regreso ?? baseAdmin}>
            <i className="bi bi-arrow-left" aria-hidden="true" /> {textoRegreso}
        </Link>}
        <header className="tienda-encabezado">
            <div><h1>{titulo}</h1>{descripcion && <p className="text-body-secondary mb-0">{descripcion}</p>}</div>
            {children}
        </header>
    </>;
}

export function EtiquetaAdmin({ estado }) {
    const clase = ['Enviado', 'Resuelta', 'Normal', 'Disponible', 'Entregado'].includes(estado) ? ' enviado' :
        estado === 'Agotado' ? ' agotado' : estado === 'En revisión' ? ' revision' : '';
    return <span className={'estado-pedido' + clase}>{estado}</span>;
}

export function ReferenciaAdmin({ id }) {
    return <span className="admin-referencia" title={String(id)}>{'#' + String(id).slice(-8)}</span>;
}

export function usePaginaAdmin(registros) {
    const [pagina, setPagina] = useState(1);
    const [porPagina, setPorPagina] = useState(10);
    const total = registros.length;
    const paginas = Math.max(1, Math.ceil(total / porPagina));
    const actual = Math.min(pagina, paginas);
    const inicio = (actual - 1) * porPagina;
    const fin = Math.min(inicio + porPagina, total);
    return {
        filas: registros.slice(inicio, fin), total, actual, paginas, inicio, fin, porPagina, setPagina,
        cambiarTamano: (valor) => { setPorPagina(valor); setPagina(1); }
    };
}

export function PaginacionAdmin({ datos, seccion }) {
    return <div className="admin-paginacion" role="navigation" aria-label={'Paginación de ' + seccion}>
        <p className="mb-0" aria-live="polite">
            {datos.total === 1 ? 'Mostrando 1 de 1 registro' :
                datos.total ? `Mostrando ${datos.inicio + 1}–${datos.fin} de ${datos.total} registros` : '0 registros'}
        </p>
        <div className="admin-pagina-acciones">
            <label>Por página
                <select className="form-select" aria-label={'Registros por página de ' + seccion}
                    value={datos.porPagina} onChange={(evento) => datos.cambiarTamano(Number(evento.target.value))}>
                    {[10, 20, 50].map((tamano) => <option key={tamano}>{tamano}</option>)}
                </select>
            </label>
            {datos.paginas > 1 && <>
                <button className="btn btn-outline-secondary" disabled={datos.actual <= 1}
                    onClick={() => datos.setPagina(datos.actual - 1)}>Anterior</button>
                <span>{datos.actual} de {datos.paginas}</span>
                <button className="btn btn-outline-secondary" disabled={datos.actual >= datos.paginas}
                    onClick={() => datos.setPagina(datos.actual + 1)}>Siguiente</button>
            </>}
        </div>
    </div>;
}
