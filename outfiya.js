// outfiya.js - Motor desacoplado - Outfiya v2 - Puerto 3000 - Cero inline HTML
const API_BASE = 'http://localhost:3000/api';

const EstadoApp = {
  seccionActual: 'inicio',
  productos: [],
  productoSeleccionado: null,
  carrito: [],
  puntosAltura: 30,
  nivelAltitud: 'MAR',
  filtroTalla: null
};

const mockProductos = [
  { id_producto: 1, nombre: 'Chaqueta Urban Cyber', precio: 129900, descripcion: 'Chaqueta estructura lana virgen, abrigo urbano inspirado en Bogotá 2600m.', piso_termico: 'FRÍO', talla: 'M', url_imagen: 'http://localhost:3000/uploads/Chaqueta Urban Cyber.jpg' },
  { id_producto: 2, nombre: 'Camiseta Oversize Violet', precio: 89900, descripcion: 'Tejido liviano, silueta fluida, espontaneidad del cálido.', piso_termico: 'CÁLIDO', talla: 'L', url_imagen: 'http://localhost:3000/uploads/Camiseta Oversize Violet.jpg' },
  { id_producto: 3, nombre: 'Hoodie Dark Neon', precio: 149900, descripcion: 'Capa media, punto versátil, búsqueda de identidad.', piso_termico: 'TEMPLADO', talla: 'M', url_imagen: 'http://localhost:3000/uploads/Hoodie Dark Neon.jpg' },
  { id_producto: 4, nombre: 'Top Cálido Brisa', precio: 79900, descripcion: 'Top coral con bordado turquesa inesperado, lino liviano.', piso_termico: 'CÁLIDO', talla: 'S', url_imagen: 'http://localhost:3000/uploads/Top Cálido Brisa.jpg' },
  { id_producto: 5, nombre: 'Jean Slim Fit Niebla', precio: 129900, descripcion: 'Denim creativo con mapa cartográfico en bolsillo, efecto niebla.', piso_termico: 'FRÍO', talla: 'M', url_imagen: 'http://localhost:3000/uploads/Jean Slim Fit Niebla.jpg' },
  { id_producto: 6, nombre: 'Vestido Páramo Endémico', precio: 259900, descripcion: 'Pieza endémica patchwork musgo, alta costura páramo, fondo blanco.', piso_termico: 'PÁRAMO', talla: 'S', url_imagen: 'http://localhost:3000/uploads/Vestido Páramo Endémico.jpg' }
];

const pisosInfo = [
  { id: 'CÁLIDO', label: 'Piso Cálido', rango: '0m - 1000m', desc: 'Espontaneidad, tejidos livianos', emoji: '🌵' },
  { id: 'TEMPLADO', label: 'Piso Templado', rango: '1000m - 2000m', desc: 'Versatilidad, punto y capas medias', emoji: '🌿' },
  { id: 'FRÍO', label: 'Piso Frío', rango: '2000m - 3000m', desc: 'Estructura, lana virgen', emoji: '🏔️' },
  { id: 'PÁRAMO', label: 'Piso Páramo', rango: '3000m - 4000m', desc: 'Piezas endémicas, alta costura', emoji: '🍂' },
];

document.addEventListener('DOMContentLoaded', () => {
  inicializarNavegacionSPA();
  inicializarFiltrosCatalogo();
  inicializarProbador3D();
  inicializarPasarelaCarrito();
  inicializarChatbotGuia();
  inicializarDetalle();
  renderPisosInicio();
  cargarCatalogoDesdeMariaDB();
  renderAltitudes();
});

function inicializarNavegacionSPA() {
  const enlaces = document.querySelectorAll('.nav-link');
  const vistas = document.querySelectorAll('.vista-seccion');
  enlaces.forEach(el => el.addEventListener('click', e => {
    const sec = e.currentTarget.dataset.seccion;
    enlaces.forEach(l => l.classList.remove('activo'));
    vistas.forEach(v => v.classList.remove('activa'));
    e.currentTarget.classList.add('activo');
    const vista = document.getElementById(`seccion-${sec}`);
    if (vista) vista.classList.add('activa');
    EstadoApp.seccionActual = sec;
    window.scrollTo(0,0);
  }));
  document.getElementById('btn-abrir-carrito')?.addEventListener('click', () => {
    document.querySelectorAll('.vista-seccion').forEach(v => v.classList.remove('activa'));
    document.getElementById('seccion-carrito')?.classList.add('activa');
    document.querySelectorAll('.nav-link').forEach(l => l.classList.remove('activo'));
    cambiarPaso(1);
  });
  document.getElementById('btn-volver-catalogo')?.addEventListener('click', () => document.querySelector('[data-seccion="catalogo"]')?.click());
}

function cambiarPaso(n) {
  document.querySelectorAll('.paso-item').forEach(p => p.classList.remove('activo'));
  document.querySelectorAll('.paso-panel').forEach(p => p.classList.remove('activo'));
  
  const header = document.querySelector(`.paso-item[data-paso="${n}"]`); 
  if (header) header.classList.add('activo');
  
 const panels = [null, 'paso-1-confirmacion', 'paso-2-pago', 'paso-3-confirmacion', 'paso-4-ticket'];
  const target = document.getElementById(panels[n]); 
  if (target) target.classList.add('activo');
}

function renderPisosInicio() {
  const cont = document.getElementById('grid-pisos-inicio');
  if (!cont) return;
  cont.innerHTML = '';
  pisosInfo.forEach(p => {
    const art = document.createElement('article');
    art.className = `tarjeta-piso ${p.id.toLowerCase() === 'cálido' ? 'calido' : p.id.toLowerCase()}`;
    art.dataset.piso = p.id;
    art.innerHTML = `<div class="piso-overlay"><span class="piso-m">${p.rango}</span><h3>${p.label}</h3><p>${p.desc}</p></div><div style="position:absolute;top:14px;right:14px;font-size:28px">${p.emoji}</div>`;
    art.addEventListener('click', () => {
      document.querySelector('[data-seccion="colecciones"]')?.click();
      renderColeccionesDetalle(p.id);
    });
    cont.appendChild(art);
  });

  const dest = document.getElementById('destacados-inicio');
  if (dest) {
    dest.innerHTML = '';
    mockProductos.slice(0,3).forEach(pr => dest.appendChild(crearCardProducto(pr)));
  }
}

