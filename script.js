// --- CONFIGURACIÓN DE SUPABASE ---
// URL de tu proyecto. (dinrwcwdxmkcbtyxqlbn.supabase.co)
const supabaseUrl = 'https://dinrwcwdxmkcbtyxqlbn.supabase.co';

// Clave 'anon public' de Supabase (uso seguro en el frontend)
const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImRpbnJ3Y3dkeG1rY2J0eXhxbGJuIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzQxMjc3ODQsImV4cCI6MjA4OTcwMzc4NH0.AbCoopMj6XVzURhsfLFPahLkt6b-kyO6C0g9q2hlzmE';

let supabaseClient = null;

function getSupabaseClient() {
    if (supabaseClient) return supabaseClient;
    if (typeof window.supabase !== 'undefined') {
        supabaseClient = window.supabase.createClient(supabaseUrl, supabaseAnonKey);
        return supabaseClient;
    }
    return null;
}

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('loginForm');
    const submitBtn = document.getElementById('submitBtn');
    const recoveryForm = document.getElementById('recoveryForm');
    const recoveryBtn = document.getElementById('recoveryBtn');

    // Add particles for background effect
    createParticles();

    // --- MIDDLEWARE: EL GUARDIA DE SEGURIDAD ---
    // Este pequeño bloque se encarga de "vigilar" las vistas protegidas.
    const protectedViews = ['welcome']; // Lista de vistas que requieren sesión activa

    function runMiddleware(requestedView) {
        const isLoggedIn = sessionStorage.getItem('isLoggedIn') === 'true';

        // Si la vista está en la lista de protegidas y NO hay sesión...
        if (protectedViews.includes(requestedView) && !isLoggedIn) {
            console.warn(`[Middleware] Acceso denegado a '${requestedView}'. Redirigiendo a Login.`);
            return 'login'; // Bloquea y redirige al inicio
        }

        // Si pasa la validación, permite el acceso a la vista solicitada
        return requestedView;
    }

    // --- LÓGICA DE SPA (Vistas) ---
    function showView(requestedView) {
        // Ejecutar el Middleware antes de mostrar cualquier contenido
        const view = runMiddleware(requestedView);

        const loginView = document.getElementById('loginView');
        const welcomeView = document.getElementById('welcomeView');
        const recoveryView = document.getElementById('recoveryView');
        const versionLabel = document.getElementById('versionLabel');

        // Ocultar todo
        loginView.style.display = 'none';
        welcomeView.style.display = 'none';
        if (recoveryView) recoveryView.style.display = 'none';
        if (versionLabel) versionLabel.style.display = 'none';

        if (view === 'welcome') {
            welcomeView.style.display = 'flex';
            if (versionLabel) versionLabel.style.display = 'block';
            // Personalizar saludo
            const userName = sessionStorage.getItem('userName');
            if (userName) {
                document.getElementById('userGreeting').innerText = 'Bienvenido ' + userName;
            }
        } else if (view === 'recovery') {
            if (recoveryView) recoveryView.style.display = 'block';
        } else {
            loginView.style.display = 'block';
        }
    }

    // Navegación SPA interna
    const toRecovery = document.getElementById('toRecovery');
    const toLogin = document.getElementById('toLogin');
    
    if (toRecovery) toRecovery.onclick = (e) => { e.preventDefault(); showView('recovery'); };
    if (toLogin) toLogin.onclick = (e) => { e.preventDefault(); showView('login'); };

    // Verificar si ya hay una sesión activa al cargar
    if (sessionStorage.getItem('isLoggedIn') === 'true') {
        showView('welcome');
    }

    // Manejar el cierre de sesión (SPA)
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.clear();
            showView('login');
        });
    }

    // Verificación de conexión con el servidor
    setTimeout(checkServerConnection, 500);

    async function checkServerConnection() {
        console.log("Iniciando verificación de servidor...");
        const statusText = document.querySelector('#connectionStatus .status-text');
        const statusDot = document.querySelector('#connectionStatus .status-dot');
        if (!statusText || !statusDot) return;

        const client = getSupabaseClient();
        if (!client) {
            statusText.innerText = "Error: Librería no cargada";
            statusDot.classList.add('offline');
            return;
        }

        try {
            const { error } = await client.from('usuarios').select('id').limit(1);
            if (error) {
                statusText.innerText = "Error Servidor [" + error.code + "]";
                statusDot.classList.add('offline');
            } else {
                statusText.innerText = "Servidor Conectado";
                statusDot.classList.remove('offline');
                statusDot.classList.add('online');
            }
        } catch (e) {
            statusText.innerText = "Error de conexión";
            statusDot.classList.add('offline');
        }
    }

    if (form) {
        form.addEventListener('submit', async (e) => {
            e.preventDefault();

            // Asumiendo que 'username' es en realidad un correo (email) para Supabase Auth por defecto.
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            if (username && password) {
                // Show loading state
                submitBtn.classList.add('loading');

                const client = getSupabaseClient();

                if (!client) {
                    alert("Error: Librería de Supabase no cargada correctamente.");
                    submitBtn.classList.remove('loading');
                    return;
                }

                if (supabaseAnonKey === 'TU_CLAVE_ANONIMA_AQUI' || supabaseAnonKey === 'dinrwcwdxmkcbtyxqlbn') {
                    alert("¡FALTA LA CLAVE ANONIMA o ES INCORRECTA!\n\nLa clave actual NO es válida. Debes entrar a tu panel de Supabase y copiar la 'anon key' (suele ser muy larga y empieza con eyJ...)");
                    submitBtn.classList.remove('loading');
                    return;
                }

                try {
                    console.log("Intentando login para:", username);

                    // --- DIAGNÓSTICO (Solo para depuración) ---
                    console.group("Diagnóstico de Login");
                    console.log("Usuario ingresado:", username);
                    console.log("Password ingresado:", password);

                    // 1. Verificar si la tabla 'usuarios' es accesible y qué columnas tiene
                    const { data: testData, error: testError } = await client
                        .from('usuarios')
                        .select('*')
                        .limit(1);

                    if (testError) {
                        console.error("Error al acceder a la tabla 'usuarios':", testError);
                    } else if (testData && testData.length > 0) {
                        console.log("Estructura de la tabla (primer registro):", Object.keys(testData[0]));
                    }
                    console.groupEnd();
                    // --- FIN DIAGNÓSTICO ---

                    // Consulta a la tabla personalizada 'usuarios'
                    const { data, error, status } = await client
                        .from('usuarios')
                        .select('*')
                        .eq('rut', username.trim())
                        .eq('password', password.trim())
                        .maybeSingle();

                    submitBtn.classList.remove('loading');

                    // --- DIAGNÓSTICO DETALLADO DE RESPUESTA ---
                    console.group("Resultado de consulta login");
                    console.log("HTTP Status:", status);
                    console.log("Error:", error);
                    console.log("Data:", data);
                    console.groupEnd();

                    if (error) {
                        console.error("Error en la consulta de login:", error);
                        alert("Error de Supabase [" + error.code + "]: " + error.message);
                        return;
                    }

                    if (!data) {
                        console.warn("Login fallido: No se encontró coincidencia para rut='" + username.trim() + "'");
                        alert("No se encontró ningún usuario con ese RUT y Contraseña.");
                    } else {
                        // Login exitoso
                        console.log("Sesión iniciada correctamente!", data);

                        // --- GUARDAR SESIÓN ---
                        sessionStorage.setItem('isLoggedIn', 'true');
                        sessionStorage.setItem('userRut', data.rut);
                        if (data.nombre) sessionStorage.setItem('userName', data.nombre);

                        // Add success animation to button
                        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        submitBtn.querySelector('span').innerText = '¡Conectado!';
                        submitBtn.querySelector('span').style.opacity = '1';

                        // Transition to welcome view in SPA
                        setTimeout(() => {
                            showView('welcome');
                            // Reset button for next time
                            submitBtn.style.background = '';
                            submitBtn.querySelector('span').innerText = 'Ingresar';
                        }, 800);
                    }
                } catch (err) {
                    submitBtn.classList.remove('loading');
                    console.error("Error inesperado:", err);
                    alert("Ocurrió un error inesperado al conectar con el servidor.");
                }
            }
        });
    }

    // --- CONFIGURACIÓN DE EMAILJS ---
    const EMAILJS_PUBLIC_KEY = 'E-WiyJng9b6FsX28z';
    if (typeof emailjs !== 'undefined') {
        emailjs.init(EMAILJS_PUBLIC_KEY);
    }

    // --- LÓGICA DE RECUPERACIÓN DE CONTRASEÑA ---
    if (recoveryForm) {
        recoveryForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const email = document.getElementById('recoveryEmail').value;
            const recoveryMessage = document.getElementById('recoveryMessage');

            if (email) {
                recoveryBtn.classList.add('loading');
                const client = getSupabaseClient();

                if (!client) {
                    alert("Error: Librería de Supabase no cargada.");
                    recoveryBtn.classList.remove('loading');
                    return;
                }

                try {
                    console.log("Buscando contraseña para:", email);
                    // Buscamos en la tabla 'usuarios' por el campo 'email'
                    const { data, error } = await client
                        .from('usuarios')
                        .select('password, email')
                        .eq('email', email)
                        .maybeSingle();

                    recoveryBtn.classList.remove('loading');

                    if (error) {
                        console.error("Error en recuperación:", error);
                        alert("Error al buscar el correo: " + error.message);
                        return;
                    }

                    if (!data) {
                        alert("No se encontró ninguna cuenta asociada a este correo electrónico.");
                    } else {
                        // --- ENVÍO REAL CON EMAILJS ---
                        const serviceID = 'service_39a0qm9';
                        const templateID = 'template_e5206vl';

                        const templateParams = {
                            user_email: data.email,
                            user_password: data.password,
                            password: data.password,
                            passcode: data.password, // Added to match {{passcode}} in template
                            pass: data.password,
                            user_pass: data.password,
                            contraseña: data.password,
                            to_email: data.email,
                            to: data.email,
                            email: data.email
                        };

                        console.log("Enviando correo real con EmailJS...");

                        emailjs.send(serviceID, templateID, templateParams)
                            .then(function (response) {
                                console.log('ÉXITO!', response.status, response.text);
                                recoveryMessage.style.display = 'block';
                                recoveryMessage.innerHTML = `
                                    <strong>¡Correo Enviado!</strong><br>
                                    Se ha enviado tu contraseña a <em>${data.email}</em>.<br>
                                    Revisa tu bandeja de entrada.
                                `;
                                recoveryBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                                recoveryBtn.querySelector('span').innerText = '¡Enviado!';
                            }, function (error) {
                                console.error('FALLÓ EL ENVÍO...', error);
                                const errorMsg = (error && error.text) ? error.text : (error && error.message) ? error.message : JSON.stringify(error);
                                alert("Error al enviar el correo: " + errorMsg + "\n\nVerifica tu configuración de EmailJS (Service ID, Template ID y Public Key).");
                                recoveryBtn.classList.remove('loading');
                            });

                        // Redirigir opcionalmente después de unos segundos
                        setTimeout(() => {
                            window.location.href = 'index.html';
                        }, 8000);
                    }
                } catch (err) {
                    recoveryBtn.classList.remove('loading');
                    console.error("Error inesperado en recuperación:", err);
                    alert("Ocurrió un error inesperado.");
                }
            }
        });
    }

    // Add ripple effect to buttons
    const buttons = [submitBtn, recoveryBtn].filter(btn => btn !== null);
    buttons.forEach(btn => {
        btn.addEventListener('click', function (e) {
            let ripple = document.createElement("div");
            ripple.classList.add("ripple-element");
            this.appendChild(ripple);

            let rect = this.getBoundingClientRect();
            let x = e.clientX - rect.left;
            let y = e.clientY - rect.top;

            ripple.style.left = `${x}px`;
            ripple.style.top = `${y}px`;

            setTimeout(() => {
                ripple.remove();
            }, 600);
        });
    });
});

function createParticles() {
    const body = document.querySelector('body');
    const particlesContainer = document.createElement('div');
    particlesContainer.className = 'particles';
    body.appendChild(particlesContainer);

    for (let i = 0; i < 6; i++) {
        createParticle(particlesContainer);
    }
}

function createParticle(container) {
    const particle = document.createElement('div');
    particle.className = 'particle';

    // Random position, size and delay
    const size = Math.random() * 250 + 100;
    const startX = Math.random() * window.innerWidth;
    const startY = window.innerHeight + Math.random() * 200;
    const duration = Math.random() * 15 + 10;
    const delay = Math.random() * 5;

    particle.style.width = `${size}px`;
    particle.style.height = `${size}px`;
    particle.style.left = `${startX}px`;
    particle.style.top = `${startY}px`;
    particle.style.animationDuration = `${duration}s`;
    particle.style.animationDelay = `${delay}s`;

    container.appendChild(particle);

    // Recreate particle when animation ends
    setTimeout(() => {
        if (particle.parentNode) {
            particle.remove();
            createParticle(container);
        }
    }, (duration + delay) * 1000);
}
