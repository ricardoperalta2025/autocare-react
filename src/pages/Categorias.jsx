import { useSearchParams } from 'react-router-dom';
import { obtenerCategorias } from '../services/categoriasService.js';
import { obtenerProductos, obtenerPrecioFinalProducto } from '../services/productosService.js';
import { RUTA_CATALOGO_CONECTADO, useCatalogoConectado } from '../context/catalogo.js';
import { useSesionConectada } from '../context/sesionConectada.js';
import ProductoTarjeta from '../components/ProductoTarjeta.jsx';

const iconos = [
    ['aceite', 'droplet'], ['filtro', 'grid-3x3-gap'], ['freno', 'disc'], ['encendido', 'lightning-charge'],
    ['iluminaci', 'lightbulb'], ['refrigera', 'snow'], ['suspensi', 'tools'], ['limpieza', 'stars']
];

export default function Categorias() {
    const catalogo = useCatalogoConectado();
    const conectado = Boolean(catalogo);
    const rol = useSesionConectada().usuario?.rol;
    const ruta = conectado ? RUTA_CATALOGO_CONECTADO : '/productos';
    const categorias = conectado ? catalogo.categorias : obtenerCategorias();
    const productos = conectado ? catalogo.productos : obtenerProductos();
    const [parametros, setParametros] = useSearchParams();
    const valor = (categoria) => conectado ? categoria.id : categoria.nombre;
    const categoriaProducto = (producto) => conectado ? producto.categoriaId : producto.categoria;
    const inicial = conectado
        ? categorias.find((categoria) => productos.some((producto) => categoriaProducto(producto) === valor(categoria)))
        : categorias[0];
    const seleccion = parametros.get('categoria') || (inicial ? valor(inicial) : '');
    const activa = categorias.find((categoria) => valor(categoria) === seleccion);
    const filtrados = productos.filter((producto) => categoriaProducto(producto) === seleccion);

    return <main className="tienda-contenedor tienda-pagina">
        <header className="tienda-encabezado"><div><h1>Categorías</h1><p className="text-body-secondary mb-0">Explora los repuestos por tipo.</p></div></header>
        <div className="categoria-grid">
            {categorias.map((categoria) => {
                const nombre = categoria.nombre.toLowerCase();
                const icono = iconos.find(([fragmento]) => nombre.includes(fragmento))?.[1] ?? 'box-seam';
                return <div className={'card tienda-categoria' + (activa === categoria ? ' activa' : '')} key={categoria.id}>
                    <div className="card-body">
                        <i className={'bi bi-' + icono} aria-hidden="true" />
                        <h4>{categoria.nombre}</h4>
                        <button type="button" className="btn btn-outline-dark btn-sm" aria-pressed={activa === categoria}
                            onClick={() => setParametros({ categoria: valor(categoria) })}>Ver productos</button>
                    </div>
                </div>;
            })}
        </div>
        <h2 className="tienda-seccion-titulo">{activa?.nombre ?? 'Productos por categoría'}</h2>
        {filtrados.length ? <div className="producto-grid">
            {filtrados.map((producto) => <ProductoTarjeta key={producto.id} producto={producto} ruta={ruta + '/' + producto.id}
                precioFinal={conectado ? producto.precioFinal : obtenerPrecioFinalProducto(producto)}
                mostrarStock={!conectado || ['ADMIN', 'VENDEDOR'].includes(rol)} />)}
        </div> : <p className="tienda-vacio">No existen productos disponibles en esta categoría.</p>}
    </main>;
}
