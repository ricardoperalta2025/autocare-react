const pesos = new Intl.NumberFormat('es-CL', { style: 'currency', currency: 'CLP' });

export default function ResumenCompra({ lineas, total, estimado = true, mostrarDetalle, children }) {
    const unidades = lineas.reduce((suma, linea) => suma + linea.cantidad, 0);
    const ahorro = lineas.reduce((suma, linea) => suma +
        (linea.descuento > 0 ? Math.max(0, (linea.precioOriginal ?? linea.precio) - linea.precio) * linea.cantidad : 0), 0);

    return <aside className="tienda-panel resumen-compra" aria-label="Resumen del pedido">
        <h2>Resumen del pedido</h2>
        <p className="text-body-secondary">Cantidad total: {unidades}</p>
        {mostrarDetalle && <ul className="resumen-lineas">
            {lineas.map((linea) => <li key={linea.id}>
                <div>
                    <strong>{linea.nombre}</strong>
                    <small>{linea.cantidad} × {pesos.format(linea.precio)} por unidad</small>
                    {linea.descuento > 0 && <small><del>{pesos.format(linea.precioOriginal)}</del> · {linea.descuento}% de descuento</small>}
                </div>
                <div className="resumen-linea-subtotal"><small>Subtotal</small><strong>{pesos.format(linea.precio * linea.cantidad)}</strong></div>
            </li>)}
        </ul>}
        {ahorro > 0 && <div className="resumen-ahorro"><span>Ahorro total</span><strong>{pesos.format(ahorro)}</strong></div>}
        <p className="resumen-total">{(estimado ? 'Total estimado: ' : 'Total: ') + pesos.format(total)}</p>
        {children}
    </aside>;
}