function renderColeccionesDetalle(filtro) {
  const gal = document.getElementById('galeria-conceptos-piso');
  if (!gal) return;
  gal.innerHTML = '';
  const lista = filtro ? pisosInfo.filter(p => p.id === filtro) : pisosInfo;
  lista.forEach(p => {
    const div = document.createElement('div');
    div.style.cssText = 'background:#fff;border:1px solid var(--line);border-radius:16px;padding:22px;margin-bottom:14px;display:grid;grid-template-columns:120px 1fr auto;gap:18px;align-items:center';
    div.innerHTML = `<div style="font-size:56px;text-align:center">${p.emoji}</div><div><span class="badge-piso">${p.rango}</span><h3 style="margin:6px 0">${p.label}</h3><p style="color:var(--ink2);font-size:14px">Colección inspirada en ${p.desc.toLowerCase()}. Concepto de diseño único por territorio.</p></div><button class="btn-primario" data-goto="${p.id}">Ver catálogo ${p.id}</button>`;
    div.querySelector('button')?.addEventListener('click', (e) => {
      const piso = e.currentTarget.dataset.goto;
      document.querySelector('[data-seccion="catalogo"]')?.click();
      setTimeout(() => filtrarPorPiso(piso), 100);
    });
    gal.appendChild(div);
  });
}

async function cargarCatalogoDesdeMariaDB() {
  const cont = document.getElementById('grilla-productos-contenedor');
  try {
    const res = await fetch(`${API_BASE}/productos`);
    if (!res.ok) throw new Error('API no disponible');
    const data = await res.json();
    EstadoApp.productos = data.length ? data : mockProductos;
  } catch (e) {
    EstadoApp.productos = mockProductos;
    if (cont) cont.innerHTML = '<p style="color:var(--ink2);font-size:13px;margin-bottom:10px">⚠️ MariaDB no conectada (localhost:5234). Usando catálogo mock.</p>' + (cont.innerHTML || '');
  }
  renderizarGrillaProductos(EstadoApp.productos);
  renderSelectProbador();
}


