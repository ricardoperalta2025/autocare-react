import { capturar, expect, iniciarSesion, test } from './api-simulada.js';
import { CLAVE_FICTICIA, ENTREGA, FILTRO, IDS, RUTAS } from './datos.js';

test('ADMIN · gestiona categorías y respeta el conflicto de productos asociados', async ({ page }) => {
    await iniciarSesion(page, 'ADMIN');
    await page.getByRole('link', { name: 'Administrar categorías' }).click();
    const existente = page.getByRole('row', { name: /TEST-Aceites/ });
    page.once('dialog', (dialogo) => dialogo.accept());
    await existente.getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByRole('alert')).toContainText('La categoría tiene productos asociados.');
    await expect(existente).toBeVisible();

    await page.getByRole('button', { name: 'Crear categoría' }).click();
    await expect(page.getByRole('alert')).toContainText(/nombre|obligatorio/i);
    await page.getByLabel('Nombre', { exact: true }).fill('TEST-Limpieza');
    await page.getByRole('button', { name: 'Crear categoría' }).click();

    const nueva = page.getByRole('row', { name: /TEST-Limpieza/ });
    await nueva.getByRole('button', { name: 'Editar' }).click();
    await page.getByLabel('Nombre', { exact: true }).fill('TEST-Detallado');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    const editada = page.getByRole('row', { name: /TEST-Detallado/ });
    await expect(editada).toBeVisible();
    page.once('dialog', (dialogo) => dialogo.accept());
    await editada.getByRole('button', { name: 'Eliminar' }).click();
    await expect(editada).toHaveCount(0);
});

test('ADMIN · valida stock, crea, edita y elimina un producto temporal', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'ADMIN');
    await page.getByRole('link', { name: 'Administrar productos' }).click();
    await page.getByRole('link', { name: 'Nuevo producto' }).click();
    await page.getByLabel('Código', { exact: true }).fill('TEST-PROD-01');
    await page.getByLabel('Nombre', { exact: true }).fill('Producto temporal de prueba');
    await page.getByLabel('Precio', { exact: true }).fill('12000');
    await page.getByLabel('Stock', { exact: true }).fill('-1');
    await page.getByLabel('Categoría', { exact: true }).selectOption(IDS.aceites);
    await page.getByRole('button', { name: 'Guardar producto' }).click();
    await expect(page.getByRole('alert')).toContainText('Ingresa un número entero válido');
    await page.getByLabel('Stock', { exact: true }).fill('3');
    await page.getByRole('button', { name: 'Guardar producto' }).click();

    const producto = page.getByRole('row', { name: /Producto temporal de prueba/ });
    await expect(producto).toContainText('$12.000');
    await producto.getByRole('link', { name: 'Editar' }).click();
    await expect(page.getByLabel('Stock', { exact: true })).toHaveValue('3');
    await page.getByLabel('Precio', { exact: true }).fill('13000');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(producto).toContainText('$13.000');
    await capturar(page, testInfo, 'admin-producto-temporal-simulado');

    page.once('dialog', (dialogo) => dialogo.accept());
    await producto.getByRole('button', { name: 'Eliminar' }).click();
    await expect(producto).toHaveCount(0);
});

test('ADMIN · consulta y edita clientes y revisa su historial', async ({ page }) => {
    await iniciarSesion(page, 'ADMIN');
    await page.getByRole('link', { name: 'Administrar usuarios' }).click();
    const camila = page.getByRole('row', { name: /Camila Demo/ });
    await camila.getByRole('link', { name: /ver/i }).click();
    await expect(page.getByRole('row', { name: new RegExp(IDS.orden) })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(IDS.ordenAjena) })).toHaveCount(0);

    await page.goto(RUTAS.admin + '/usuarios');
    await page.getByRole('link', { name: 'Nuevo usuario' }).click();
    await page.getByLabel('Nombre', { exact: true }).fill('Ana');
    await page.getByLabel('Apellido', { exact: true }).fill('Temporal');
    await page.getByLabel('Correo', { exact: true }).fill('ana.temporal@example.test');
    await page.getByLabel('Contraseña', { exact: true }).fill(CLAVE_FICTICIA);
    await page.getByRole('button', { name: 'Crear usuario' }).click();

    await page.getByRole('row', { name: /Ana Temporal/ }).getByRole('link', { name: 'Editar' }).click();
    await page.locator('input[name="comuna"]').fill('Ñuñoa');
    await page.getByRole('button', { name: 'Guardar cambios' }).click();
    await expect(page.getByText('Ñuñoa', { exact: true })).toBeVisible();
    await page.reload();
    await expect(page.getByText('Ñuñoa', { exact: true })).toBeVisible();
});

