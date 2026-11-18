let catalogoSecciones = [];
let cursosSeleccionados = {}; // { "NombreCurso": [ {seccion, prioridad}, ... ] }
let datosGrafoGlobal = null;
let coloresPorCurso = {};

// Paleta de colores distintivos para los bloques del horario
const PALETA_CURSOS = [
    { bg: 'rgba(14, 165, 233, 0.25)', border: '#0ea5e9' }, // Sky
    { bg: 'rgba(16, 185, 129, 0.25)', border: '#10b981' }, // Emerald
    { bg: 'rgba(168, 85, 247, 0.25)', border: '#a855f7' }, // Purple
    { bg: 'rgba(245, 158, 11, 0.25)', border: '#f59e0b' }, // Amber
    { bg: 'rgba(236, 72, 153, 0.25)', border: '#ec4899' }, // Pink
    { bg: 'rgba(99, 102, 241, 0.25)', border: '#6366f1' }  // Indigo
];

window.onload = async () => {
    try {
        const resp = await fetch('/api/horarios/catalogo');
        catalogoSecciones = await resp.json();
        filtrarCatalogo();
    } catch (error) {
        mostrarToast("Error al conectar con el servidor Spring Boot.");
    }
};

function mostrarToast(mensaje) {
    const toast = document.getElementById('toast');
    toast.innerText = mensaje;
    toast.classList.remove('hidden');
    setTimeout(() => toast.classList.add('hidden'), 3500);
}

function filtrarCatalogo() {
    const texto = document.getElementById('buscadorCurso').value.toLowerCase().trim();
    const contenedor = document.getElementById('listaCatalogo');
    contenedor.innerHTML = '';

    const cursosMap = {};
    catalogoSecciones.forEach(sec => {
        if (!cursosMap[sec.curso]) cursosMap[sec.curso] = [];
        cursosMap[sec.curso].push(sec);
    });

    const nombresFiltrados = Object.keys(cursosMap).filter(c => c.toLowerCase().includes(texto));

    if (nombresFiltrados.length === 0) {
        contenedor.innerHTML = '<div class="empty-state">No se encontraron cursos con ese nombre.</div>';
        return;
    }

    nombresFiltrados.forEach(nombreCurso => {
        const secciones = cursosMap[nombreCurso];
        const creditos = secciones[0].creditos;
        const yaAgregado = !!cursosSeleccionados[nombreCurso];

        contenedor.innerHTML += `
            <div class="curso-catalogo">
                <div>
                    <strong>${nombreCurso}</strong>
                    <div class="curso-meta">${creditos} créditos • ${secciones.length} secciones disponibles</div>
                </div>
                <button class="btn-add" onclick="agregarCurso('${nombreCurso}')" ${yaAgregado ? 'disabled' : ''}>
                    ${yaAgregado ? 'Seleccionado' : '+ Elegir'}
                </button>
            </div>`;
    });
}

function agregarCurso(nombreCurso) {
    const maxCred = parseInt(document.getElementById('maxCreditos').value) || 20;
    const seccionesCurso = catalogoSecciones.filter(s => s.curso === nombreCurso);
    const creditosNuevo = seccionesCurso[0].creditos;

    if (calcularCreditosTotales() + creditosNuevo > maxCred) {
        mostrarToast(`Límite excedido: "${nombreCurso}" (${creditosNuevo} créd.) supera tu tope de ${maxCred} créditos.`);
        return;
    }

    // Asignar color único al curso
    const indexColor = Object.keys(coloresPorCurso).length % PALETA_CURSOS.length;
    coloresPorCurso[nombreCurso] = PALETA_CURSOS[indexColor];

    // Inicializar prioridades secuenciales (1°, 2°, 3°...)
    cursosSeleccionados[nombreCurso] = seccionesCurso.map((sec, idx) => ({
        ...sec,
        prioridad: idx + 1
    }));

    actualizarVistaSeleccion();
    filtrarCatalogo();
}

function quitarCurso(nombreCurso) {
    delete cursosSeleccionados[nombreCurso];
    delete coloresPorCurso[nombreCurso];
    actualizarVistaSeleccion();
    filtrarCatalogo();
}

// UX Inteligente: Evita prioridades duplicadas intercambiando valores automáticamente
function cambiarPrioridad(nombreCurso, idSeccion, nuevaPrioridad) {
    nuevaPrioridad = parseInt(nuevaPrioridad);
    const lista = cursosSeleccionados[nombreCurso];
    const seccionActual = lista.find(s => s.id === idSeccion);
    const prioridadAnterior = seccionActual.prioridad;

    const seccionConMismaPrioridad = lista.find(s => s.prioridad === nuevaPrioridad && s.id !== idSeccion);
    if (seccionConMismaPrioridad) {
        seccionConMismaPrioridad.prioridad = prioridadAnterior;
    }

    seccionActual.prioridad = nuevaPrioridad;
    actualizarVistaSeleccion();
}

