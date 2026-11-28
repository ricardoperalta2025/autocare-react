import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';

export default function Hero() {
    const [busqueda, setBusqueda] = useState('');
    const navegar = useNavigate();

    function buscar(evento) {
        evento.preventDefault();
        const texto = busqueda.trim();
        navegar(texto ? '/productos?buscar=' + encodeURIComponent(texto) : '/productos');
    }

    return <section className="tienda-contenedor tienda-portada portada-simulador">
        <div className="portada-texto">
            <p className="tienda-etiqueta"><span /> Simulador de tienda</p>
            <h1 className="portada-titulo">Bienvenido a AutoCare<span>Pro</span></h1>
            <p className="portada-descripcion">Repuestos y accesorios para el mantenimiento de tu auto.</p>
            <form className="portada-busqueda" onSubmit={buscar}>
                <input type="search" className="form-control" value={busqueda} onChange={(evento) => setBusqueda(evento.target.value)}
                    placeholder="Busca repuestos, aceites, accesorios..." aria-label="Buscar productos" />
                <button type="submit" className="btn btn-danger">Buscar</button>
            </form>
            <Link className="btn btn-outline-light mt-3" to="/productos">Ver catálogo completo</Link>
        </div>
    </section>;
}
