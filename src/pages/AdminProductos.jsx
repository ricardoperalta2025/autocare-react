import { useRef, useState } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { useBaseAdmin } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { adminCatalogoApi, listarProductosAdmin, mensajeErrorAdmin } from '../services/adminCatalogoApi.js';
import { eliminarProducto, mostrarImagenProductoAlternativa, obtenerImagenProducto, obtenerPrecioFinalProducto, obtenerProductos, productoTieneStockCritico } from '../services/productosService.js';
import { AvisoEscriturasAdmin, EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { EncabezadoAdmin, EtiquetaAdmin, PaginacionAdmin, usePaginaAdmin } from '../components/AdminInterfaz.jsx';

const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP', maximumFractionDigits: 0 });

export default function AdminProductos({ conectado = false, cliente = adminCatalogoApi }) {
    const baseAdmin = useBaseAdmin();
    const { state } = useLocation();
    const { usuario, solicitar } = useSesionConectada();
    const consulta = useConsultaCatalogoAdmin(conectado, listarProductosAdmin);
    const [local, setLocal] = useState(() => conectado ? [] : obtenerProductos());
    const [aviso, setAviso] = useState(() => state?.confirmacion);
    const [error, setError] = useState('');
    const [borrando, setBorrando] = useState(false);
    const ocupado = useRef(false);
    const [busqueda, setBusqueda] = useState('');
    const [categoria, setCategoria] = useState('');
    const productos = conectado ? consulta.datos : local;
    const puedeCrear = !conectado || (usuario?.rol === 'ADMIN' && cliente.habilitada);
    const tipoCategoria = (producto) => conectado ? producto.categoriaId : producto.categoria;
    const categorias = new Map((productos ?? []).map((producto) => [tipoCategoria(producto), producto.categoria]));
    const categoriaActiva = categorias.has(categoria) ? categoria : '';
    const termino = busqueda.trim().toLowerCase();
    const resultados = (productos ?? []).filter((producto) =>
        (!categoriaActiva || tipoCategoria(producto) === categoriaActiva) &&
        [producto.codigo, producto.nombre, producto.descripcion].some((campo) => campo?.toLowerCase().includes(termino)));
    const paginacion = usePaginaAdmin(resultados);

    async function confirmarEliminacion(producto) {
        if (ocupado.current || !puedeCrear || (conectado && !cliente.puedeEditar('productos', producto))) return;
        if (!window.confirm(`¿Estás seguro de eliminar el producto "${producto.nombre}"?`)) return;
        setError('');
        setAviso('');
        if (!conectado) {
            setLocal(eliminarProducto(producto.id));
            setAviso('Producto eliminado.');
            return;
        }

        ocupado.current = true;
        setBorrando(true);
        try {
            await solicitar((token) => cliente.eliminarProducto(producto.id, token), usuario.id);
            setAviso('Producto eliminado.');
            consulta.recargar();
        } catch (causa) {
            setError(mensajeErrorAdmin(causa));
        } finally {
            ocupado.current = false;
            setBorrando(false);
        }
    }

    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <EncabezadoAdmin titulo="Administración de Productos" descripcion={`Productos registrados: ${productos?.length ?? '—'}`}>
            {puedeCrear ? <Link to={`${baseAdmin}/productos/nuevo`} className="btn btn-danger">
                <i className="bi bi-plus-circle me-2"></i>Nuevo producto
            </Link> : <button type="button" className="btn btn-danger" disabled>Nuevo producto</button>}
        </EncabezadoAdmin>
        {conectado && <AvisoEscriturasAdmin habilitada={cliente.habilitada} soloTemporales={cliente.soloTemporales} />}
        {aviso && <p role="status" className="alert alert-success">{aviso}</p>}
        {error && <p role="alert" className="alert alert-danger">{error}</p>}
        <EstadoCatalogoAdmin consulta={consulta} />
        {productos && <section className="tienda-panel">
            <div className="row g-3 mb-3">
                <div className="col-md-6">
                    <label htmlFor="buscar-producto-admin" className="form-label">Buscar producto</label>
                    <input id="buscar-producto-admin" className="form-control" value={busqueda}
                        onChange={(evento) => { setBusqueda(evento.target.value); paginacion.setPagina(1); }} />
                </div>
                <div className="col-md-6">
                    <label htmlFor="filtro-categoria-admin" className="form-label">Filtrar por categoría</label>
                    <select id="filtro-categoria-admin" className="form-select" value={categoriaActiva}
                        onChange={(evento) => { setCategoria(evento.target.value); paginacion.setPagina(1); }}>
                        <option value="">Todas las categorías</option>
                        {[...categorias].map(([id, nombre]) => <option key={id} value={id}>{nombre}</option>)}
                    </select>
                </div>
            </div>
            {resultados.length ? <div className="table-responsive"><table className="table admin-tabla admin-tabla-productos align-middle" role="table">
                <thead role="rowgroup"><tr role="row">
                    <th>Código</th><th>Producto</th><th>Categoría</th><th className="text-end">Precio</th>
                    <th className="text-center">Stock</th><th className="text-center">Estado</th><th className="text-center">Acciones</th>
                </tr></thead>
                <tbody role="rowgroup">{paginacion.filas.map((producto) => {
                    const puedeEditar = puedeCrear && (!conectado || cliente.puedeEditar('productos', producto));
                    const agotado = producto.stock <= 0;
                    const critico = productoTieneStockCritico(producto);
                    return <tr role="row" key={producto.id}>
                        <td role="cell" data-etiqueta="Código">{producto.codigo}</td>
                        <td role="cell"><div className="admin-producto">
                            <img className="admin-miniatura" src={obtenerImagenProducto(producto)} alt="" loading="lazy"
                                onError={(evento) => mostrarImagenProductoAlternativa(evento, producto.imagen)} />
                            <div><strong>{producto.nombre}</strong><div className="small text-muted">{producto.descripcion}</div></div>
                        </div></td>
                        <td role="cell" data-etiqueta="Categoría">{producto.categoria}</td>
                        <td role="cell" data-etiqueta="Precio" className="text-end">{pesos.format(producto.precio)}
                            {producto.descuento > 0 && <div className="small text-muted">
                                {producto.descuento}% · {pesos.format(conectado ? producto.precioFinal : obtenerPrecioFinalProducto(producto))}
                            </div>}
                        </td>
                        <td role="cell" data-etiqueta="Stock" className="text-center">{producto.stock}</td>
                        <td role="cell" data-etiqueta="Estado" className="text-center"><EtiquetaAdmin estado={agotado ? 'Agotado' : critico ? 'Stock crítico' : 'Disponible'} /></td>
                        <td role="cell" className="text-center">
                            <div className="admin-acciones justify-content-center">
                                {puedeEditar ? <Link to={`${baseAdmin}/productos/editar/${producto.id}`}
                                    className="btn btn-outline-primary btn-sm">Editar</Link> :
                                    <Link to={`${baseAdmin}/productos/editar/${producto.id}`}
                                        className="btn btn-outline-primary btn-sm">Ver detalle</Link>}
                                <button type="button" disabled={!puedeEditar || borrando} className="btn btn-outline-danger btn-sm"
                                    onClick={() => confirmarEliminacion(producto)}>Eliminar</button>
                            </div>
                        </td>
                    </tr>;
                })}</tbody>
            </table></div> : <p className="mb-0">No hay productos que coincidan con la consulta.</p>}
            <PaginacionAdmin datos={paginacion} seccion="productos" />
        </section>}
    </main>;
}
