import productosIniciales from '../data/productos.json';

const CLAVE_PRODUCTOS = 'productosAutoCare';
export const IMAGEN_PRODUCTO_ALTERNATIVA = '/images/producto-sin-imagen.webp';

const RUTA_FICHAS_EV3 = '/images/catalogo-ev3/';
const RUTA_FOTOS_EV3 = RUTA_FICHAS_EV3 + 'productos/';
const FICHAS_EV3 = new Set([
    'aceites-lubricantes', 'filtros', 'frenos', 'encendido-electricidad',
    'iluminacion', 'refrigeracion', 'suspension-direccion', 'limpieza-cuidado'
].map((nombre) => RUTA_FICHAS_EV3 + nombre + '.webp'));

const FOTOS_EV3_POR_CODIGO = new Map([
    ['EV3-LUB-001', '/images/Aceite.png'],
    ['EV3-LUB-002', RUTA_FOTOS_EV3 + 'aceite-motor.webp'],
    ['EV3-LUB-003', RUTA_FOTOS_EV3 + 'aceite-motor.webp'],
    ['EV3-LUB-004', RUTA_FOTOS_EV3 + 'aceite-motor.webp'],
    ['EV3-LUB-005', RUTA_FOTOS_EV3 + 'fluido-transmision.webp'],
    ['EV3-LUB-006', RUTA_FOTOS_EV3 + 'fluido-transmision.webp'],
    ['EV3-LUB-007', RUTA_FOTOS_EV3 + 'grasa.webp'],
    ['EV3-FIL-001', RUTA_FOTOS_EV3 + 'filtro-aceite.webp'],
    ['EV3-FIL-002', RUTA_FOTOS_EV3 + 'filtro-cilindrico.webp'],
    ['EV3-FIL-003', '/images/filtro.png'],
    ['EV3-FIL-004', RUTA_FOTOS_EV3 + 'filtro-cilindrico.webp'],
    ['EV3-FIL-005', RUTA_FOTOS_EV3 + 'filtro-cabina.webp'],
    ['EV3-FIL-006', RUTA_FOTOS_EV3 + 'filtro-cabina.webp'],
    ['EV3-FIL-007', RUTA_FOTOS_EV3 + 'filtro-combustible.webp'],
    ['EV3-FRE-001', RUTA_FOTOS_EV3 + 'pastillas-freno.webp'],
    ['EV3-FRE-002', RUTA_FOTOS_EV3 + 'pastillas-freno.webp'],
    ['EV3-FRE-003', RUTA_FOTOS_EV3 + 'disco-freno.webp'],
    ['EV3-FRE-004', RUTA_FOTOS_EV3 + 'disco-macizo.webp'],
    ['EV3-FRE-005', RUTA_FOTOS_EV3 + 'zapatas.webp'],
    ['EV3-FRE-006', RUTA_FOTOS_EV3 + 'liquido-frenos.webp'],
    ['EV3-ELE-001', RUTA_FOTOS_EV3 + 'bujias.webp'],
    ['EV3-ELE-002', RUTA_FOTOS_EV3 + 'bujias.webp'],
    ['EV3-ELE-003', RUTA_FOTOS_EV3 + 'bobina.webp'],
    ['EV3-ELE-004', RUTA_FOTOS_EV3 + 'bateria.webp'],
    ['EV3-ELE-005', RUTA_FOTOS_EV3 + 'motor-partida.webp'],
    ['EV3-ELE-006', RUTA_FOTOS_EV3 + 'fusibles.webp'],
    ['EV3-ILU-001', RUTA_FOTOS_EV3 + 'ampolleta-halogena.webp'],
    ['EV3-ILU-002', RUTA_FOTOS_EV3 + 'ampolleta-h4.webp'],
    ['EV3-ILU-003', RUTA_FOTOS_EV3 + 'ampolletas-posicion.webp'],
    ['EV3-ILU-004', RUTA_FOTOS_EV3 + 'ampolletas-posicion.webp'],
    ['EV3-ILU-005', RUTA_FOTOS_EV3 + 'ampolletas-posicion.webp'],
    ['EV3-ILU-006', RUTA_FOTOS_EV3 + 'ampolletas-posicion.webp'],
    ['EV3-REF-001', RUTA_FOTOS_EV3 + 'refrigerante.webp'],
    ['EV3-REF-002', RUTA_FOTOS_EV3 + 'refrigerante.webp'],
    ['EV3-REF-003', RUTA_FOTOS_EV3 + 'termostato.webp'],
    ['EV3-REF-004', RUTA_FOTOS_EV3 + 'tapa-radiador.webp'],
    ['EV3-REF-005', RUTA_FOTOS_EV3 + 'manguera.webp'],
    ['EV3-REF-006', RUTA_FOTOS_EV3 + 'bomba-agua.webp'],
    ['EV3-SUS-001', RUTA_FOTOS_EV3 + 'amortiguadores.webp'],
    ['EV3-SUS-002', RUTA_FOTOS_EV3 + 'amortiguador-delantero.webp'],
    ['EV3-SUS-003', RUTA_FOTOS_EV3 + 'bieleta.webp'],
    ['EV3-SUS-004', RUTA_FOTOS_EV3 + 'terminal-direccion.webp'],
    ['EV3-SUS-005', RUTA_FOTOS_EV3 + 'rotula.webp'],
    ['EV3-SUS-006', RUTA_FOTOS_EV3 + 'buje.webp'],
    ['EV3-LIM-001', RUTA_FOTOS_EV3 + 'champu.webp'],
    ['EV3-LIM-002', RUTA_FOTOS_EV3 + 'microfibra.webp'],
    ['EV3-LIM-003', RUTA_FOTOS_EV3 + 'limpiador.webp'],
    ['EV3-LIM-004', RUTA_FOTOS_EV3 + 'limpiador.webp'],
    ['EV3-LIM-005', RUTA_FOTOS_EV3 + 'limpiador.webp'],
    ['EV3-LIM-006', RUTA_FOTOS_EV3 + 'escobillas.webp']
]);