function calcularCreditosTotales() {
    return Object.values(cursosSeleccionados).reduce((acc, lista) => {
        return acc + (lista.length > 0 ? lista[0].creditos : 0);
    }, 0);
}

function actualizarContadorCreditos() {
    const maxCred = parseInt(document.getElementById('maxCreditos').value) || 20;
    const actuales = calcularCreditosTotales();
    const porcentaje = Math.min(100, (actuales / maxCred) * 100);

    document.getElementById('creditosTope').innerText = maxCred;
    document.getElementById('creditosActuales').innerText = actuales;

    const barra = document.getElementById('barraCreditos');
    barra.style.width = `${porcentaje}%`;

    if (actuales > maxCred) {
        barra.style.backgroundColor = 'var(--danger)';
    } else if (porcentaje >= 85) {
        barra.style.backgroundColor = 'var(--warning)';
    } else {
        barra.style.backgroundColor = 'var(--success)';
    }
}

function formatearHorarios(horarios) {
    return horarios.map(h => `${h.dia} ${h.horaInicio}:00 - ${h.horaFin}:00`).join('  |  ');
}

function actualizarVistaSeleccion() {
    actualizarContadorCreditos();
    const contenedor = document.getElementById('contenedorSeleccionados');
    const nombres = Object.keys(cursosSeleccionados);

    if (nombres.length === 0) {
        contenedor.innerHTML = `
            <div class="empty-state">
                Selecciona cursos desde el catálogo izquierdo para configurar tus prioridades.
            </div>`;
        return;
    }

    contenedor.innerHTML = '';
    nombres.forEach(curso => {
        // Ordenar visualmente las secciones según la prioridad elegida
        const secciones = [...cursosSeleccionados[curso]].sort((a, b) => a.prioridad - b.prioridad);
        const color = coloresPorCurso[curso] || PALETA_CURSOS[0];

        let filasHtml = '';
        secciones.forEach(sec => {
            let opcionesSelect = '';
            for (let p = 1; p <= secciones.length; p++) {
                opcionesSelect += `<option value="${p}" ${sec.prioridad === p ? 'selected' : ''}>Prioridad ${p}°</option>`;
            }

            filasHtml += `
                <div class="seccion-fila">
                    <div class="seccion-info">
                        <strong>Sección ${sec.codigoSeccion}</strong> • ${sec.profesor}
                        <span class="seccion-horario">${formatearHorarios(sec.horarios)}</span>
                    </div>
                    <select class="select-prioridad" onchange="cambiarPrioridad('${curso}', '${sec.id}', this.value)">
                        ${opcionesSelect}
                    </select>
                </div>`;
        });

        contenedor.innerHTML += `
            <div class="curso-elegido" style="border-left-color: ${color.border};">
                <div class="curso-header">
                    <span><strong>${curso}</strong> <small style="color: var(--text-muted);">(${secciones[0].creditos} créd.)</small></span>
                    <button class="btn-remove" onclick="quitarCurso('${curso}')">Quitar</button>
                </div>
                ${filasHtml}
            </div>`;
    });
}

async function procesarGrafo() {
    const todasLasSecciones = Object.values(cursosSeleccionados).flat();
    if (todasLasSecciones.length === 0) {
        mostrarToast("Selecciona al menos un curso antes de calcular el horario.");
        return;
    }

    const maxCred = parseInt(document.getElementById('maxCreditos').value) || 20;
    if (calcularCreditosTotales() > maxCred) {
        mostrarToast("Reduce tus cursos para no superar el límite de créditos.");
        return;
    }

    const resp = await fetch('/api/horarios/optimizar', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(todasLasSecciones)
    });

    datosGrafoGlobal = await resp.json();
    const seccionResultados = document.getElementById('seccionResultados');
    seccionResultados.classList.remove('hidden');

    const alerta = document.getElementById('mensajeSinSolucion');
    if (datosGrafoGlobal.horariosOrdenados.length === 0) {
        alerta.classList.remove('hidden');
        alerta.innerText = "Sin solución matemática: No existe ningún Clique completo de tamaño K (todas las combinaciones posibles tienen cruce de horario).";
        dibujarTablaHorario([]);
        dibujarGrafo(datosGrafoGlobal.nodos, datosGrafoGlobal.aristas, []);
        document.getElementById('listaRanking').innerHTML = '';
    } else {
        alerta.classList.add('hidden');
        renderizarRanking();
        seleccionarOpcion(0);
    }

    seccionResultados.scrollIntoView({ behavior: 'smooth' });
}

function seleccionarOpcion(indice) {
    const opcion = datosGrafoGlobal.horariosOrdenados[indice];
    document.getElementById('tituloHorario').innerText =
        indice === 0 ? "Mejor Horario Encontrado (Opción #1)" : `Alternativa de Horario (Opción #${indice + 1})`;
    document.getElementById('subtituloPeso').innerText = `Peso Total del Clique: ${opcion.pesoTotal} pts`;

    document.querySelectorAll('.opcion-item').forEach((el, idx) => {
        el.classList.toggle('activa', idx === indice);
    });

    dibujarTablaHorario(opcion.secciones);
    dibujarGrafo(datosGrafoGlobal.nodos, datosGrafoGlobal.aristas, opcion.secciones);
}

