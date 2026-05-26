document.addEventListener('DOMContentLoaded', () => {
    const contenedorRecetas = document.getElementById('contenedor-recetas');
    const inputIngrediente = document.getElementById('input-ingrediente');
    const contenedorTags = document.getElementById('contenedor-tags');
    const modalReceta = document.getElementById('modal-receta');
    const modalContenido = document.getElementById('modal-contenido');
    const pantallaRecetaCompleta = document.getElementById('pantalla-receta-completa');
    const detalleRecetaCompleta = document.getElementById('detalle-receta-completa');
    const btnRegresar = document.getElementById('btn-regresar');

    let todasLasRecetas = []; // Aquí guardaremos la base de datos completa
    let misIngredientes = []; // Aquí guardaremos lo que el usuario escriba

    // 1. CARGA INICIAL DE DATOS
    async function cargarRecetas() {
        try {
            const respuesta = await fetch('recetas.json');
            todasLasRecetas = await respuesta.json();
            dibujarTarjetas(todasLasRecetas); // Mostramos todas al inicio
        } catch (error) {
            console.error("Error al cargar la alacena:", error);
            contenedorRecetas.innerHTML = '<p class="text-red-400">Error al cargar las recetas.</p>';
        }
    }

    // 2. CAPTURAR EL TECLADO (Evento Enter)
    inputIngrediente.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            e.preventDefault(); // Evita que la página se recargue
            const nuevoIngrediente = inputIngrediente.value.trim().toLowerCase();
            
            // Si no está vacío y no lo hemos agregado antes...
            if (nuevoIngrediente !== '' && !misIngredientes.includes(nuevoIngrediente)) {
                misIngredientes.push(nuevoIngrediente); // Lo guardamos en la memoria
                inputIngrediente.value = ''; // Limpiamos la barra
                actualizarInterfaz(); // Disparamos la actualización
            }
        }
    });

    // 3. DIBUJAR LOS TAGS (Las píldoras visuales)
    function renderizarTags() {
        contenedorTags.innerHTML = ''; // Limpiamos antes de redibujar
        
        misIngredientes.forEach(ingrediente => {
            const tag = document.createElement('span');
            // Estilo Glassmorphism para los tags
            tag.className = 'bg-acento/20 text-texto border border-acento/40 px-3 py-1 rounded-full text-sm flex items-center gap-2 cursor-pointer hover:bg-red-500/30 hover:border-red-500/50 transition-colors backdrop-blur-sm';
            tag.innerHTML = `${ingrediente} <span class="text-xs font-bold opacity-60">✕</span>`;
            
            // Función para eliminar el tag al darle clic
            tag.onclick = () => {
                misIngredientes = misIngredientes.filter(i => i !== ingrediente);
                actualizarInterfaz();
            };
            
            contenedorTags.appendChild(tag);
        });
    }

    // 4. EL MOTOR DE BÚSQUEDA (Lógica de subconjuntos)
    function filtrarRecetas() {
        // Si no hay ingredientes, mostramos todo
        if (misIngredientes.length === 0) {
            dibujarTarjetas(todasLasRecetas);
            return;
        }

        // Filtramos las recetas
        const recetasFiltradas = todasLasRecetas.map(receta => {
            // Contamos cuántos ingredientes de la receta tenemos
            let encontrados = 0;
            receta.ingredientes_clave.forEach(req => {
                // Buscamos si la palabra que escribiste ESTÁ CONTENIDA en el ingrediente de la receta
                const coincide = misIngredientes.some(miIng => req.toLowerCase().includes(miIng));
                if (coincide) {
                    encontrados++;
                }
            });

            // Calculamos cuántos nos faltan
            const faltantes = receta.ingredientes_clave.length - encontrados;
            
            return { ...receta, faltantes }; // Devolvemos la receta con ese nuevo dato
        })
        // Nos quedamos solo con las recetas donde tenemos al menos 1 ingrediente
        .filter(receta => receta.faltantes < receta.ingredientes_clave.length)
        // Ordenamos: primero las que tienen menos ingredientes faltantes (Coincidencia exacta arriba)
        .sort((a, b) => a.faltantes - b.faltantes);

        dibujarTarjetas(recetasFiltradas);
    }

    // 5. RENDERIZAR LAS TARJETAS (Actualizado)
    function dibujarTarjetas(recetas) {
        contenedorRecetas.innerHTML = ''; 
        
        if (recetas.length === 0) {
            contenedorRecetas.innerHTML = '<p class="text-acento text-center mt-10">No hay recetas que coincidan con tu alacena hoy.</p>';
            return;
        }

        recetas.forEach(receta => {
            const tarjeta = document.createElement('div');
            tarjeta.className = 'bg-cristal/40 backdrop-blur-md border border-acento/30 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:bg-cristal/60 cursor-pointer relative';
            
            // Evento para abrir el modal
            tarjeta.onclick = () => abrirModal(receta);

            // Etiqueta visual para coincidencias exactas o parciales
            let etiquetaFaltantes = '';
            if (receta.faltantes !== undefined) {
                if (receta.faltantes === 0) {
                    etiquetaFaltantes = '<span class="absolute top-3 right-3 bg-green-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">¡Puedes prepararlo!</span>';
                } else {
                    etiquetaFaltantes = `<span class="absolute top-3 right-3 bg-orange-500/80 text-white text-xs px-2 py-1 rounded-full backdrop-blur-md">Te faltan ${receta.faltantes} ingrediente(s)</span>`;
                }
            }

            tarjeta.innerHTML = `
                ${etiquetaFaltantes}
                <img src="${receta.imagen}" alt="${receta.titulo}" class="w-full h-32 object-cover opacity-80 mix-blend-overlay">
                <div class="p-5">
                    <h3 class="font-titulo text-xl mb-1">${receta.titulo}</h3>
                    <p class="text-acento text-sm mb-3">⏳ ${receta.tiempo_minutos} min</p>
                    <p class="text-sm opacity-80">Da clic para ver los detalles...</p>
                </div>
            `;
            
            contenedorRecetas.appendChild(tarjeta);
        });
    }

    // Función maestra que orquesta la interfaz
    function actualizarInterfaz() {
        renderizarTags();
        filtrarRecetas();
    }

    // Iniciar la app
    cargarRecetas();

    // Función para construir y mostrar el modal
    function abrirModal(receta) {
        // Construimos la lista de ingredientes (incluyendo los base)
        const listaIngredientes = receta.ingredientes_clave.map(ing => 
            `<li class="flex items-center gap-2 text-texto/90"><span class="text-acento">•</span> ${ing}</li>`
        ).join('');

        modalContenido.innerHTML = `
            <div class="relative">
                <img src="${receta.imagen}" alt="${receta.titulo}" class="w-full h-48 object-cover opacity-70">
                <button onclick="mostrarRecetaCompleta(${receta.id})" class="w-full bg-texto text-fondo font-bold py-3 rounded-xl hover:bg-texto/80 transition-colors shadow-lg font-titulo">
                    Ver Receta Completa
                </button>
            </div>
            <div class="p-6">
                <h2 class="font-titulo text-2xl mb-2">${receta.titulo}</h2>
                <div class="flex gap-4 mb-6 border-b border-acento/20 pb-4">
                    <span class="text-acento text-sm flex items-center gap-1">⏱ ${receta.tiempo_minutos} min</span>
                </div>
                
                <h3 class="font-titulo text-lg mb-3 text-acento">Ingredientes Necesarios:</h3>
                <ul class="grid grid-cols-2 gap-2 mb-6">
                    ${listaIngredientes}
                </ul>
            </div>
        `;

        // Mostramos el modal con una transición suave
        modalReceta.classList.remove('hidden');
        // Pequeño truco para que la animación CSS se ejecute correctamente
        setTimeout(() => {
            modalReceta.classList.remove('opacity-0');
            modalContenido.classList.remove('scale-95');
        }, 10);
    }

    // Exponemos la función cerrarModal al ámbito global para el botón HTML
    window.cerrarModal = function() {
        modalReceta.classList.add('opacity-0');
        modalContenido.classList.add('scale-95');
        
        setTimeout(() => {
            modalReceta.classList.add('hidden');
        }, 300); // Esperamos a que termine la animación
    };

    // Cerrar modal al hacer clic fuera de la tarjeta
    modalReceta.addEventListener('click', (e) => {
        if (e.target === modalReceta) {
            cerrarModal();
        }
    });

    // Función para mostrar la pantalla completa con los pasos
    window.mostrarRecetaCompleta = function(idReceta) {
        // Buscamos la receta exacta por su ID
        const receta = todasLasRecetas.find(r => r.id === idReceta);
        if (!receta) return;

        // Cerramos el modal primero de forma inmediata
        modalReceta.classList.add('hidden', 'opacity-0');
        modalContenido.classList.add('scale-95');

        // Construimos el HTML de los pasos instructivos
        const pasosHtml = receta.instrucciones.map((paso, index) => `
            <div class="bg-cristal/30 border border-acento/20 p-5 rounded-2xl flex gap-4 items-start backdrop-blur-sm">
                <span class="bg-texto text-fondo font-bold w-6 h-6 rounded-full flex items-center justify-center text-sm shrink-0 mt-0.5 font-titulo">
                    ${index + 1}
                </span>
                <p class="text-texto/90 text-sm leading-relaxed">${paso}</p>
            </div>
        `).join('');

        // Inyectamos el contenido estructurado
        detalleRecetaCompleta.innerHTML = `
            <img src="${receta.imagen}" alt="${receta.titulo}" class="w-full h-56 object-cover rounded-3xl mb-6 opacity-80 border border-acento/20 shadow-lg">
            <h2 class="font-titulo text-3xl mb-2">${receta.titulo}</h2>
            <p class="text-acento text-sm mb-8">⏱ Tiempo total: ${receta.tiempo_minutos} minutos</p>
            
            <h3 class="font-titulo text-xl mb-4 text-acento">Procedimiento paso a paso:</h3>
            <div class="grid gap-4 mb-12">
                ${pasosHtml}
            </div>
        `;

        // Activamos la pantalla completa con una animación fluida
        pantallaRecetaCompleta.classList.remove('hidden');
        setTimeout(() => {
            pantallaRecetaCompleta.classList.remove('opacity-0');
        }, 10);
    };

    // Lógica para el botón de regresar a la alacena
    btnRegresar.addEventListener('click', () => {
        pantallaRecetaCompleta.classList.add('opacity-0');
        setTimeout(() => {
            pantallaRecetaCompleta.classList.add('hidden');
        }, 300);
    });

});