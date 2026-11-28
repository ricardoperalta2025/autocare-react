import { useEffect, useRef, useState } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { obtenerProductos, obtenerDescuentoProducto, obtenerPrecioFinalProducto } from '../services/productosService.js';
import { obtenerCategorias } from '../services/categoriasService.js';
import { mismoIdProducto } from '../services/carritoService.js';
import { useCarrito } from '../context/CarritoContext.jsx';
import { useCarritoConectado } from '../context/CarritoConectadoContext.jsx';
import { RUTA_CARRITO_CONECTADO, RUTA_CATALOGO_CONECTADO, useCatalogoConectado } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import ProductoTarjeta from '../components/ProductoTarjeta.jsx';
import AvisoCarrito from '../components/AvisoCarrito.jsx';

const TAMANOS = ['9', '18', '30', 'todos'];

export default function Productos() {
    const catalogo = useCatalogoConectado();
    const { usuario, demostracion } = useSesionConectada();
    const rol = usuario?.rol;
    const conectado = Boolean(catalogo);
    const vendedor = conectado && rol === 'VENDEDOR';
    const mostrarStock = !conectado || ['ADMIN', 'VENDEDOR'].includes(rol);
    const rutaProductos = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';
    const productos = conectado ? catalogo.productos : obtenerProductos();
    const categorias = conectado ? catalogo.categorias : obtenerCategorias();
    const local = useCarrito();
    const remoto = useCarritoConectado();
    const [searchParams, setSearchParams] = useSearchParams();
    const [orden, setOrden] = useState('');
    const [aviso, setAviso] = useState(null);
    const lista = useRef(null);
    const desplazarAlCambiarPagina = useRef(false);

    const seleccionadas = searchParams.getAll('categoria');
    const busqueda = searchParams.get('buscar') ?? '';
    const texto = busqueda.trim().toLowerCase();
    const precio = (producto) => conectado ? producto.precioFinal : obtenerPrecioFinalProducto(producto);

    const filtrados = productos.filter((producto) => {
        const categoria = conectado ? producto.categoriaId : producto.categoria;
        const coincideCategoria = !seleccionadas.length || seleccionadas.includes(categoria);
        return coincideCategoria && (!texto || [producto.nombre, producto.categoria, producto.descripcion]
            .some((campo) => (campo ?? '').toLowerCase().includes(texto)));
    });

    if (orden === 'precio-menor') filtrados.sort((a, b) => precio(a) - precio(b));
    if (orden === 'precio-mayor') filtrados.sort((a, b) => precio(b) - precio(a));
    if (orden === 'nombre') filtrados.sort((a, b) => a.nombre.localeCompare(b.nombre));

    // La búsqueda, los filtros y el orden se aplican al conjunto completo.
    const total = filtrados.length;
    const medida = TAMANOS.includes(searchParams.get('porPagina')) ? searchParams.get('porPagina') : '9';
    const porPagina = medida === 'todos' ? Math.max(total, 1) : Number(medida);
    const totalPaginas = Math.max(1, Math.ceil(total / porPagina));
    const pedida = Number(searchParams.get('pagina'));
    const pagina = Number.isInteger(pedida) && pedida > 0 ? Math.min(pedida, totalPaginas) : 1;
    const inicio = (pagina - 1) * porPagina;
    const fin = Math.min(inicio + porPagina, total);
    const visibles = conectado ? filtrados.slice(inicio, fin) : filtrados;

    useEffect(() => {
        if (desplazarAlCambiarPagina.current) {
            lista.current?.scrollIntoView({ block: 'start' });
            desplazarAlCambiarPagina.current = false;
        }
    }, [pagina]);

    function cambiarPagina(numero) {
        if (numero === pagina) return;
        const parametros = new URLSearchParams(searchParams);
        if (numero === 1) parametros.delete('pagina');
        else parametros.set('pagina', String(numero));
        desplazarAlCambiarPagina.current = true;
        setSearchParams(parametros);
    }

    function cambiarFiltro(campo, valor, reemplazar = false) {
        const parametros = new URLSearchParams(searchParams);
        if (valor) parametros.set(campo, valor);
        else parametros.delete(campo);
        parametros.delete('pagina');
        setSearchParams(parametros, { replace: reemplazar });
    }

    function alternarCategoria(categoria) {
        const parametros = new URLSearchParams(searchParams);
        if (seleccionadas.includes(categoria)) parametros.delete('categoria', categoria);
        else parametros.append('categoria', categoria);
        parametros.delete('pagina');
        setSearchParams(parametros);
    }

    function limpiarFiltros() {
        setSearchParams(medida === '9' ? {} : { porPagina: medida });
        setOrden('');
    }

    function agregar(producto) {
        const unidades = conectado ? remoto.agregarProducto(producto)
            : local.agregarProducto({ ...producto, precioOriginal: producto.precio,
                precio: precio(producto), descuento: obtenerDescuentoProducto(producto) });
        const carrito = conectado ? remoto.carrito : local.carrito;
        const enCarrito = carrito.find((linea) => mismoIdProducto(linea.id, producto.id))?.cantidad ?? 0;
        setAviso({ nombre: producto.nombre, cantidad: unidades, mensaje: enCarrito >= producto.stock
            ? 'Ya agregaste todas las unidades disponibles de este producto.'
            : 'No se pudo actualizar el carrito. Inténtalo de nuevo.' });
    }

    return (
        <main className="tienda-contenedor catalogo-pagina">
            {conectado && !vendedor && pagina === 1 && <section className="tienda-portada">
                <div className="portada-texto">
                    <p className="tienda-etiqueta"><span /> Repuestos y accesorios</p>
                    <p className="portada-titulo">Repuestos para<br />cada kilómetro<span>.</span></p>
                    <p className="portada-descripcion">Encuentra lo que necesitas para mantener tu auto en marcha.</p>
                    <a href="#lista-productos" className="btn btn-danger">Explorar productos <i className="bi bi-arrow-down" aria-hidden="true" /></a>
                </div>
            </section>}

            <header className="tienda-encabezado" id="lista-productos" ref={lista}>
                <div>
                    <h1>Catálogo de productos</h1>
                    <p className="text-body-secondary mb-0">{total} {total === 1 ? 'producto encontrado' : 'productos encontrados'}</p>
                </div>
                {!conectado && <Link className="btn btn-outline-dark btn-sm" to={RUTA_CATALOGO_CONECTADO}>Ir a la tienda</Link>}
                {conectado && !demostracion && !vendedor && <Link className="tienda-regreso mb-0" to="/productos">Volver al simulador</Link>}
            </header>

            <div className="catalogo-distribucion">
                <aside className="catalogo-filtros" aria-label="Filtros del catálogo">
                    <div className="filtros-titulo"><i className="bi bi-sliders" aria-hidden="true" /> Categorías</div>
                    <div className="categoria-filtros">
                        {categorias.map((categoria) => {
                            const valor = conectado ? categoria.id : categoria.nombre;
                            return <button key={categoria.id} type="button" className="categoria-filtro"
                                aria-pressed={seleccionadas.includes(valor)} onClick={() => alternarCategoria(valor)}>
                                <i className="bi bi-square" aria-hidden="true" /> {categoria.nombre}
                            </button>;
                        })}
                    </div>
                    <button type="button" className="btn btn-link btn-sm limpiar-filtros" onClick={limpiarFiltros}>Limpiar filtros</button>
                </aside>

                <section aria-label="Resultados de productos">
                    <div className="catalogo-herramientas">
                        <div className="buscador-productos">
                            <i className="bi bi-search" aria-hidden="true" />
                            <input type="text" inputMode="search" className="form-control" aria-label="Buscar productos"
                                placeholder="Buscar productos por nombre, categoría o descripción..." value={busqueda}
                                onChange={(evento) => cambiarFiltro('buscar', evento.target.value, true)} />
                        </div>
                        <select className="form-select" aria-label="Ordenar productos" value={orden}
                            onChange={(evento) => {
                                setOrden(evento.target.value);
                                if (searchParams.has('pagina')) cambiarFiltro('pagina', '', true);
                            }}>
                            <option value="">Ordenar por</option>
                            <option value="precio-menor">Precio menor</option>
                            <option value="precio-mayor">Precio mayor</option>
                            <option value="nombre">Nombre</option>
                        </select>
                        {conectado && <select className="form-select pagina-medida" aria-label="Productos por página" value={medida}
                            onChange={(evento) => cambiarFiltro('porPagina', evento.target.value === '9' ? '' : evento.target.value)}>
                            <option value="9">9 por página</option><option value="18">18 por página</option>
                            <option value="30">30 por página</option><option value="todos">Ver todos</option>
                        </select>}
                    </div>

                    {conectado && <p className="catalogo-rango" aria-live="polite">Mostrando {total ? inicio + 1 : 0}–{fin} de {total} productos</p>}

                    {total === 0 ? <p className="tienda-vacio">{conectado && productos.length === 0
                        ? 'El catálogo está vacío.' : 'No se encontraron productos con los filtros seleccionados.'}</p> : (
                        <div className="producto-grid">
                            {visibles.map((producto) => <ProductoTarjeta key={producto.id} producto={producto}
                                ruta={rutaProductos + '/' + producto.id} precioFinal={precio(producto)} mostrarStock={mostrarStock}
                                bloqueado={conectado && Boolean(remoto.intento)} agregar={vendedor ? undefined : () => agregar(producto)} />)}
                        </div>
                    )}

                    {conectado && totalPaginas > 1 && <nav className="catalogo-paginacion" aria-label="Paginación del catálogo">
                        <button className="pagina-boton" type="button" aria-label="Anterior" disabled={pagina === 1}
                            onClick={() => cambiarPagina(pagina - 1)}><i className="bi bi-chevron-left" aria-hidden="true" />
                            <span className="d-none d-sm-inline">Anterior</span></button>
                        {Array.from({ length: totalPaginas }, (_, indice) => <button className="pagina-boton" type="button"
                            key={indice} aria-label={'Página ' + (indice + 1)} aria-current={pagina === indice + 1 ? 'page' : undefined}
                            onClick={() => cambiarPagina(indice + 1)}>{indice + 1}</button>)}
                        <button className="pagina-boton" type="button" aria-label="Siguiente" disabled={pagina === totalPaginas}
                            onClick={() => cambiarPagina(pagina + 1)}><span className="d-none d-sm-inline">Siguiente</span>
                            <i className="bi bi-chevron-right" aria-hidden="true" /></button>
                    </nav>}
                </section>
            </div>

            <AvisoCarrito aviso={aviso} cerrar={setAviso} rutaCarrito={conectado ? RUTA_CARRITO_CONECTADO : '/carrito'} />
        </main>
    );
}