function dibujarTablaHorario(secciones) {
    const dias = ["Lunes", "Martes", "Miércoles", "Jueves", "Viernes", "Sábado"];
    const tbody = document.getElementById('cuerpoHorario');
    tbody.innerHTML = '';

    for (let hora = 8; hora < 20; hora++) {
        let fila = `<tr><td class="col-hora">${hora}:00 - ${hora + 1}:00</td>`;
        dias.forEach(dia => {
            let celda = '<td></td>';
            secciones.forEach(sec => {
                sec.horarios.forEach(h => {
                    if (h.dia === dia && hora >= h.horaInicio && hora < h.horaFin) {
                        const color = coloresPorCurso[sec.curso] || PALETA_CURSOS[0];
                        celda = `
                            <td>
                                <div class="bloque-clase" style="background:${color.bg}; border-left: 4px solid ${color.border};">
                                    ${sec.curso} (${sec.codigoSeccion})
                                    <small>${sec.profesor}</small>
                                </div>
                            </td>`;
                    }
                });
            });
            fila += celda;
        });
        fila += '</tr>';
        tbody.innerHTML += fila;
    }
}

function renderizarRanking() {
    const contenedor = document.getElementById('listaRanking');
    contenedor.innerHTML = '';

    datosGrafoGlobal.horariosOrdenados.forEach((op, idx) => {
        const resumen = op.secciones
            .map(s => `<strong>${s.curso}</strong> (Sec ${s.codigoSeccion} • P${s.prioridad})`)
            .join(' &nbsp;+&nbsp; ');

        contenedor.innerHTML += `
            <div class="opcion-item" onclick="seleccionarOpcion(${idx})">
                <div class="opcion-detalle">
                    <span style="color: var(--primary); font-weight: 700;">#${idx + 1}</span> &nbsp; ${resumen}
                </div>
                <span class="badge-peso">${op.pesoTotal} pts</span>
            </div>`;
    });
}

function dibujarGrafo(nodos, aristas, seccionesClique) {
    const canvas = document.getElementById('grafoCanvas');
    const ctx = canvas.getContext('2d');
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const cursos = [...new Set(nodos.map(n => n.curso))];
    const posiciones = {};
    const colWidth = canvas.width / (cursos.length + 1);

    cursos.forEach((curso, colIdx) => {
        const nodosCurso = nodos.filter(n => n.curso === curso);
        const rowHeight = canvas.height / (nodosCurso.length + 1);
        nodosCurso.forEach((n, rowIdx) => {
            posiciones[n.id] = { x: colWidth * (colIdx + 1), y: rowHeight * (rowIdx + 1) };
        });
    });

    const idsClique = new Set(
        nodos.filter(n => seccionesClique.some(s => `${s.curso} (${s.codigoSeccion})` === n.label)).map(n => n.id)
    );

    // Aristas
    aristas.forEach(([u, v]) => {
        const esClique = idsClique.has(u) && idsClique.has(v);
        ctx.beginPath();
        ctx.moveTo(posiciones[u].x, posiciones[u].y);
        ctx.lineTo(posiciones[v].x, posiciones[v].y);
        ctx.strokeStyle = esClique ? '#10b981' : '#2a3958';
        ctx.lineWidth = esClique ? 3 : 1.2;
        ctx.stroke();
    });

    // Vértices
    nodos.forEach(n => {
        const pos = posiciones[n.id];
        const activo = idsClique.has(n.id);

        ctx.beginPath();
        ctx.arc(pos.x, pos.y, 21, 0, Math.PI * 2);
        ctx.fillStyle = activo ? '#10b981' : '#131c31';
        ctx.fill();
        ctx.strokeStyle = activo ? '#ffffff' : '#38bdf8';
        ctx.lineWidth = 2.2;
        ctx.stroke();

        ctx.fillStyle = activo ? '#0b1120' : '#f1f5f9';
        ctx.font = 'bold 10px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.fillText(`w=${n.peso}`, pos.x, pos.y + 4);

        ctx.fillStyle = '#cbd5e1';
        const etiqueta = n.label.length > 18 ? n.label.substring(0, 15) + '..)' : n.label;
        ctx.fillText(etiqueta, pos.x, pos.y - 27);
    });
}

function descargarHorarioImagen() {
    const area = document.getElementById('areaExportable');
    html2canvas(area, { backgroundColor: '#131c31', scale: 2 }).then(canvas => {
        const enlace = document.createElement('a');
        enlace.download = 'mi-horario-optimo.png';
        enlace.href = canvas.toDataURL('image/png');
        enlace.click();
    });
}