test('ADMIN · despacha órdenes y resuelve incidencias desde sus listados', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'ADMIN');
    await page.goto(RUTAS.admin + '/ordenes');
    const orden = page.getByRole('row', { name: new RegExp(IDS.orden) });
    await expect(orden).toContainText('Procesando');
    page.once('dialog', (dialogo) => dialogo.accept());
    await orden.getByRole('button', { name: 'Marcar enviado' }).click();
    await expect(orden).toContainText('Enviado');
    await expect(orden.getByRole('button', { name: 'Marcar enviado' })).toHaveCount(0);
    await orden.getByRole('link', { name: /ver/i }).click();
    await expect(page.getByRole('region', { name: 'Datos de entrega' })).toContainText(ENTREGA.direccion);
    await capturar(page, testInfo, 'admin-despacho-simulado');

    await page.goto(RUTAS.admin + '/incidencias');
    await page.getByText('Seguimiento inicial', { exact: true }).click();
    const incidencia = page.locator('details').filter({ hasText: 'Seguimiento inicial' });
    await expect(incidencia).toContainText('Pendiente');
    page.once('dialog', (dialogo) => dialogo.accept());
    await incidencia.getByRole('button', { name: 'Marcar resuelta' }).click();
    await expect(incidencia).toContainText('Resuelta');
    await expect(incidencia.getByRole('button', { name: 'Marcar resuelta' })).toHaveCount(0);
});

test('ADMIN · distingue stock crítico y agotado en los avisos y el reporte', async ({ page, api }, testInfo) => {
    const filtro = api.productos.find((producto) => producto.id === IDS.filtro);
    const agotado = 'Filtro temporal agotado';
    api.productos.push({ ...filtro, id: IDS.productoNuevo, nombre: agotado, stock: 0 });
    await iniciarSesion(page, 'ADMIN');
    await page.goto(RUTAS.admin + '/notificaciones');
    await expect(page.getByText(FILTRO, { exact: true })).toBeVisible();
    await expect(page.getByText('Stock crítico: 1').first()).toBeVisible();
    await expect(page.getByRole('table').getByText('Agotado', { exact: true })).toBeVisible();
    await page.getByRole('combobox', { name: 'Tipo de alerta' }).selectOption('Agotado');
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.getByRole('table').getByText(agotado, { exact: true })).toBeVisible();
    await page.goto(RUTAS.admin + '/productos');
    await expect(page.getByRole('row', { name: new RegExp(agotado) })).toContainText('Agotado');
    await expect(page.getByRole('row', { name: new RegExp(FILTRO) })).toContainText('Stock crítico');
    await page.goto(RUTAS.admin + '/reportes');
    await expect(page.getByText('Total de compras simuladas')).toBeVisible();
    await expect(page.getByText('$18.000', { exact: true })).toBeVisible();
    await expect(page.locator('.admin-indicador').filter({ hasText: /^Agotados1$/ })).toBeVisible();
    await expect(page.getByRole('row', { name: new RegExp(agotado) })).toContainText('Agotado');
    await expect(page.getByRole('row', { name: new RegExp(FILTRO) })).toContainText(/crítico/i);
    await capturar(page, testInfo, 'admin-reporte-simulado');
});

