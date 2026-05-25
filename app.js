document.addEventListener('DOMContentLoaded', () => {
    const contenedorRecetas = document.getElementById('contenedor-recetas');

    // Función principal para extraer los datos del JSON
    async function cargarRecetas() {
        try {
            const respuesta = await fetch('recetas.json');
            const recetas = await respuesta.json();
            dibujarTarjetas(recetas);
        } catch (error) {
            console.error("Error al cargar la alacena:", error);
            contenedorRecetas.innerHTML = '<p class="text-red-400">Error al cargar las recetas.</p>';
        }
    }

    // Función para renderizar el HTML de cada receta
    function dibujarTarjetas(recetas) {
        contenedorRecetas.innerHTML = ''; // Limpiamos el contenedor
        
        recetas.forEach(receta => {
            // Creamos el elemento div para la tarjeta
            const tarjeta = document.createElement('div');
            
            // Aplicamos las clases de Tailwind para el Glassmorphism y la animación
            tarjeta.className = 'bg-cristal/40 backdrop-blur-md border border-acento/30 rounded-3xl overflow-hidden shadow-lg transition-all duration-300 hover:bg-cristal/60 cursor-pointer';
            
            // Construimos la estructura interna de la tarjeta
            tarjeta.innerHTML = `
                <img src="${receta.imagen}" alt="${receta.titulo}" class="w-full h-32 object-cover opacity-80 mix-blend-overlay">
                <div class="p-5">
                    <h3 class="font-titulo text-xl mb-1">${receta.titulo}</h3>
                    <p class="text-acento text-sm mb-3">⏳ ${receta.tiempo_minutos} min</p>
                    <p class="text-sm opacity-80">Da clic para ver los detalles...</p>
                </div>
            `;
            
            // Añadimos la tarjeta al contenedor principal
            contenedorRecetas.appendChild(tarjeta);
        });
    }

    // Ejecutamos la función al iniciar
    cargarRecetas();
});