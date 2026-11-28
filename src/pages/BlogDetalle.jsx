import { Link, useParams } from 'react-router-dom';
import { obtenerBlogPorId } from '../services/blogsService.js';

export default function BlogDetalle() {
    const { id } = useParams();
    const blog = obtenerBlogPorId(id);

    return (
        <main className="tienda-contenedor tienda-pagina blog-detalle">
            <Link to="/blog" className="tienda-regreso">
                <i className="bi bi-arrow-left" aria-hidden="true" /> Volver al blog
            </Link>

            {blog ? (
                <article>
                    <header className="tienda-encabezado">
                        <div>
                            <h1>{blog.titulo}</h1>
                            <p className="lead text-body-secondary mb-0">{blog.resumen}</p>
                        </div>
                    </header>
                    <div className="tienda-panel">
                        <div className="row g-4">
                            <div className="col-lg-5">
                                <div className="blog-foto">
                                    <img src={blog.imagen} alt={blog.imagenAlt}
                                        className={'blog-imagen' + (blog.mostrarImagenCompleta ? ' object-fit-contain' : '')} />
                                </div>
                            </div>
                            <div className="col-lg-7 blog-contenido">
                                {blog.contenido.map((parrafo) => <p key={parrafo}>{parrafo}</p>)}
                            </div>
                        </div>
                    </div>
                </article>
            ) : (
                <section className="tienda-vacio">
                    <h1>El artículo solicitado no existe.</h1>
                </section>
            )}
        </main>
    );
}