function escaparHTML(valor) {
  return String(valor ?? '').replace(/[&<>"']/g, caracter => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  }[caracter]));
}

function renderizarGrillaProductos(lista) {
    const contenedor = document.getElementById('grilla-productos-contenedor');
    contenedor.innerHTML = '';

    if (lista.length === 0) {
        contenedor.innerHTML = '<p class="vacio-msg">No se encontraron prendas para los filtros seleccionados.</p>';
        return;
    }

    lista.forEach(prod => {
        // Obtenemos la ruta de forma independiente y segura para cada producto
        let imgPath = obtenerRutaImagen(prod);

        const card = document.createElement('article');
        card.className = 'tarjeta-prenda-card';
        card.innerHTML = `
            <span class="badge-piso">${escaparHTML(prod.piso_termico || 'CÁLIDO')}</span>
            <div class="img"><img src="${escaparHTML(imgPath)}" alt="${escaparHTML(prod.nombre)}" style="width:100%;height:190px;object-fit:cover;border-radius:12px;" onerror="this.src='https://via.placeholder.com/300x190?text=${encodeURIComponent(prod.nombre)}'" /></div>
            <div>
                <h3>${escaparHTML(prod.nombre)}</h3>
                <p style="color:#71717a; font-size:0.85rem;">${escaparHTML(prod.descripcion || '')}</p>
                <p style="font-weight:bold; margin-top:0.5rem;">$${Number(prod.precio).toLocaleString('es-CO')} COP</p>
                <button class="btn-primario btn-ver-detalle" style="width:100%; margin-top:0.8rem;" data-id="${prod.id_producto}">Ver Prenda</button>
            </div>
        `;
        card.querySelector('.btn-ver-detalle').addEventListener('click', () => verDetallePrenda(prod));
        contenedor.appendChild(card);
    });
}

function crearCardProducto(prod) {
  const card = document.createElement('article');
  card.className = 'tarjeta-prenda-card';
  card.innerHTML = `
    <div class="img">${prod.imagen || '🧥'}</div>
    <div class="body">
      <span class="badge-piso">${prod.piso_termico || 'CÁLIDO'} · ${prod.genero || 'UNISEX'}</span>
      <h3 style="margin:6px 0 4px">${prod.nombre}</h3>
      <p style="color:var(--ink2);font-size:13px;min-height:34px">${(prod.descripcion||'').slice(0,80)}...</p>
      <p style="font-weight:800;margin-top:8px">$${Number(prod.precio).toLocaleString('es-CO')} COP</p>
      <button class="btn-primario" style="width:100%;margin-top:10px" data-id="${prod.id_producto}">Ver Prenda</button>
    </div>`;
  card.querySelector('button')?.addEventListener('click', () => verDetallePrenda(prod));
  return card;
}

function verDetallePrenda(producto) {
    EstadoApp.productoSeleccionado = producto;
    document.getElementById('detalle-prenda-nombre').textContent = producto.nombre;
    document.getElementById('detalle-prenda-concepto').textContent = producto.descripcion || 'Sin descripción conceptual.';
    document.getElementById('detalle-prenda-precio').textContent = `$${Number(producto.precio).toLocaleString('es-CO')} COP`;
    document.getElementById('detalle-prenda-piso').textContent = producto.piso_termico || 'CÁLIDO';

    // IMAGEN PRINCIPAL - FIX
    let imgPath = obtenerRutaImagen(producto);

    const mainImg = document.getElementById('main-img-detalle');
    if (mainImg) {
        mainImg.src = imgPath;
        mainImg.alt = producto.nombre;
    }

    // Thumbs (misma imagen por ahora, puedes agregar más)
    const thumbs = document.getElementById('thumbs-detalle');
    if (thumbs) {
        thumbs.innerHTML = '';
        [imgPath, imgPath, imgPath].forEach((src, i) => {
            const div = document.createElement('div');
            div.className = 'thumb' + (i===0?' on':'');
            div.innerHTML = `<img src="${src}" style="width:100%;height:100%;object-fit:cover;border-radius:8px;" />`;
            div.addEventListener('click', () => {
                document.querySelectorAll('.thumb').forEach(x=>x.classList.remove('on'));
                div.classList.add('on');
                mainImg.src = src;
            });
            thumbs.appendChild(div);
        });
    }

    // Tallas
    const tallasCont = document.getElementById('detalle-tallas');
    if (tallasCont) {
        tallasCont.innerHTML = '';
        ['S','M','L','XL'].forEach(t => {
            const c = document.createElement('span');
            c.className = 'chip' + (t===producto.talla?' sel':'');
            c.textContent = t;
            c.addEventListener('click', () => {
                tallasCont.querySelectorAll('.chip').forEach(x=>x.classList.remove('sel'));
                c.classList.add('sel');
            });
            tallasCont.appendChild(c);
        });
    }

    document.querySelectorAll('.vista-seccion').forEach(v => v.classList.remove('activa'));
    document.getElementById('seccion-prenda-detalle').classList.add('activa');
}

function inicializarDetalle() {
  document.getElementById('btn-add-carrito')?.addEventListener('click', () => {
    if (!EstadoApp.productoSeleccionado) return;
    EstadoApp.carrito.push(EstadoApp.productoSeleccionado);
    actualizarBadgeCarrito();
    renderCarrito();
    document.querySelectorAll('.vista-seccion').forEach(v=>v.classList.remove('activa'));
    document.getElementById('seccion-carrito')?.classList.add('activa');
  });
  document.getElementById('btn-probar-desde-detalle')?.addEventListener('click', () => {
    document.querySelector('[data-seccion="probador"]')?.click();
    if (EstadoApp.productoSeleccionado) {
      const sel = document.getElementById('select-prenda-probador');
      if (sel) sel.value = EstadoApp.productoSeleccionado.nombre;
      const tag = document.getElementById('prenda-tag-probador');
      if (tag) tag.textContent = EstadoApp.productoSeleccionado.nombre;
    }
  });
}

function inicializarFiltrosCatalogo() {
  document.querySelectorAll('.btn-filtro-opt').forEach(btn => btn.addEventListener('click', e => {
    document.querySelectorAll('.btn-filtro-opt').forEach(b=>b.classList.remove('activo'));
    e.currentTarget.classList.add('activo');
    filtrarPorPiso(e.currentTarget.dataset.filtro);
  }));
  document.getElementById('select-filtro-genero')?.addEventListener('change', aplicarFiltros);
  document.querySelectorAll('#filtro-tallas .chip').forEach(ch => ch.addEventListener('click', e => {
    const t = e.currentTarget.dataset.talla;
    EstadoApp.filtroTalla = EstadoApp.filtroTalla === t ? null : t;
    document.querySelectorAll('#filtro-tallas .chip').forEach(x=>x.classList.toggle('sel', x.dataset.talla===EstadoApp.filtroTalla));
    aplicarFiltros();
  }));
}

function filtrarPorPiso(filtro) {
  document.querySelectorAll('.btn-filtro-opt').forEach(b=>b.classList.toggle('activo', b.dataset.filtro===filtro));
  aplicarFiltros();
}

function aplicarFiltros() {
  const pisoBtn = document.querySelector('.btn-filtro-opt.activo');
  const piso = pisoBtn ? pisoBtn.dataset.filtro : 'TODOS';
  const genero = document.getElementById('select-filtro-genero')?.value || 'TODOS';
  let lista = [...EstadoApp.productos];
  if (piso !== 'TODOS') lista = lista.filter(p=>p.piso_termico===piso);
  if (genero !== 'TODOS') lista = lista.filter(p=>(p.genero||'UNISEX')===genero);
  if (EstadoApp.filtroTalla) lista = lista.filter(p=>p.talla===EstadoApp.filtroTalla);
  renderizarGrillaProductos(lista);
}

function renderSelectProbador() {
  const sel = document.getElementById('select-prenda-probador');
  if (!sel) return;
  sel.innerHTML = '';
  EstadoApp.productos.forEach(p => {
    const opt = document.createElement('option'); opt.value = p.nombre; opt.textContent = p.nombre; sel.appendChild(opt);
  });
}

function inicializarProbador3D() {
  const inputEst = document.getElementById('input-estatura');
  const inputPeso = document.getElementById('input-peso');
  const lblEst = document.getElementById('lbl-estatura');
  const lblPeso = document.getElementById('lbl-peso');
  const avatar = document.getElementById('avatar-humanizado');
  const form = document.getElementById('form-probador-biometrico');
  if (!inputEst || !inputPeso) return;

  const actualizar = () => {
    const est = parseInt(inputEst.value); const pes = parseInt(inputPeso.value);
    if (lblEst) lblEst.textContent = est; 
    if (lblPeso) lblPeso.textContent = pes;
    const scaleY = est / 170; const scaleX = 1 + (pes - 65) / 110;
    if (avatar) avatar.style.transform = `scale(${scaleX.toFixed(2)}, ${scaleY.toFixed(2)})`;
    const imc = pes / Math.pow(est/100,2);
    let talla = 'M';
    if (imc < 19) talla = 'S'; else if (imc < 25) talla = 'M'; else if (imc < 29) talla = 'L'; else talla = 'XL';
    const tagTalla = document.getElementById('talla-recomendada');
    if (tagTalla) tagTalla.textContent = talla;
    // sincroniza con cuenta
    const ce = document.getElementById('cuenta-estatura'); const cp = document.getElementById('cuenta-peso');
    if (ce) ce.value = est; if (cp) cp.value = pes;
  };
  inputEst.addEventListener('input', actualizar);
  inputPeso.addEventListener('input', actualizar);
  actualizar();

  document.getElementById('select-prenda-probador')?.addEventListener('change', e => {
    const tag = document.getElementById('prenda-tag-probador');
    if (tag) tag.textContent = e.target.value;
  });

  if (form) {
    form.addEventListener('submit', async e => {
      e.preventDefault();
      const payload = {
        id_usuario: 1,
        email: document.getElementById('cuenta-correo')?.value || 'juan@outfiya.com',
        prenda: document.getElementById('select-prenda-probador')?.value || 'Prenda Desconocida',
        altura: parseFloat(inputEst.value),
        peso: parseFloat(inputPeso.value)
      };
      const alerta = document.getElementById('probador-alerta-resultado');
      
      try {
        const res = await fetch(`${API_BASE}/tickets`, { 
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload) 
        });
        const data = await res.json();
        
        if (data.success) {
          if (alerta) alerta.textContent = `✅ ¡Ticket Biométrico #${data.ticketId} guardado con éxito en MariaDB!`;
          alert(`¡Ticket #${data.ticketId} emitido y registrado en la base de datos!`);
        } else {
          throw new Error(data.error);
        }
      } catch (err) {
        console.error('Error enviando ticket:', err);
        if (alerta) alerta.textContent = `⚠️ Error al guardar en base de datos: ${err.message}`;
      }
    });
  }
} // <-- AQUÍ FALTABA LA LLAVE DE CIERRE DE inicializarProbador3D()

function actualizarBadgeCarrito() {
  const badge = document.getElementById('contador-carrito-badge');
  if (badge) badge.textContent = EstadoApp.carrito.length;
}

function renderCarrito() {
  const lista = document.getElementById('carrito-items-lista');
  const totalEl = document.getElementById('carrito-monto-total');
  if (!lista) return;

  if (!EstadoApp.carrito.length) { 
    lista.innerHTML = `
      <div style="text-align:center; padding: 2rem; color: var(--ink2);">
        <p style="font-size: 1.2rem; margin-bottom: 1rem;">Tu bolsa de compras está vacía 🛍️</p>
        <button class="btn-primario" onclick="document.querySelector('[data-seccion=\\'catalogo\\']').click()">Explorar Catálogo</button>
      </div>`; 
    if (totalEl) totalEl.textContent = '0'; 
    return; 
  }

  let total = 0; 
  lista.innerHTML = '';
  
  EstadoApp.carrito.forEach((p, index) => {
    total += Number(p.precio);
    const row = document.createElement('div');
    row.style.cssText = 'display:flex; align-items:center; justify-content:space-between; padding:12px 0; border-bottom:1px solid var(--line); gap:12px;';
    
    let imgPath = obtenerRutaImagen(p);

    row.innerHTML = `
      <div style="display:flex; align-items:center; gap:12px;">
        <img src="${imgPath}" alt="${p.nombre}" style="width:60px; height:60px; object-fit:cover; border-radius:8px;" />
        <div>
          <h4 style="margin:0; font-size:15px;">${p.nombre}</h4>
          <p style="margin:4px 0 0; font-size:13px; color:var(--ink2);">Talla: <b>${p.talla || 'M'}</b></p>
        </div>
      </div>
      <div style="text-align:right;">
        <p style="margin:0; font-weight:bold; color:var(--accent);">$${Number(p.precio).toLocaleString('es-CO')} COP</p>
        <button class="btn-eliminar-item" data-index="${index}" style="background:none; border:none; color:#ef4444; font-size:12px; cursor:pointer; margin-top:4px;">Eliminar</button>
      </div>
    `;
    
    row.querySelector('.btn-eliminar-item').addEventListener('click', (e) => {
      const idx = parseInt(e.currentTarget.dataset.index);
      EstadoApp.carrito.splice(idx, 1);
      actualizarBadgeCarrito();
      renderCarrito();
    });

    lista.appendChild(row);
  });

  if (totalEl) totalEl.textContent = total.toLocaleString('es-CO');
  const resumenBox = document.getElementById('resumen-confirmacion-box');
  if (resumenBox) {
    resumenBox.innerHTML = `<b>${EstadoApp.carrito.length} artículos en total.</b><br>Monto aproximado a pagar: $${total.toLocaleString('es-CO')} COP`;
  }
}

function inicializarPasarelaCarrito() {
  // Escuchadores para los botones de las pestañas superiores (1, 2, 3, 4)
  document.querySelectorAll('.paso-item').forEach(item => {
    item.addEventListener('click', (e) => {
      const pasoNum = parseInt(e.currentTarget.dataset.paso);
      if (pasoNum) cambiarPaso(pasoNum);
    });
  });

  // Botón Siguiente del Paso 1 (Confirmación)
  document.getElementById('btn-ir-paso-2')?.addEventListener('click', () => {
    if (EstadoApp.carrito.length === 0) {
      alert('Tu carrito está vacío. Agrega al menos una prenda para continuar.');
      return;
    }
    cambiarPaso(2);
  });

  // Renderizar campos bancarios dinámicos según el radio seleccionado
  const renderCamposBancarios = () => {
    const contenedor = document.getElementById('form-datos-bancarios');
    if (!contenedor) return;
    
    const metodoSeleccionado = document.querySelector('input[name="metodo_pago"]:checked')?.value || 'PSE';
    
    if (metodoSeleccionado === 'PSE') {
      contenedor.innerHTML = `
        <h4 style="margin-bottom:10px">Datos Bancarios - PSE (Débito)</h4>
        <div class="field" style="margin-bottom:10px">
          <label>Selecciona tu Banco *</label>
          <select id="pse-banco" class="control-select" required>
            <option value="">-- Elige tu banco --</option>
            <option value="Bancolombia">Bancolombia</option>
            <option value="Davivienda">Davivienda</option>
            <option value="BBVA">BBVA Colombia</option>
            <option value="Nequi">Nequi</option>
            <option value="Daviplata">Daviplata</option>
          </select>
        </div>
        <div class="field">
          <label>Tipo de Persona *</label>
          <select id="pse-tipo-persona" class="control-select" required>
            <option value="Natural">Persona Natural</option>
            <option value="Juridica">Persona Jurídica</option>
          </select>
        </div>
      `;
    } else if (metodoSeleccionado === 'Tarjeta') {
      contenedor.innerHTML = `
        <h4 style="margin-bottom:10px">Datos de Tarjeta de Crédito / Débito</h4>
        <div class="field" style="margin-bottom:10px">
          <label>Número de Tarjeta *</label>
          <input type="text" id="tarjeta-numero" placeholder="4000 1234 5678 9010" maxlength="19" required style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line)" />
        </div>
        <div style="display:grid; grid-template-columns: 1fr 1fr; gap:10px;">
          <div class="field">
            <label>Vencimiento (MM/AA) *</label>
            <input type="text" id="tarjeta-vencimiento" placeholder="MM/AA" maxlength="5" required style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line)" />
          </div>
          <div class="field">
            <label>CVV *</label>
            <input type="password" id="tarjeta-cvv" placeholder="123" maxlength="4" required style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line)" />
          </div>
        </div>
      `;
    } else {
      contenedor.innerHTML = `
        <h4 style="margin-bottom:10px">Pasarela ${metodoSeleccionado}</h4>
        <div class="field">
          <label>Correo asociado a la cuenta *</label>
          <input type="email" id="pasarela-correo" placeholder="tu@correo.com" required style="width:100%;padding:8px;border-radius:6px;border:1px solid var(--line)" />
        </div>
      `;
    }
  };

  // Escuchar cambios en los radios de método de pago
  document.querySelectorAll('input[name="metodo_pago"]').forEach(radio => {
    radio.addEventListener('change', renderCamposBancarios);
  });
  
  // Renderizar al cargar la pasarela
  renderCamposBancarios();

  // Validaciones estrictas al hacer clic en Siguiente (Paso 2 -> Paso 3)
  document.getElementById('btn-ir-paso-3')?.addEventListener('click', () => {
    const metodo = document.querySelector('input[name="metodo_pago"]:checked')?.value;
    
    if (metodo === 'PSE') {
      const banco = document.getElementById('pse-banco')?.value;
      if (!banco) {
        alert('Por favor selecciona tu banco para continuar con PSE.');
        return;
      }
    } else if (metodo === 'Tarjeta') {
      const num = document.getElementById('tarjeta-numero')?.value.trim();
      const venci = document.getElementById('tarjeta-vencimiento')?.value.trim();
      const cvv = document.getElementById('tarjeta-cvv')?.value.trim();
      if (!num || !venci || !cvv) {
        alert('Por favor completa todos los datos obligatorios de la tarjeta.');
        return;
      }
    } else if (metodo === 'MercadoPago') {
      const correoPasarela = document.getElementById('pasarela-correo')?.value.trim();
      if (!correoPasarela) {
        alert('Por favor ingresa el correo asociado a tu cuenta.');
        return;
      }
    }

    cambiarPaso(3);
  });

  // Botones de retroceso dentro del flujo
  document.getElementById('btn-volver-paso-1')?.addEventListener('click', () => cambiarPaso(1));
  document.getElementById('btn-volver-paso-2')?.addEventListener('click', () => cambiarPaso(2));
  
  // Procesar orden final en Paso 3 -> Paso 4
  document.getElementById('btn-procesar-orden-final')?.addEventListener('click', () => {
    cambiarPaso(4);
    const recibo = document.getElementById('ticket-recibo-imprimible');
    const totalActual = document.getElementById('carrito-monto-total')?.textContent || '0';
    if (recibo) {
      recibo.innerHTML = `
        <p><strong>Orden:</strong> OUT-${Math.floor(Math.random()*900000+100000)}</p>
        <p><strong>Cliente:</strong> ${document.getElementById('cuenta-correo')?.value || 'juan@correo.com'}</p>
        <p><strong>Total Pagado:</strong> $${totalActual} COP</p>
        <p><strong>Estado:</strong> ✅ COMPLETADO (SSL cifrado)</p>
      `;
    }

    // Vaciar carrito
    EstadoApp.carrito = [];
    actualizarBadgeCarrito();
    renderCarrito();

    // Botón para nueva compra
    const contenedorTicket = document.getElementById('paso-4-ticket');
    if (contenedorTicket && !document.getElementById('btn-nueva-compra')) {
      const btnNueva = document.createElement('button');
      btnNueva.id = 'btn-nueva-compra';
      btnNueva.className = 'btn-primario';
      btnNueva.textContent = '🛍️ Hacer otra compra / Volver al Catálogo';
      btnNueva.style.marginTop = '20px';
      btnNueva.style.width = '100%';
      
      btnNueva.addEventListener('click', () => {
        cambiarPaso(1);
        document.querySelector('[data-seccion="catalogo"]')?.click();
      });
      
      contenedorTicket.appendChild(btnNueva);
    }
  });

  document.getElementById('btn-descargar-ticket')?.addEventListener('click', () => {
    const txt = document.getElementById('ticket-recibo-imprimible')?.innerText || '';
    const blob = new Blob([txt], {type:'text/plain'}); 
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); 
    a.href = url; 
    a.download = 'ticket_outfiya.txt'; 
    a.click();
  });
}