export function obtenerImagenProducto(producto) {
    // Solo mejora las fichas del lote de demo. Una imagen propia del producto tiene prioridad.
    if (FICHAS_EV3.has(producto.imagen) && FOTOS_EV3_POR_CODIGO.has(producto.codigo)) {
        return FOTOS_EV3_POR_CODIGO.get(producto.codigo);
    }
    return producto.imagen || IMAGEN_PRODUCTO_ALTERNATIVA;
}

export function mostrarImagenProductoAlternativa(evento, respaldo) {
    const imagen = evento.currentTarget;
    const rutaActual = imagen.getAttribute('src');
    if (rutaActual === IMAGEN_PRODUCTO_ALTERNATIVA) return;
    // Prueba la ficha guardada antes de recurrir al respaldo genérico.
    imagen.src = respaldo && respaldo !== rutaActual ? respaldo : IMAGEN_PRODUCTO_ALTERNATIVA;
}

export function productoTieneStockCritico(producto) {
    return producto.stock > 0 && producto.stock <= producto.stockCritico;
}

function normalizarProductos(productos) {
    return productos.map((producto) => {
        const productoBase = productosIniciales.find(
            (item) => Number(item.id) === Number(producto.id)
        );

        return {
            ...productoBase,
            ...producto,
            descuento:
                producto.descuento ??
                productoBase?.descuento ??
                0
        };
    });
}

export function obtenerProductos() {
    const guardados = localStorage.getItem(CLAVE_PRODUCTOS);

    if (guardados) {
        const productos = normalizarProductos(JSON.parse(guardados));

        localStorage.setItem(
            CLAVE_PRODUCTOS,
            JSON.stringify(productos)
        );

        return productos;
    }

    const productos = productosIniciales.map((producto) => ({ ...producto }));

    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
    );

    return productos;
}

export function guardarProductos(productos) {
    localStorage.setItem(
        CLAVE_PRODUCTOS,
        JSON.stringify(productos)
    );
}

export function crearProducto(producto) {
    const productos = obtenerProductos();

    const nuevoProducto = {
        ...producto,
        id: Date.now(),
        descuento: Number(producto.descuento ?? 0)
    };

    const productosActualizados = [
        ...productos,
        nuevoProducto
    ];

    guardarProductos(productosActualizados);

    return nuevoProducto;
}

export function actualizarProducto(id, datosActualizados) {
    const productos = obtenerProductos();

    const productosActualizados = productos.map((producto) =>
        Number(producto.id) === Number(id)
            ? { ...producto, ...datosActualizados }
            : producto
    );

    guardarProductos(productosActualizados);

    return productosActualizados;
}

export function eliminarProducto(id) {
    const productos = obtenerProductos();

    const productosActualizados = productos.filter(
        (producto) => Number(producto.id) !== Number(id)
    );

    guardarProductos(productosActualizados);

    return productosActualizados;
}

export function obtenerDescuentoProducto(producto) {
    return Number(producto?.descuento ?? 0);
}

export function obtenerPrecioFinalProducto(producto) {
    const descuento = obtenerDescuentoProducto(producto);

    if (descuento <= 0) {
        return Number(producto.precio);
    }

    return Math.round(
        Number(producto.precio) *
        (1 - descuento / 100)
    );
}

export function productoEstaEnOferta(producto) {
    return obtenerDescuentoProducto(producto) > 0;
}
