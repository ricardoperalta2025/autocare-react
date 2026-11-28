export default function EstadoEscrituraConectada({ escritura, mensajeBloqueo = 'Las escrituras están deshabilitadas en este entorno.' }) {
    return <>
        {!escritura.habilitada && <p className="alert alert-info">{mensajeBloqueo}</p>}
        {escritura.error && <p className="alert alert-danger" role="alert">{escritura.error}</p>}
    </>;
}
