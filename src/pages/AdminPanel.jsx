import { Link } from 'react-router-dom';
import { useBaseAdmin } from '../context/catalogo.js';
import { obtenerProductos, productoTieneStockCritico } from '../services/productosService.js';
import { obtenerOrdenes } from '../services/ordenesService.js';
import { obtenerIncidencias } from '../services/incidenciasService.js';
import { obtenerCategorias } from '../services/categoriasService.js';
import { obtenerClientes } from '../services/usuariosService.js';
import { EstadoCatalogoAdmin } from '../components/EstadoCatalogoAdmin.jsx';
import { EncabezadoAdmin } from '../components/AdminInterfaz.jsx';
import { useConsultaCatalogoAdmin } from '../hooks/useConsultaCatalogoAdmin.js';
import { listarCategoriasAdmin, listarProductosAdmin } from '../services/adminCatalogoApi.js';
import { useConsultaConectada } from '../hooks/useOperacionesConectadas.js';
import { listarOrdenesApi } from '../services/ordenesApi.js';
import { formatearRegistro, listarClientesApi, listarIncidenciasApi } from '../services/operacionesApi.js';

export default function AdminPanel({ conectado = false }) {
    const baseAdmin = useBaseAdmin();
    const productosApi = useConsultaCatalogoAdmin(conectado, listarProductosAdmin);
    const categoriasApi = useConsultaCatalogoAdmin(conectado, listarCategoriasAdmin);
    const ordenesApi = useConsultaConectada(conectado, listarOrdenesApi);
    const incidenciasApi = useConsultaConectada(conectado, listarIncidenciasApi);
    const clientesApi = useConsultaConectada(conectado, listarClientesApi);
    const productos = conectado ? productosApi.datos : obtenerProductos();
    const categorias = conectado ? categoriasApi.datos : obtenerCategorias();
    const clientes = conectado ? clientesApi.datos : obtenerClientes();
    const ordenes = conectado ? ordenesApi.datos?.map(formatearRegistro) : obtenerOrdenes();
    const incidencias = conectado ? incidenciasApi.datos?.map(formatearRegistro) : obtenerIncidencias();

    const modulos = [
        ['productos', 'box-seam', 'Administrar productos', productos?.length, 'Repuestos en catálogo'],
        ['categorias', 'grid', 'Administrar categorías', categorias?.length, 'Categorías registradas'],
        ['usuarios', 'people', 'Administrar usuarios', clientes?.length, 'Cuentas de clientes'],
        ['ordenes', 'receipt', 'Administrar órdenes', ordenes?.filter((orden) => orden.estado === 'Procesando').length, 'Órdenes procesando'],
        ['incidencias', 'chat-left-text', 'Administrar incidencias', incidencias?.filter((incidencia) => incidencia.estado !== 'Resuelta').length, 'Solicitudes abiertas'],
        ['notificaciones', 'bell', 'Ver notificaciones', productos?.filter((producto) => producto.stock <= 0 || productoTieneStockCritico(producto)).length, 'Alertas de inventario'],
        ['reportes', 'bar-chart', 'Ver reportes', undefined, 'Ventas, inventario y posventa']
    ];
    return <main className="tienda-contenedor tienda-pagina admin-pagina">
        <div className="admin-panel-portada">
            <EncabezadoAdmin titulo="Panel de Administración" descripcion="Gestiona el catálogo, los pedidos y la atención a clientes." regreso={false} />
        </div>
        {conectado && [productosApi, categoriasApi, clientesApi, ordenesApi, incidenciasApi].map((consulta, indice) =>
            <EstadoCatalogoAdmin key={indice} consulta={consulta} />)}
        <nav className="admin-modulos" aria-label="Secciones de administración">
            {modulos.map(([ruta, icono, titulo, total, descripcion]) => <Link className="admin-modulo" aria-label={titulo} key={ruta} to={baseAdmin + '/' + ruta}>
                <div className="d-flex justify-content-between align-items-center mb-2">
                    <i className={'bi bi-' + icono} aria-hidden="true" />
                    {ruta !== 'reportes' && <strong className="fs-4">{total ?? '—'}</strong>}
                </div>
                <h2 className="h5 mb-0">{titulo}</h2>
                <p>{descripcion}</p>
            </Link>)}
        </nav>
    </main>;
}