test('ADMIN · pagina y filtra el catálogo completo, ajusta la última página y calcula reportes globales', async ({ page, api }, testInfo) => {
    const base = api.productos[0];
    for (let numero = 3; numero <= 11; numero += 1) {
        api.productos.push({ ...base, id: numero === 11 ? IDS.productoNuevo : String(numero).padStart(24, '0'),
            codigo: 'TEST-REP-' + numero, nombre: 'Repuesto demostrativo ' + numero, stock: numero === 11 ? 0 : 5 });
    }
    const orden = api.ordenes[0];
    for (let numero = 3; numero <= 12; numero += 1) {
        api.ordenes.push({ ...orden, id: String(300 + numero).padStart(24, '0'), estado: 'ENVIADO' });
    }
    await iniciarSesion(page, 'ADMIN');
    await expect(page.getByRole('link', { name: 'Administrar productos' })).toContainText('11');
    await capturar(page, testInfo, 'etapa2-panel');
    await page.getByRole('link', { name: 'Administrar productos' }).click();
    await expect(page.getByText('Mostrando 1–10 de 11 registros')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(10);
    await capturar(page, testInfo, 'etapa2-productos');
    await page.getByRole('button', { name: 'Siguiente' }).click();
    await expect(page.getByText('Mostrando 11–11 de 11 registros')).toBeVisible();
    await page.getByLabel('Buscar producto').fill('TEST-REP-11');
    await expect(page.getByText('Mostrando 1 de 1 registro')).toBeVisible();
    await expect(page.locator('tbody tr')).toContainText('Repuesto demostrativo 11');
    await page.getByLabel('Buscar producto').clear();
    await page.getByLabel('Filtrar por categoría').selectOption(IDS.filtros);
    await expect(page.locator('tbody tr')).toHaveCount(1);
    await expect(page.locator('tbody tr')).toContainText(FILTRO);
    await page.getByLabel('Filtrar por categoría').selectOption('');
    await page.getByRole('combobox', { name: 'Registros por página de productos' }).selectOption('20');
    await expect(page.locator('tbody tr')).toHaveCount(11);

    await page.goto(RUTAS.admin + '/reportes');
    const ventas = page.getByRole('region', { name: 'Resumen de ventas' });
    const inventario = page.getByRole('region', { name: 'Estado de inventario' });
    await expect(ventas.getByText('Mostrando 1–10 de 12 registros')).toBeVisible();
    await expect(inventario.getByText('Mostrando 1–10 de 11 registros')).toBeVisible();
    await expect(page.getByText('$108.000', { exact: true })).toBeVisible();
    await expect(page.locator('.admin-indicador').filter({ hasText: /^Agotados1$/ })).toBeVisible();
    await capturar(page, testInfo, 'etapa2-reportes');
    await ventas.getByRole('button', { name: 'Siguiente' }).click();
    await expect(ventas.getByText('Mostrando 11–12 de 12 registros')).toBeVisible();
    await expect(page.getByText('$108.000', { exact: true })).toBeVisible();
    await expect(inventario.getByText('Mostrando 1–10 de 11 registros')).toBeVisible();

    await page.goto(RUTAS.admin + '/productos');
    await page.getByRole('button', { name: 'Siguiente' }).click();
    page.once('dialog', (dialogo) => dialogo.accept());
    await page.getByRole('row', { name: /Repuesto demostrativo 11/ }).getByRole('button', { name: 'Eliminar' }).click();
    await expect(page.getByText('Mostrando 1–10 de 10 registros')).toBeVisible();
    await expect(page.locator('tbody tr')).toHaveCount(10);
});

test('ADMIN y CLIENTE · guardan y consultan el seguimiento de una incidencia antigua', async ({ page, api }, testInfo) => {
    expect(api.incidencias[0].respuestaAdmin).toBeUndefined();
    api.incidencias.push({ ...api.incidencias[0], id: IDS.incidenciaNueva, compradorId: IDS.otraCuenta,
        asunto: 'Incidencia de otra cuenta' });
    await iniciarSesion(page, 'ADMIN');
    await page.goto(RUTAS.admin + '/incidencias');
    await page.getByText('Seguimiento inicial', { exact: true }).click();
    const ficha = page.locator('details').filter({ hasText: 'Seguimiento inicial' });
    await ficha.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('EN_REVISION');
    await ficha.getByLabel('Respuesta administrativa').fill('Estamos revisando el despacho con el equipo.');
    await ficha.getByRole('button', { name: 'Guardar gestión' }).click();
    await expect(page.getByRole('status').filter({ hasText: 'Incidencia actualizada.' })).toBeVisible();
    await expect(ficha.locator('summary')).toContainText('En revisión');
    await expect(ficha.getByRole('combobox', { name: 'Estado', exact: true }).locator('option[value="PENDIENTE"]')).toHaveCount(0);
    await capturar(page, testInfo, 'etapa2-incidencia-admin');
    await page.getByLabel('Filtrar incidencias por estado').selectOption('En revisión');
    await expect(page.getByText('Incidencia de otra cuenta', { exact: true })).toHaveCount(0);
    await expect(ficha).toBeVisible();
    await ficha.getByRole('combobox', { name: 'Estado', exact: true }).selectOption('RESUELTA');
    await ficha.getByLabel('Respuesta administrativa').fill('El despacho fue verificado y la solicitud quedó resuelta.');
    await ficha.getByRole('button', { name: 'Guardar gestión' }).click();
    await expect(page.getByText('No hay incidencias que coincidan con el estado.')).toBeVisible();
    expect(api.incidencias[0]).toMatchObject({ estado: 'RESUELTA',
        respuestaAdmin: 'El despacho fue verificado y la solicitud quedó resuelta.' });

    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await iniciarSesion(page, 'CLIENTE');
    await page.goto(RUTAS.incidencias);
    await page.getByText('Seguimiento inicial', { exact: true }).click();
    await expect(ficha).toContainText('Resuelta');
    await expect(ficha).toContainText('El despacho fue verificado y la solicitud quedó resuelta.');
    await expect(page.getByText('Incidencia de otra cuenta', { exact: true })).toHaveCount(0);
    await expect(page.getByRole('button', { name: 'Guardar gestión' })).toHaveCount(0);
    await capturar(page, testInfo, 'etapa2-incidencia-cliente');
});

test('ADMIN y VENDEDOR · recorren sus pantallas a 390 px sin desbordamiento', async ({ page }, testInfo) => {
    await iniciarSesion(page, 'ADMIN');
    await page.setViewportSize({ width: 390, height: 844 });
    const ancho = () => page.evaluate(() => document.documentElement.scrollWidth);
    for (const ruta of ['', '/productos', '/categorias', '/usuarios', '/ordenes', '/incidencias', '/notificaciones', '/reportes']) {
        await page.goto(RUTAS.admin + ruta);
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
        await expect(page.getByText('Cargando datos…')).toHaveCount(0);
        expect(await ancho(), ruta).toBeLessThanOrEqual(390);
        if (ruta === '/productos') await capturar(page, testInfo, 'etapa2-admin-movil');
    }
    await page.getByRole('button', { name: 'Abrir navegación' }).click();
    await page.getByRole('button', { name: 'Cerrar sesión' }).click();
    await page.setViewportSize({ width: 1366, height: 900 });
    await iniciarSesion(page, 'VENDEDOR');
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto(RUTAS.catalogo);
    await expect(page.getByText('Stock disponible: 4')).toBeVisible();
    await expect(page.getByRole('button', { name: /agregar/i })).toHaveCount(0);
    expect(await ancho()).toBeLessThanOrEqual(390);
    await page.goto(RUTAS.ordenes);
    await page.getByRole('link', { name: 'Ver detalle' }).first().click();
    await expect(page.getByRole('region', { name: 'Datos de entrega' })).toHaveCount(0);
    await page.getByRole('link', { name: 'Ver comprobante' }).click();
    await expect(page.getByRole('heading', { name: 'Comprobante de compra' })).toBeVisible();
    expect(await ancho()).toBeLessThanOrEqual(390);
});
