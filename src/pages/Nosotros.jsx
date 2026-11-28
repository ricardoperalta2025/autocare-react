export default function Nosotros() {
    return (
        <main className="tienda-contenedor tienda-pagina">
            <header className="nosotros-portada">
                <div className="nosotros-presentacion">
                    <p className="tienda-etiqueta"><span /> AutoCarePro · Tienda demostrativa</p>
                    <div className="tienda-encabezado"><h1>Sobre Nosotros</h1></div>
                    <p className="lead">En AutoCarePro nos apasiona el mundo automotriz y creemos que mantener un vehículo en buenas condiciones no debería ser complicado.</p>
                    <p className="mb-0">Esta tienda demostrativa reúne repuestos, accesorios y productos de mantención para conductores y amantes de los vehículos.</p>
                </div>
                <img src="/images/Tienda.png" alt="Imagen referencial de una tienda de repuestos AutoCarePro" />
            </header>

            <div className="row g-3 my-3">
                <div className="col-md-4">
                    <section className="tienda-panel h-100">
                        <i className="bi bi-bullseye nosotros-icono" aria-hidden="true" />
                        <h2 className="h5 mt-2">Misión</h2>
                        <p className="mb-0">Facilitar el acceso a los repuestos y accesorios necesarios para cuidar, mantener y mejorar tu auto.</p>
                    </section>
                </div>
                <div className="col-md-4">
                    <section className="tienda-panel h-100">
                        <i className="bi bi-eye nosotros-icono" aria-hidden="true" />
                        <h2 className="h5 mt-2">Visión</h2>
                        <p className="mb-0">Ser una tienda fácil de consultar, donde cada persona pueda encontrar lo que necesita para mantener su vehículo en buenas condiciones.</p>
                    </section>
                </div>
                <div className="col-md-4">
                    <section className="tienda-panel h-100">
                        <i className="bi bi-hand-thumbs-up nosotros-icono" aria-hidden="true" />
                        <h2 className="h5 mt-2">Valores</h2>
                        <p className="mb-0">Calidad en la selección de repuestos, precios claros y una experiencia de compra sencilla que genere confianza.</p>
                    </section>
                </div>
            </div>

            <section className="tienda-panel">
                <h2 className="h5">Equipo de desarrollo</h2>
                <p className="mb-1"><strong>Nicolás Aballais y Ricardo Peralta</strong></p>
                <p className="mb-0 text-body-secondary">Proyecto académico de Analista Programador, Duoc UC, sede Puente Alto.</p>
            </section>
        </main>
    );
}
