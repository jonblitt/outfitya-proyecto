document.addEventListener('DOMContentLoaded', () => {
    
    // --- Lógica 1: Probador Biométrico 3D ---
    const biometricForm = document.getElementById('biometric-form');
    const sliderAltura = document.getElementById('range-altura');
    const sliderPeso = document.getElementById('range-peso');
    const lblAltura = document.getElementById('val-altura');
    const lblPeso = document.getElementById('val-peso');
    
    const avatarShape = document.getElementById('avatar-shape');
    const selectPrenda = document.getElementById('select-prenda');
    const txtCurrentClothing = document.getElementById('current-clothing');
    const errPrenda = document.getElementById('err-prenda');

    // Escuchar el cambio en los sliders para simular deformación biométrica en tiempo real
    function updateAvatarDimensions() {
        const altura = sliderAltura.value;
        const peso = sliderPeso.value;
        
        lblAltura.textContent = altura;
        lblPeso.textContent = peso;

        // Modificar dinámicamente propiedades CSS del nodo DOM (Simula render 3D)
        // La altura afecta el alto del elemento, el peso afecta el ancho proporcionalmente
        const pixelHeight = mapRange(altura, 140, 210, 130, 220);
        const pixelWidth = mapRange(peso, 40, 130, 45, 110);

        avatarShape.style.height = `${pixelHeight}px`;
        avatarShape.style.width = `${pixelWidth}px`;
    }

    sliderAltura.addEventListener('input', updateAvatarDimensions);
    sliderPeso.addEventListener('input', updateAvatarDimensions);

    // Enviar formulario (Procesar datos al Probador)
    biometricForm.addEventListener('submit', (e) => {
        e.preventDefault();
        
        if (selectPrenda.value === "") {
            selectPrenda.parentElement.classList.add('invalid');
            errPrenda.style.display = 'block';
        } else {
            selectPrenda.parentElement.classList.remove('invalid');
            errPrenda.style.display = 'none';
            
            // Cargar prenda en el probador
            txtCurrentClothing.textContent = selectPrenda.value;
            triggerGlowEffect();
        }
    });

    // --- Lógica 2: Vinculación de Catálogo a Probador ---
    const catalogButtons = document.querySelectorAll('.btn-action-load');
    
    catalogButtons.forEach(button => {
        button.addEventListener('click', () => {
            const prendaSeleccionada = button.getAttribute('data-prenda');
            
            // Sincronizar select e inyectar al probador de inmediato
            selectPrenda.value = prendaSeleccionada;
            txtCurrentClothing.textContent = prendaSeleccionada;
            
            // Scroll suave hacia el probador para mejorar UX
            document.getElementById('probador').scrollIntoView({ behavior: 'smooth' });
            triggerGlowEffect();
        });
    });

    // --- Lógica 3: Asistente Virtual Inteligente (Outfitya AI) ---
    const aiToggle = document.getElementById('ai-toggle');
    const aiWindow = document.getElementById('ai-window');
    const chatInput = document.getElementById('chat-input');
    const chatSend = document.getElementById('chat-send');
    const chatBox = document.getElementById('chat-box');

    aiToggle.addEventListener('click', () => {
        // Intercambiar visibilidad de la ventana flotante
        if (aiWindow.style.display === 'flex') {
            aiWindow.style.display = 'none';
        } else {
            aiWindow.style.display = 'flex';
        }
    });

    function handleUserMessage() {
        const text = chatInput.value.trim();
        if (text === "") return;

        // Mensaje del usuario adjuntado al DOM
        appendMessage(text, 'user-msg');
        chatInput.value = "";

        // Simular respuesta inteligente del Bot tras 1 segundo
        setTimeout(() => {
            let botReply = "Entendido. Estoy procesando tu solicitud sobre la estructura de Outfitya.";
            
            const lowerText = text.toLowerCase();
            if (lowerText.includes('talla') || lowerText.includes('medida') || lowerText.includes('altura')) {
                botReply = "Nuestra IA sugiere que tu avatar actual requiere una prenda talla M según tus parámetros biométricos.";
            } else if (lowerText.includes('pago') || lowerText.includes('precio') || lowerText.includes('comprar')) {
                botReply = "Soportamos pasarelas de pago seguras como PayPal, PayU y MercadoPago de forma encriptada.";
            }
            
            appendMessage(botReply, 'bot-msg');
        }, 1000);
    }

    chatSend.addEventListener('click', handleUserMessage);
    chatInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') handleUserMessage();
    });


    // --- Funciones de Utilidad ---
    function appendMessage(text, className) {
        const msgDiv = document.createElement('div');
        msgDiv.className = `message ${className}`;
        msgDiv.textContent = text;
        chatBox.appendChild(msgDiv);
        chatBox.scrollTop = chatBox.scrollHeight; // Auto-scroll al fondo
    }

    function mapRange(value, inMin, inMax, outMin, outMax) {
        return (value - inMin) * (outMax - outMin) / (inMax - inMin) + outMin;
    }

    function triggerGlowEffect() {
        avatarShape.style.borderColor = '#10b981'; // Destello verde de éxito
        setTimeout(() => {
            avatarShape.style.borderColor = '#a78bfa';
        }, 600);
    }

    // Inicializar dimensiones
    updateAvatarDimensions();
});