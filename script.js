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

    // Verificación de conexión con el servidor
    // Usamos un pequeño delay para asegurar que todo cargó
    setTimeout(checkServerConnection, 500);

    async function checkServerConnection() {
        console.log("Iniciando verificación de servidor...");
        const statusText = document.querySelector('#connectionStatus .status-text');
        const statusDot = document.querySelector('#connectionStatus .status-dot');

        if (!statusText || !statusDot) {
            console.error("Elementos de estado no encontrados en el DOM");
            return;
        }

        const client = getSupabaseClient();

        if (!client) {
            console.error("Librería de Supabase no encontrada.");
            statusText.innerText = "Error: Librería no cargada";
            statusDot.classList.add('offline');
            return;
        }

        try {
            console.log("Probando respuesta de Supabase...");
            // Intentamos una petición simple
            const { error } = await client.from('usuarios').select('id').limit(1);

            if (error) {
                console.error("Respuesta de Supabase con error:", error);
                // Si el error es de red (fetch) o de permisos
                if (error.message.includes('FetchError') || error.message.includes('Failed to fetch')) {
                    statusText.innerText = "Sin conexión (Red)";
                } else {
                    statusText.innerText = "Error Servidor [" + error.code + "]";
                }
                statusDot.classList.add('offline');
            } else {
                console.log("¡Conexión exitosa!");
                statusText.innerText = "Servidor Conectado";
                statusDot.classList.remove('offline');
                statusDot.classList.add('online');
            }
        } catch (e) {
            console.error("Excepción en conexión:", e);
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
                        if (testError.message.includes("relation \"usuarios\" does not exist")) {
                            alert("ERROR: La tabla 'usuarios' no existe. Verifica si se llama 'Usuarios' (con Mayúscula) o tiene otro nombre.");
                        }
                    } else if (testData && testData.length > 0) {
                        console.log("Estructura de la tabla (primer registro):", Object.keys(testData[0]));
                        const columns = Object.keys(testData[0]);
                        if (!columns.includes('rut')) {
                            console.warn("ADVERTENCIA: No encontré la columna 'rut'. Columnas actuales:", columns);
                        }
                        if (!columns.includes('password')) {
                            console.warn("ADVERTENCIA: No encontré la columna 'password'.");
                        }
                    } else {
                        console.log("La tabla 'usuarios' está vacía o no tiene registros.");
                    }
                    console.groupEnd();
                    // --- FIN DIAGNÓSTICO ---

                    // Consulta a la tabla personalizada 'usuarios'
                    // Usamos 'rut' y 'password' que son los nombres reales de tus columnas
                    const { data, error, status } = await client
                        .from('usuarios')
                        .select('*')
                        .eq('rut', username)
                        .eq('password', password)
                        .maybeSingle();

                    submitBtn.classList.remove('loading');

                    if (error) {
                        console.error("Error en la consulta de login:", error);
                        // Si el error es 403, suele ser un problema de RLS (Permisos)
                        if (status === 403 || error.code === '42501') {
                            alert("ERROR DE PERMISOS (RLS): Tu tabla 'usuarios' tiene activada la seguridad (RLS) y no tienes una 'Policy' que permita el acceso. Debes crear una Policy en el panel de Supabase para la tabla 'usuarios'.");
                        } else {
                            alert("Error de Supabase [" + error.code + "]: " + error.message);
                        }
                        return;
                    }

                    if (!data) {
                        console.warn("Login fallido: No se encontró coincidencia.");
                        alert("No se encontró ningún usuario con ese RUT y Contraseña en la tabla 'usuarios'.\n\nVerifica en tu panel de Supabase:\n1. Que el RUT (" + username + ") existe en la columna 'rut'.\n2. Que la contraseña esté en la columna 'password'.");
                    } else {
                        // Login exitoso
                        console.log("Sesión iniciada correctamente!", data);

                        // Add success animation to button
                        submitBtn.style.background = 'linear-gradient(135deg, #10b981, #059669)';
                        submitBtn.querySelector('span').innerText = '¡Conectado!';
                        submitBtn.querySelector('span').style.opacity = '1';

                        // Redirect after success animation
                        setTimeout(() => {
                            window.location.href = 'welcome.html';
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
