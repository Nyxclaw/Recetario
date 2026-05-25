document.addEventListener('DOMContentLoaded', () => {
    const contenedorRecetas = document.getElementById('contenedor-recetas');
    const inputIngrediente = document.getElementById('input-ingrediente');
    const contenedorTags = document.getElementById('contenedor-tags');

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
                if (misIngredientes.includes(req.toLowerCase())) {
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
});