function renderAltitudes() {
  const niveles = [
    { id:'MAR', nombre:'MAR - Curiosos', valor:'Espontaneidad', rango:'CÁLIDO' },
    { id:'BOSQUE', nombre:'BOSQUE - Tejedores', valor:'Búsqueda', rango:'TEMPLADO' },
    { id:'NIEBLA', nombre:'NIEBLA - Cartógrafos', valor:'Creatividad', rango:'FRÍO' },
    { id:'PÁRAMO', nombre:'PÁRAMO - Alquimistas', valor:'Lo Único', rango:'PÁRAMO' },
    { id:'CUMBRE', nombre:'CUMBRE - Guardianes', valor:'Lo Propio', rango:'NEVADO' },
  ];
  const grid = document.getElementById('altitudes-grid');
  if (!grid) return;
  grid.innerHTML = '';
  niveles.forEach(n => {
    const d = document.createElement('div'); d.className = 'alt-card' + (n.id===EstadoApp.nivelAltitud?' on':'');
    d.innerHTML = `<strong>${n.id}</strong><p style="font-size:12px;margin-top:4px">${n.nombre.split(' - ')[1]}</p><p style="font-size:11px;color:${n.id===EstadoApp.nivelAltitud?'#fff':'var(--ink2)'}">${n.valor}</p>`;
    grid.appendChild(d);
  });
}

