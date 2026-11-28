export default function SelectorCantidad({ id, nombre, cantidad, maximo, deshabilitado, cambiar, advertir, ajustarAlMaximo }) {
    function seleccionar(valor) {
        if (!Number.isSafeInteger(valor) || valor < 1) return;
        if (valor > maximo) {
            if (ajustarAlMaximo && maximo > 0 && cantidad !== maximo) cambiar(maximo);
            advertir();
            return;
        }
        cambiar(valor);
    }

    return (
        <div className="selector-cantidad">
            <button type="button" className="btn" aria-label={'Disminuir cantidad de ' + nombre}
                disabled={deshabilitado || cantidad <= 1}
                onClick={() => seleccionar(Math.min(cantidad - 1, maximo))}>−</button>
            <input id={id} type="number" min="1" max={maximo} step="1" inputMode="numeric"
                value={cantidad} disabled={deshabilitado} onChange={(evento) => seleccionar(Number(evento.target.value))} />
            <button type="button" className="btn" aria-label={'Aumentar cantidad de ' + nombre}
                disabled={deshabilitado} onClick={() => seleccionar(cantidad + 1)}>+</button>
        </div>
    );
}
