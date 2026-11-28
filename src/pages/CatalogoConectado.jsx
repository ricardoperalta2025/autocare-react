import { useEffect, useState } from 'react';
import { Outlet } from 'react-router-dom';
import { obtenerCategoriasApi, obtenerProductosApi } from '../services/catalogoApi';

export default function CatalogoConectado() {
    const [catalogo, setCatalogo] = useState(null);
    const [error, setError] = useState('');
    const [intento, setIntento] = useState(0);

    useEffect(() => {
        let vigente = true;

        async function cargarCatalogo() {
            try {
                const [productos, categorias] = await Promise.all([
                    obtenerProductosApi(),
                    obtenerCategoriasApi()
                ]);

                if (!Array.isArray(productos) || !Array.isArray(categorias)) {
                    throw new Error('La API devolvió un catálogo con un formato inesperado.');
                }

                if (vigente) setCatalogo({ productos, categorias });
            } catch (causa) {
                if (vigente) setError(causa.message);
            }
        }

        cargarCatalogo();
        return () => { vigente = false; };
    }, [intento]);

    function reintentar() {
        setError('');
        setIntento((numero) => numero + 1);
    }

    return (
        <>
            {!catalogo && <main className="tienda-contenedor tienda-pagina">
                {error ? (
                    <div className="alert alert-danger" role="alert">
                        <p>No se pudo cargar el catálogo. {error}</p>
                        <button className="btn btn-outline-danger btn-sm" onClick={reintentar}>
                            Reintentar
                        </button>
                    </div>
                ) : <p role="status">Cargando catálogo…</p>}
            </main>}

            {catalogo && <Outlet context={catalogo} />}
        </>
    );
}