function inicializarChatbotGuia() {
  const btn = document.getElementById('btn-chatbot-burbuja');
  const cerrar = document.getElementById('btn-cerrar-chat');
  const ventana = document.getElementById('ventana-chatbot');
  const form = document.getElementById('form-chatbot-input');
  const input = document.getElementById('input-msg-chat');
  const historial = document.getElementById('historial-mensajes-chat');
  if (!btn) return;
  btn.addEventListener('click', () => ventana.classList.toggle('oculta'));
  cerrar?.addEventListener('click', () => ventana.classList.add('oculta'));
  document.querySelectorAll('.btn-chat-opt').forEach(b => b.addEventListener('click', e => {
    const preg = e.currentTarget.dataset.preg;
    inyectarMensaje('usuario', preg);
    resolverChatbot(preg);
  }));
  form?.addEventListener('submit', async e => {
    e.preventDefault();
    const txt = input.value.trim(); if (!txt) return;
    inyectarMensaje('usuario', txt); input.value = '';
    resolverChatbot(txt);
  });
  document.getElementById('input-file-reclamo')?.addEventListener('change', e => {
    if (e.target.files.length) inyectarMensaje('asistente', `📎 Documento "${e.target.files[0].name}" recibido para ticket/reclamación. Lo revisaremos.`);
  });

  async function resolverChatbot(texto) {
    try {
      const res = await fetch(`${API_BASE}/chatbot`, { method:'POST', headers:{'Content-Type':'application/json'}, body: JSON.stringify({ mensaje: texto }) });
      const data = await res.json();
      inyectarMensaje('asistente', data.respuesta);
    } catch (err) {
      if (/envio/.test(texto)) inyectarMensaje('asistente','Envíos 2-4 días, gratis desde $200k, SSL seguro.');
      else if (/medida/.test(texto)) inyectarMensaje('asistente','Probador 3D: ajusta altura/peso y te digo S, M, L, XL.');
      else if (/nivel|altitud/.test(texto)) inyectarMensaje('asistente','5 niveles: MAR → BOSQUE → NIEBLA → PÁRAMO → CUMBRE. Puntos por confianza, no solo gasto.');
      else inyectarMensaje('asistente','Soy tu guía sabio. Pregúntame por envíos, medidas, pagos o niveles.');
    }
  }

  function inyectarMensaje(emisor, texto) {
    if (!historial) return;
    const div = document.createElement('div'); div.className = `msg-chat ${emisor}`; div.textContent = texto;
    historial.appendChild(div); historial.scrollTop = historial.scrollHeight;
  }
}

