import { createContext, useContext, useRef, useState } from 'react';
import { esIdProductoLocal, mismoIdProducto } from '../services/carritoService.js';
import { CarritoConectadoProvider } from './CarritoConectadoContext.jsx';

const CarritoContext = createContext();
const CLAVE_CARRITO = 'carritoAutoCare';

function obtenerCarritoGuardado() {
    try {
        const datos = JSON.parse(localStorage.getItem(CLAVE_CARRITO));
        return Array.isArray(datos) ? datos : [];
    } catch {
        return [];
    }
}

export function CarritoProvider({ children }) {
    const [carrito, setCarrito] = useState(obtenerCarritoGuardado);
    const carritoActual = useRef(carrito);

    function guardar(siguiente) {
        try {
            localStorage.setItem(CLAVE_CARRITO, JSON.stringify(siguiente));
        } catch {
            return false;
        }
        carritoActual.current = siguiente;
        setCarrito(siguiente);
        return true;
    }

    function agregarProducto(producto, unidades = 1) {
        if (!esIdProductoLocal(producto.id) || !Number.isSafeInteger(producto.stock) ||
            !Number.isSafeInteger(unidades) || unidades < 1) return 0;

        const actual = carritoActual.current;
        const previa = actual.find((item) => mismoIdProducto(item.id, producto.id));
        const cantidadAnterior = Number.isSafeInteger(previa?.cantidad) && previa.cantidad > 0 ? previa.cantidad : 0;
        if (unidades > producto.stock - cantidadAnterior) return 0;
        const siguiente = previa
            ? actual.map((item) => item === previa ? { ...item, stock: producto.stock, cantidad: cantidadAnterior + unidades } : item)
            : [...actual, { ...producto, cantidad: unidades }];
        return guardar(siguiente) ? unidades : 0;
    }

    function eliminarProducto(id) {
        guardar(carritoActual.current.filter((item) => !mismoIdProducto(item.id, id)));
    }

    function cambiarCantidad(id, cantidad) {
        if (!Number.isSafeInteger(cantidad) || cantidad < 1) return;
        guardar(carritoActual.current.map((item) => mismoIdProducto(item.id, id) &&
            Number.isSafeInteger(item.stock) && item.stock > 0
            ? { ...item, cantidad: Math.min(cantidad, item.stock) }
            : item));
    }

    function vaciarCarrito() {
        guardar([]);
    }

    const cantidadTotal = carrito.reduce((total, item) => total + item.cantidad, 0);
    const total = carrito.reduce((suma, item) => suma + item.precio * item.cantidad, 0);

    return (
        <CarritoContext.Provider value={{ carrito, agregarProducto, eliminarProducto, cambiarCantidad, vaciarCarrito, cantidadTotal, total }}>
            <CarritoConectadoProvider>{children}</CarritoConectadoProvider>
        </CarritoContext.Provider>
    );
}

export function useCarrito() {
    return useContext(CarritoContext);
}
