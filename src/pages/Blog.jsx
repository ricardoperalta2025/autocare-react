import { Link } from 'react-router-dom';
import { obtenerBlogs } from '../services/blogsService.js';

export default function Blog() {
    return (
        <main className="tienda-contenedor tienda-pagina">
            <header className="tienda-encabezado">
                <div>
                    <h1>Blog AutoCarePro</h1>
                    <p className="text-body-secondary mb-0">Consejos, información y novedades para el cuidado de tu vehículo.</p>
                </div>
            </header>

            <div className="row g-4">
                {obtenerBlogs().map((blog) => {
                    const ruta = '/blog/' + blog.id;
                    const ajuste = blog.mostrarImagenCompleta ? ' object-fit-contain' : '';
                    return (
                        <div className="col-md-6" key={blog.id}>
                            <article className="card blog-tarjeta h-100">
                                <Link to={ruta} className="blog-foto" aria-label={'Abrir artículo: ' + blog.titulo}>
                                    <img src={blog.imagen} alt={blog.imagenAlt} className={'blog-imagen' + ajuste} />
                                </Link>
                                <div className="card-body d-flex flex-column align-items-start">
                                    <h2 className="h4"><Link to={ruta}>{blog.titulo}</Link></h2>
                                    <p className="text-body-secondary">{blog.resumen}</p>
                                    <Link to={ruta} className="btn btn-outline-danger mt-auto">
                                        Leer más <i className="bi bi-arrow-right ms-1" aria-hidden="true" />
                                    </Link>
                                </div>
                            </article>
                        </div>
                    );
                })}
            </div>
        </main>
    );
}