// Guardar cuenta y guardar medidas en la base de datos
document.addEventListener('click', async e => {
  if (e.target.id === 'btn-guardar-cuenta' || e.target.id === 'btn-guardar-perfil') {
    const est = parseFloat(document.getElementById('cuenta-estatura')?.value || document.getElementById('input-estatura')?.value || 170);
    const peso = parseFloat(document.getElementById('cuenta-peso')?.value || document.getElementById('input-peso')?.value || 83);
    
    // Sincronizar UI del probador
    const inEst = document.getElementById('input-estatura');
    const inPes = document.getElementById('input-peso');
    if (inEst) inEst.value = est;
    if (inPes) inPes.value = peso;
    if (inEst) inEst.dispatchEvent(new Event('input'));

    try {
      const res = await fetch(`${API_BASE}/medidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: 1, estatura: est, peso })
      });
      const data = await res.json();
      
      if (data.success) {
        alert('✅ Perfil y medidas guardadas correctamente en MariaDB');
      } else {
        alert('⚠️ Error de servidor: ' + data.error);
      }
    } catch (err) {
      console.error('Error guardando medidas:', err);
      alert('⚠️ No se pudo guardar en MariaDB. Verifica que el servidor esté activo.');
    }
  }

  if (e.target.id === 'btn-solicitar-reembolso') alert('Solicitud de reembolso enviada. Evaluaremos si cumple requisitos.');
  
  if (e.target.id === 'btn-login') {
    const pass = document.getElementById('login-pass')?.value || '';
    if (!/^(?=.*[A-Z])(?=.*\d).{8,}$/.test(pass)) { 
      alert('Clave insegura: 8+ caracteres, 1 mayúscula, 1 número'); 
      return; 
    }
    alert('Login OK - Rol: ' + (document.getElementById('select-rol-trabajador')?.value || 'CLIENTE'));
  }
});


// ============ REGISTRO / LOGIN REAL CON ROLES ============
EstadoApp.usuario = JSON.parse(localStorage.getItem('outfiya_user') || 'null');

function initRegistroLogin() {
  const formReg = document.getElementById('form-registro');
  if (formReg) {
    formReg.addEventListener('submit', async (e) => {
      e.preventDefault();
      const payload = {
        nombre: document.getElementById('reg-nombre').value.trim(),
        apellido: document.getElementById('reg-apellido').value.trim(),
        correo: document.getElementById('reg-correo').value.trim(),
        telefono: document.getElementById('reg-telefono').value.trim(),
        contrasena: document.getElementById('reg-pass').value
      };
      try {
        const res = await fetch(`${API_BASE}/usuarios/registro`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify(payload)
        });
        const data = await res.json();
        const msgEl = document.getElementById('reg-msg');
        if (res.ok) {
          msgEl.textContent = `✅ Cuenta creada con éxito. ¡Ya puedes iniciar sesión!`;
          msgEl.style.color = 'green';
          formReg.reset();
        } else {
          msgEl.textContent = data.error || 'Error al registrarse';
          msgEl.style.color = '#c8553d';
        }
      } catch (err) {
        document.getElementById('reg-msg').textContent = 'Error de conexión con el servidor.';
      }
    });
  }

  const formLogin = document.getElementById('form-login');
  if (formLogin) {
    formLogin.addEventListener('submit', async (e) => {
      e.preventDefault();
      const correo = document.getElementById('login-correo').value.trim();
      const contrasena = document.getElementById('login-pass').value;
      const msgEl = document.getElementById('login-msg');
      try {
        const res = await fetch(`${API_BASE}/usuarios/login`, {
          method: 'POST', 
          headers: { 'Content-Type': 'application/json' }, 
          body: JSON.stringify({ correo, contrasena })
        });
        const data = await res.json();
        if (!res.ok) { 
          msgEl.textContent = data.error || 'Credenciales inválidas'; 
          msgEl.style.color = '#c8553d'; 
          return; 
        }
        
        // Guardar sesión activa
        EstadoApp.usuario = data;
        localStorage.setItem('outfiya_user', JSON.stringify(data));
        msgEl.textContent = `¡Bienvenido, ${data.nombre}! Redirigiendo a tu cuenta...`;
        msgEl.style.color = 'green';

        // Rellenar automáticamente la sección de cuenta con los datos logueados
        cargarDatosCuentaEnUI(data);

        setTimeout(() => {
          if (['ADMINISTRADOR', 'PLANTA', 'PUNTO'].includes(data.rol)) {
            if (confirm(`Eres ${data.rol}. ¿Ir al panel de inventario administrativo?`)) {
              window.location.href = 'admin.html';
              return;
            }
          }
          document.querySelector('[data-seccion="cuenta"]')?.click();
        }, 800);

      } catch (err) {
        msgEl.textContent = 'Error de conexión con el servidor.';
        msgEl.style.color = '#c8553d';
      }
    });
  }
}

function cargarDatosCuentaEnUI(user) {
  if (!user) return;
  const cNombre = document.getElementById('cuenta-nombre');
  const cApellido = document.getElementById('cuenta-apellido');
  const cCorreo = document.getElementById('cuenta-correo');
  const cTelefono = document.getElementById('cuenta-telefono');
  
  if (cNombre) cNombre.value = user.nombre || '';
  if (cApellido) cApellido.value = user.apellido || '';
  if (cCorreo) cCorreo.value = user.correo || '';
  if (cTelefono) cTelefono.value = user.telefono || '';

  // MOSTRAR U OCULTAR EL PANEL DE ROLES SEGÚN EL TIPO DE USUARIO
  const panelRoles = document.getElementById('contenedor-panel-roles');
  const selectRol = document.getElementById('select-rol-trabajador');
  
  if (panelRoles && selectRol) {
    const rolActual = (user.rol || '').toUpperCase();
    // Solo mostrar si es un rol administrativo/especial
    if (['ADMINISTRADOR', 'ADMIN', 'PLANTA', 'PUNTO', 'PUNTO DE VENTA'].includes(rolActual)) {
      panelRoles.style.display = 'block';
      selectRol.value = rolActual;
    } else {
      // Ocultar por completo para clientes
      panelRoles.style.display = 'none';
    }
  }
}

// Manejar la actualización de datos desde la sección Mi Cuenta
document.addEventListener('submit', async e => {
  if (e.target.id === 'form-actualizar-cuenta') {
    e.preventDefault();
    if (!EstadoApp.usuario) {
      alert('⚠️ Debes iniciar sesión para actualizar tus datos.');
      document.querySelector('[data-seccion="registro"]')?.click();
      return;
    }

    const est = parseFloat(document.getElementById('cuenta-estatura')?.value || 170);
    const peso = parseFloat(document.getElementById('cuenta-peso')?.value || 70);
    const nombre = document.getElementById('cuenta-nombre')?.value.trim();
    const apellido = document.getElementById('cuenta-apellido')?.value.trim();
    const telefono = document.getElementById('cuenta-telefono')?.value.trim();
    const msgEl = document.getElementById('cuenta-msg');

    try {
      // 1. Guardar medidas biométricas
      const resMedidas = await fetch(`${API_BASE}/medidas`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ id_usuario: EstadoApp.usuario.id_usuario || 1, estatura: est, peso })
      });
      const dataMedidas = await resMedidas.json();

      if (dataMedidas.success) {
        if (msgEl) {
          msgEl.textContent = '✅ ¡Perfil y medidas actualizados correctamente en la base de datos!';
          msgEl.style.color = 'green';
        }
        alert('✅ Tus datos y medidas se han actualizado con éxito.');
      } else {
        throw new Error(dataMedidas.error || 'Error al guardar medidas');
      }
    } catch (err) {
      console.error('Error actualizando cuenta:', err);
      if (msgEl) {
        msgEl.textContent = '⚠️ Error al guardar en base de datos: ' + err.message;
        msgEl.style.color = '#c8553d';
      }
    }
  }
});

// Cargar automáticamente los datos del usuario logueado al cargar la página si existe sesión previa
document.addEventListener('DOMContentLoaded', () => {
  if (EstadoApp.usuario) {
    cargarDatosCuentaEnUI(EstadoApp.usuario);
  }
});



// Cargar colecciones, metodos pago, inventario detalle
async function cargarColeccionesReal() {
  const cont = document.getElementById('galeria-conceptos-piso');
  if (!cont) return;
  const escapar = valor => String(valor ?? '').replace(/[&<>"']/g, ch => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]));
  try {
    const [resCols, resProductos] = await Promise.all([
      fetch(`${API_BASE}/colecciones`),
      fetch(`${API_BASE}/productos`)
    ]);
    if (!resCols.ok || !resProductos.ok) throw new Error('API no disponible');
    const cols = await resCols.json();
    const productos = await resProductos.json();
    if (!Array.isArray(cols) || cols.length === 0) {
      renderColeccionesDetalle();
      return;
    }
    if (Array.isArray(productos)) EstadoApp.productos = productos;
    cont.innerHTML = '';
    cols.forEach(c => {
      const relacionadas = (Array.isArray(productos) ? productos : []).filter(p => Number(p.id_coleccion) === Number(c.id_coleccion));
      const articulo = document.createElement('article');
      articulo.style.cssText = 'background:white;border:1px solid var(--line);border-radius:16px;padding:20px;margin-bottom:14px;display:grid;grid-template-columns:minmax(0,1fr) auto;gap:14px;align-items:center';
      const nombres = relacionadas.slice(0, 3).map(p => escapar(p.nombre)).join(' · ');
      articulo.innerHTML = `
        <div>
          <span class="badge-piso">${escapar(c.temporada || 'Colección propia')}${c.anio ? ' · ' + escapar(c.anio) : ''}</span>
          <h3 style="font-size:20px;margin:7px 0 4px">${escapar(c.nombre)}</h3>
          <p style="color:var(--ink2);font-size:14px">${escapar(c.descripcion || 'Colección de Outfiya.')}</p>
          <p style="font-size:12px;color:#71717a;margin-top:8px">${relacionadas.length} prenda(s) asociada(s)${nombres ? ': ' + nombres : ''}</p>
        </div>
        <button class="btn-primario" type="button">Ver prendas</button>`;
      articulo.querySelector('button').addEventListener('click', () => {
        document.querySelector('[data-seccion="catalogo"]')?.click();
        document.querySelectorAll('.btn-filtro-opt').forEach(b => b.classList.toggle('activo', b.dataset.filtro === 'TODOS'));
        const genero = document.getElementById('select-filtro-genero');
        if (genero) genero.value = 'TODOS';
        EstadoApp.filtroTalla = null;
        document.querySelectorAll('#filtro-tallas .chip').forEach(ch => ch.classList.remove('sel'));
        const lista = (Array.isArray(EstadoApp.productos) ? EstadoApp.productos : []).filter(p => Number(p.id_coleccion) === Number(c.id_coleccion));
        renderizarGrillaProductos(lista);
      });
      cont.appendChild(articulo);
    });
  } catch (e) {
    // La tienda sigue mostrando las colecciones conceptuales si no hay conexión a la API.
    renderColeccionesDetalle();
  }
}

async function cargarInventarioDetalle(id_producto) {
  try {
    const res = await fetch(`${API_BASE}/inventario/${id_producto}`);
    if (!res.ok) return;
    const inv = await res.json();
    const cont = document.getElementById('detalle-tallas');
    const stockP = document.getElementById('detalle-stock');
    if (cont) {
      cont.innerHTML='';
      const tallas = [...new Set(inv.map(i=>i.talla))];
      tallas.forEach(t=>{
        const total = inv.filter(i=>i.talla===t).reduce((a,b)=>a+b.stock,0);
        const sem = total>10?'🟢':total>=3?'🟡':'🔴';
        const chip = document.createElement('span'); chip.className='chip'; chip.textContent=`${t} ${sem} ${total} und`;
        if (total===0) chip.style.opacity='.4';
        cont.appendChild(chip);
      });
    }
    if (stockP && inv.length) {
      const total = inv.reduce((a,b)=>a+b.stock,0);
      stockP.textContent = `Stock total: ${total} unidades | Semaforo: ${total>10?'VERDE':total>=3?'AMARILLO':'ROJO CRÍTICO'}`;
    }
  } catch(e){}
}

function obtenerRutaImagen(prod) {
    if (prod.url_imagen && prod.url_imagen.trim().length > 0) {
        return prod.url_imagen;
    }
    const id = Number(prod.id_producto);
    if (id === 1) return 'http://localhost:3000/uploads/Chaqueta Urban Cyber.jpg';
    if (id === 2) return 'http://localhost:3000/uploads/Camiseta Oversize Violet.jpg';
    if (id === 3) return 'http://localhost:3000/uploads/Hoodie Dark Neon.jpg';
    if (id === 4) return 'http://localhost:3000/uploads/Top Cálido Brisa.jpg';
    if (id === 5) return 'http://localhost:3000/uploads/Jean Slim Fit Niebla.jpg';
    if (id === 6) return 'http://localhost:3000/uploads/Vestido Páramo Endémico.jpg';
    return 'http://localhost:3000/uploads/Camiseta Oversize Violet.jpg';
}

// Inicialización limpia al cargar la página
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initRegistroLogin();
    cargarColeccionesReal();
  }, 300);
});

// Parchear verDetallePrenda para que cargue inventario real
function obtenerRutaImagen(prod) {
    if (prod.url_imagen && prod.url_imagen.trim().length > 0) {
        return prod.url_imagen;
    }
    const id = Number(prod.id_producto);
    if (id === 1) return 'http://localhost:3000/uploads/Chaqueta Urban Cyber.jpg';
    if (id === 2) return 'http://localhost:3000/uploads/Camiseta Oversize Violet.jpg';
    if (id === 3) return 'http://localhost:3000/uploads/Hoodie Dark Neon.jpg';
    if (id === 4) return 'http://localhost:3000/uploads/Top Cálido Brisa.jpg';
    if (id === 5) return 'http://localhost:3000/uploads/Jean Slim Fit Niebla.jpg';
    if (id === 6) return 'http://localhost:3000/uploads/Vestido Páramo Endémico.jpg';
    return 'http://localhost:3000/uploads/Camiseta Oversize Violet.jpg';
}

// Inicialización limpia y parche único para detalle e inventario
document.addEventListener('DOMContentLoaded', () => {
  setTimeout(() => {
    initRegistroLogin();
    cargarColeccionesReal();
  }, 300);
});

// Parchear verDetallePrenda una única vez para que cargue inventario real
const verDetalleOriginal = window.verDetallePrenda;
window.verDetallePrenda = function(producto) {
  if (typeof verDetalleOriginal === 'function') {
    verDetalleOriginal(producto);
  } else {
    EstadoApp.productoSeleccionado = producto;
    document.getElementById('detalle-prenda-nombre').textContent = producto.nombre;
    document.getElementById('detalle-prenda-precio').textContent = `$${Number(producto.precio).toLocaleString('es-CO')} COP`;
    document.getElementById('detalle-prenda-concepto').textContent = producto.descripcion || '';
    document.getElementById('detalle-prenda-piso').textContent = producto.piso_termico || '';
    document.querySelectorAll('.vista-seccion').forEach(v => v.classList.remove('activa'));
    document.getElementById('seccion-prenda-detalle')?.classList.add('activa');
  }
  if (producto.id_producto) cargarInventarioDetalle(producto.id_producto);
};

// Parchear verDetallePrenda para que cargue inventario real
const verDetallePatched = function(producto) {
  if (typeof verDetalleOriginal === 'function') verDetalleOriginal(producto);
  else {
    // fallback si no existe
    EstadoApp.productoSeleccionado = producto;
    document.getElementById('detalle-prenda-nombre').textContent = producto.nombre;
    document.getElementById('detalle-prenda-precio').textContent = `$${Number(producto.precio).toLocaleString('es-CO')} COP`;
    document.getElementById('detalle-prenda-concepto').textContent = producto.descripcion||'';
    document.getElementById('detalle-prenda-piso').textContent = producto.piso_termico||'';
    document.querySelectorAll('.vista-seccion').forEach(v=>v.classList.remove('activa'));
    document.getElementById('seccion-prenda-detalle')?.classList.add('activa');
  }
  if (producto.id_producto) cargarInventarioDetalle(producto.id_producto);
};
// Reemplaza global
window.verDetallePrenda = verDetallePatched;