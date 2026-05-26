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

    // ================================================================
    // --- PAGINACIÓN CUPRUM ---
    // Todo en un objeto local. Sin window.*, sin placeholders.
    // ================================================================
    const pag = { pagina: 1, porPagina: 5, datos: [] };

    function cuprumRenderPagina() {
        if (!pag.datos.length) return;

        const total  = Math.ceil(pag.datos.length / pag.porPagina);
        if (pag.pagina < 1) pag.pagina = 1;
        if (pag.pagina > total) pag.pagina = total;

        const inicio = (pag.pagina - 1) * pag.porPagina;
        const tbody  = document.getElementById('cuprumBody');
        if (!tbody) return;

        tbody.innerHTML = '';
        pag.datos.slice(inicio, inicio + pag.porPagina).forEach(rowHtml => {
            const tr = document.createElement('tr');
            tr.innerHTML = rowHtml;
            tbody.appendChild(tr);
        });

        // Indicador
        const indicador = document.getElementById('cuprumPageIndicator');
        if (indicador) indicador.textContent = 'Pág. ' + pag.pagina + ' de ' + total;

        // Botón Anterior — solo visual, sin tocar pointerEvents aquí
        const prevBtn = document.getElementById('cuprumPrevBtn');
        if (prevBtn) {
            prevBtn.style.opacity = pag.pagina <= 1 ? '0.35' : '1';
        }
        // Botón Siguiente — solo visual
        const nextBtn = document.getElementById('cuprumNextBtn');
        if (nextBtn) {
            nextBtn.style.opacity = pag.pagina >= total ? '0.35' : '1';
        }

        // Mostrar barra de paginación
        const bar = document.getElementById('cuprumPagination');
        if (bar) bar.style.display = total > 1 ? 'flex' : 'none';
    }

    // Listeners de los botones (siempre activos, la lógica interna decide si avanza)
    document.getElementById('cuprumPrevBtn').addEventListener('click', function () {
        if (pag.pagina > 1) {
            pag.pagina--;
            cuprumRenderPagina();
        }
    });
    document.getElementById('cuprumNextBtn').addEventListener('click', function () {
        const total = Math.ceil(pag.datos.length / pag.porPagina);
        if (pag.pagina < total) {
            pag.pagina++;
            cuprumRenderPagina();
        }
    });
    // ================================================================

    // Add particles for background effect
    createParticles();

    // --- MIDDLEWARE: EL GUARDIA DE SEGURIDAD ---
    // Este pequeño bloque se encarga de "vigilar" las vistas protegidas.
    const protectedViews = ['welcome', 'proyectos', 'servicios', 'cuprum', 'dap', 'fmutuos', 'cuotasfmutuos', 'valordap', 'bci', 'banchile'];

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
        const proyectosView = document.getElementById('proyectosView');
        const serviciosView = document.getElementById('serviciosView');
        const cuprumView = document.getElementById('cuprumView');
        const dapView = document.getElementById('dapView');
        const fmutuosView = document.getElementById('fmutuosView');
        const cuotasfmutuosView = document.getElementById('cuotasfmutuosView');
        const valordapView = document.getElementById('valordapView');
        const bciView = document.getElementById('bciView');
        const banchileView = document.getElementById('banchileView');
        const versionLabel = document.getElementById('versionLabel');

        // Ocultar todo
        loginView.style.display = 'none';
        welcomeView.style.display = 'none';
        if (recoveryView) recoveryView.style.display = 'none';
        if (proyectosView) proyectosView.style.display = 'none';
        if (serviciosView) serviciosView.style.display = 'none';
        if (cuprumView) cuprumView.style.display = 'none';
        if (dapView) dapView.style.display = 'none';
        if (fmutuosView) fmutuosView.style.display = 'none';
        if (cuotasfmutuosView) cuotasfmutuosView.style.display = 'none';
        if (valordapView) valordapView.style.display = 'none';
        if (bciView) bciView.style.display = 'none';
        if (banchileView) banchileView.style.display = 'none';
        if (versionLabel) versionLabel.style.display = 'none';

        if (view === 'welcome') {
            welcomeView.style.display = 'flex';
            if (versionLabel) versionLabel.style.display = 'block';
            // Nombre del usuario en el subtítulo
            const userName = sessionStorage.getItem('userName');
            const nameLabel = document.getElementById('userNameLabel');
            if (nameLabel) {
                nameLabel.innerText = userName ? userName : '¡Has iniciado Nido!';
            }
        } else if (view === 'recovery') {
            if (recoveryView) recoveryView.style.display = 'block';
        } else if (view === 'proyectos') {
            if (proyectosView) {
                proyectosView.style.display = 'block';
                loadFactoresData();
            }
        } else if (view === 'servicios') {
            if (serviciosView) {
                serviciosView.style.display = 'block';
                loadServiciosData();
            }
        } else if (view === 'cuprum') {
            if (cuprumView) {
                cuprumView.style.display = 'block';
                loadCuprumData();
            }
        } else if (view === 'dap') {
            if (dapView) {
                dapView.style.display = 'block';
            }
        } else if (view === 'fmutuos') {
            if (fmutuosView) {
                fmutuosView.style.display = 'block';
            }
        } else if (view === 'cuotasfmutuos') {
            if (cuotasfmutuosView) {
                cuotasfmutuosView.style.display = 'block';
            }
        } else if (view === 'valordap') {
            if (valordapView) valordapView.style.display = 'block';
        } else if (view === 'bci') {
            if (bciView) bciView.style.display = 'block';
        } else if (view === 'banchile') {
            if (banchileView) banchileView.style.display = 'block';
        } else {
            loginView.style.display = 'block';
        }
    }

    // Navegación SPA interna
    const toRecovery = document.getElementById('toRecovery');
    const toLogin = document.getElementById('toLogin');
    
    if (toRecovery) toRecovery.onclick = (e) => { e.preventDefault(); showView('recovery'); };
    if (toLogin) toLogin.onclick = (e) => { e.preventDefault(); showView('login'); };

    const toProyectosServicios = document.getElementById('toProyectosServicios');
    if (toProyectosServicios) toProyectosServicios.onclick = (e) => { e.preventDefault(); showView('proyectos'); };

    // Navegación a Cuprum desde distintas vistas — ahora manejado por data-goto en dropdowns

    // Logout BCI
    const logoutBtnbci = document.getElementById('logoutBtnbci');
    if (logoutBtnbci) {
        logoutBtnbci.addEventListener('click', () => { sessionStorage.clear(); showView('login'); });
    }

    // Logout BanChile
    const logoutBtnbanchile = document.getElementById('logoutBtnbanchile');
    if (logoutBtnbanchile) {
        logoutBtnbanchile.addEventListener('click', () => { sessionStorage.clear(); showView('login'); });
    }
    // Manejar clics en "Inicio" desde otras vistas
    document.querySelectorAll('.to-home').forEach(link => {
        link.onclick = (e) => { e.preventDefault(); showView('welcome'); };
    });

    // --- DROPDOWNS DE NAV ---
    // Abrir/cerrar al hacer click en el toggle
    document.querySelectorAll('.nav-dropdown').forEach(dd => {
        const toggle = dd.querySelector('.nav-dropdown-toggle');
        if (toggle) {
            toggle.addEventListener('click', (e) => {
                e.stopPropagation();
                // Cerrar otros dropdowns abiertos
                document.querySelectorAll('.nav-dropdown.open').forEach(other => {
                    if (other !== dd) other.classList.remove('open');
                });
                dd.classList.toggle('open');
            });
        }
    });

    // Items del dropdown navegan a la vista correspondiente
    document.querySelectorAll('.nav-dropdown-item[data-goto]').forEach(item => {
        item.addEventListener('click', (e) => {
            e.preventDefault();
            const target = item.getAttribute('data-goto');
            // Cerrar todos los dropdowns
            document.querySelectorAll('.nav-dropdown.open').forEach(dd => dd.classList.remove('open'));
            showView(target);
        });
    });

    // Cerrar dropdown al hacer click fuera
    document.addEventListener('click', () => {
        document.querySelectorAll('.nav-dropdown.open').forEach(dd => dd.classList.remove('open'));
    });

    // Navegación DAP
    const toProyectosDap = document.getElementById('toProyectosDap');
    if (toProyectosDap) toProyectosDap.onclick = (e) => { e.preventDefault(); showView('proyectos'); };

    const toCuprumDap = document.getElementById('toCuprumDap');
    if (toCuprumDap) toCuprumDap.onclick = (e) => { e.preventDefault(); showView('cuprum'); };

    const logoutBtnDap = document.getElementById('logoutBtnDap');
    if (logoutBtnDap) {
        logoutBtnDap.addEventListener('click', () => {
            sessionStorage.clear();
            showView('login');
        });
    }

    // Navegación F Mutuos
    const toProyectosFmutuos = document.getElementById('toProyectosFmutuos');
    if (toProyectosFmutuos) toProyectosFmutuos.onclick = (e) => { e.preventDefault(); showView('proyectos'); };

    const toCuprumFmutuos = document.getElementById('toCuprumFmutuos');
    if (toCuprumFmutuos) toCuprumFmutuos.onclick = (e) => { e.preventDefault(); showView('cuprum'); };

    const logoutBtnFmutuos = document.getElementById('logoutBtnFmutuos');
    if (logoutBtnFmutuos) {
        logoutBtnFmutuos.addEventListener('click', () => {
            sessionStorage.clear();
            showView('login');
        });
    }

    // Navegación Cuotas F Mutuos
    const toCuprumCuotasFM = document.getElementById('toCuprumCuotasFM');
    if (toCuprumCuotasFM) toCuprumCuotasFM.onclick = (e) => { e.preventDefault(); showView('cuprum'); };

    const logoutBtnCuotasFM = document.getElementById('logoutBtnCuotasFM');
    if (logoutBtnCuotasFM) {
        logoutBtnCuotasFM.addEventListener('click', () => {
            sessionStorage.clear();
            showView('login');
        });
    }

    // Navegación Valor DAP
    const toCuprumValorDap = document.getElementById('toCuprumValorDap');
    if (toCuprumValorDap) toCuprumValorDap.onclick = (e) => { e.preventDefault(); showView('cuprum'); };

    const logoutBtnValorDap = document.getElementById('logoutBtnValorDap');
    if (logoutBtnValorDap) {
        logoutBtnValorDap.addEventListener('click', () => {
            sessionStorage.clear();
            showView('login');
        });
    }

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

    const logoutBtnProyectos = document.getElementById('logoutBtnProyectos');
    if (logoutBtnProyectos) {
        logoutBtnProyectos.addEventListener('click', () => {
            sessionStorage.clear();
            showView('login');
        });
    }

    const logoutBtnServicios = document.getElementById('logoutBtnServicios');
    if (logoutBtnServicios) {
        logoutBtnServicios.addEventListener('click', () => {
            sessionStorage.clear();
            showView('login');
        });
    }

    const logoutBtnCuprum = document.getElementById('logoutBtnCuprum');
    if (logoutBtnCuprum) {
        logoutBtnCuprum.addEventListener('click', () => {
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

    // --- CARGAR DATOS DE SERVICIOS (Saldo Fondo A y Fondo C por usuario) ---
    async function loadServiciosData() {
        const loadingEl   = document.getElementById('serviciosLoading');
        const resultadoEl = document.getElementById('serviciosResultado');
        const errorEl     = document.getElementById('serviciosError');
        const userLabel   = document.getElementById('serviciosUserLabel');
        const bloqueC     = document.getElementById('svc_bloque_c');

        if (loadingEl)   loadingEl.style.display   = 'block';
        if (resultadoEl) resultadoEl.style.display = 'none';
        if (errorEl)     errorEl.style.display     = 'none';
        if (bloqueC)     bloqueC.style.display     = 'none';

        const userRut  = sessionStorage.getItem('userRut');
        const userName = sessionStorage.getItem('userName');

        if (userLabel) {
            userLabel.textContent = userName
                ? 'RUT: ' + userRut + ' — ' + userName
                : 'RUT: ' + (userRut || 'desconocido');
        }

        const client = getSupabaseClient();
        if (!client) {
            if (loadingEl) loadingEl.textContent = 'Error: cliente Supabase no disponible.';
            return;
        }

        try {
            // 1. Último registro cuprum (fecha más reciente) — trae fondo_a y fondo_c
            const { data: cuprumData, error: cuprumError } = await client
                .from('cuprum')
                .select('fondo_a, fondo_c, fecha')
                .order('fecha', { ascending: false })
                .limit(1)
                .single();

            if (cuprumError) throw new Error('Error cuprum: ' + cuprumError.message);

            // 2. Cuotas del usuario — trae cta_fondo_a y cta_fondo_c
            const { data: cuotasData, error: cuotasError } = await client
                .from('cuotas')
                .select('cta_fondo_a, cta_fondo_c')
                .eq('rut', userRut)
                .single();

            if (cuotasError) throw new Error('Error cuotas: ' + cuotasError.message);

            const fmt      = (n) => n.toLocaleString('es-CL', { minimumFractionDigits: 4, maximumFractionDigits: 4 });
            const fmtPesos = (n) => '$ ' + n.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

            // --- FONDO A ---
            const fondoA    = parseFloat(cuprumData.fondo_a)    || 0;
            const ctaFondoA = parseFloat(cuotasData.cta_fondo_a) || 0;
            const totalA    = fondoA * ctaFondoA;

            document.getElementById('svc_fondo_a').textContent     = fmt(fondoA);
            document.getElementById('svc_cta_fondo_a').textContent = fmt(ctaFondoA);
            document.getElementById('svc_total_a').textContent     = fmtPesos(totalA);

            // Botón gráfica Fondo A
            const btnA = document.getElementById('btnGraficoA');
            if (btnA) {
                btnA.onclick = () => { if (window._showGrafico) window._showGrafico('a', ctaFondoA); };
            }

            // --- FONDO C (solo si cta_fondo_c > 0) ---
            const fondoC    = parseFloat(cuprumData.fondo_c)    || 0;
            const ctaFondoC = parseFloat(cuotasData.cta_fondo_c) || 0;

            if (ctaFondoC > 0) {
                const totalC = fondoC * ctaFondoC;
                document.getElementById('svc_fondo_c').textContent     = fmt(fondoC);
                document.getElementById('svc_cta_fondo_c').textContent = fmt(ctaFondoC);
                document.getElementById('svc_total_c').textContent     = fmtPesos(totalC);
                if (bloqueC) bloqueC.style.display = 'block';

                // Botón gráfica Fondo C
                const btnC = document.getElementById('btnGraficoC');
                if (btnC) {
                    btnC.onclick = () => { if (window._showGrafico) window._showGrafico('c', ctaFondoC); };
                }
            }

            if (loadingEl)   loadingEl.style.display   = 'none';
            if (resultadoEl) resultadoEl.style.display = 'block';

        } catch (err) {
            console.error('loadServiciosData error:', err);
            if (loadingEl)   loadingEl.style.display   = 'none';
            if (resultadoEl) resultadoEl.style.display = 'block';
            if (errorEl) {
                errorEl.style.display = 'block';
                errorEl.textContent   = err.message;
            }
        }
    }

    // --- CARGAR DATOS DE LA TABLA CUOTAS ---
    async function loadFactoresData() {
        console.log(">>> [DEBUG] Llamada a loadFactoresData() → tabla cuotas");
        const loadingEl = document.getElementById('factoresLoading');
        const headerEl = document.getElementById('factoresHeader');
        const bodyEl = document.getElementById('factoresBody');

        if (!loadingEl || !headerEl || !bodyEl) {
            console.error(">>> [DEBUG] Faltan elementos DOM para la tabla");
            return;
        }

        loadingEl.style.display = 'block';
        loadingEl.innerText = 'Cargando datos de cuotas...';
        headerEl.innerHTML = '';
        bodyEl.innerHTML = '';

        const client = getSupabaseClient();
        if (!client) {
            console.error(">>> [DEBUG] Cliente Supabase NO inicializado");
            loadingEl.innerText = 'Error: Cliente Supabase no disponible.';
            return;
        }

        try {
            console.log(">>> [DEBUG] Intentando FETCH de 'cuotas'...");
            const { data, error, status, statusText } = await client
                .from('cuotas')
                .select('*');

            console.group("Diagnóstico Tabla Cuotas");
            console.log("HTTP Status:", status);
            console.log("Status Text:", statusText);
            console.log("Error:", error);
            console.log("Data:", data);
            console.groupEnd();

            if (error) {
                console.error("Error al cargar cuotas:", error);
                loadingEl.innerText = 'Error al cargar cuotas: ' + error.message + ' (Code: ' + error.code + ')';
                return;
            }

            if (!data || data.length === 0) {
                console.warn(">>> [DEBUG] No se devolvieron datos de la tabla 'cuotas'");
                loadingEl.innerText = 'No se encontraron registros en la tabla cuotas. (La tabla podría estar vacía o bloqueada por RLS)';
                return;
            }

            // Ocultar mensaje de carga
            loadingEl.style.display = 'none';

            // Generar cabeceras dinámicamente basadas en el primer registro
            const columns = Object.keys(data[0]);
            console.log(">>> [DEBUG] Columnas encontradas:", columns);
            
            columns.forEach(col => {
                const th = document.createElement('th');
                th.innerText = col.charAt(0).toUpperCase() + col.slice(1);
                headerEl.appendChild(th);
            });

            // Generar filas
            data.forEach((row, index) => {
                const tr = document.createElement('tr');
                columns.forEach(col => {
                    const td = document.createElement('td');
                    td.innerText = row[col] !== null ? row[col] : '-';
                    tr.appendChild(td);
                });
                bodyEl.appendChild(tr);
            });
            console.log(">>> [DEBUG] Tabla cuotas renderizada con " + data.length + " filas.");

        } catch (err) {
            console.error(">>> [DEBUG] Error inesperado:", err);
            loadingEl.innerText = 'Ocurrió un error inesperado al cargar los datos.';
        }
    }

    // --- CARGAR DATOS DE AFP CUPRUM ---
    let cuprumAllData = []; // caché de todos los datos

    async function loadCuprumData() {
        const loadingEl = document.getElementById('cuprumLoading');
        const headerEl = document.getElementById('cuprumHeader');
        const bodyEl = document.getElementById('cuprumBody');
        const statsEl = document.getElementById('cuprumStats');

        if (!loadingEl || !headerEl || !bodyEl) return;

        // Si ya tenemos datos en caché, solo re-renderizar
        if (cuprumAllData.length > 0) {
            renderCuprumTable(cuprumAllData);
            return;
        }

        loadingEl.style.display = 'block';
        loadingEl.innerText = 'Cargando datos de AFP Cuprum...';
        headerEl.innerHTML = '';
        bodyEl.innerHTML = '';
        if (statsEl) statsEl.style.display = 'none';

        const client = getSupabaseClient();
        if (!client) {
            loadingEl.innerText = 'Error: Cliente Supabase no disponible.';
            return;
        }

        try {
            const { data, error } = await client
                .from('cuprum')
                .select('*')
                .order('fecha', { ascending: false });

            if (error) {
                loadingEl.innerText = 'Error al cargar Cuprum: ' + error.message;
                return;
            }

            if (!data || data.length === 0) {
                loadingEl.innerText = 'No se encontraron registros en la tabla cuprum.';
                return;
            }

            cuprumAllData = data;
            renderCuprumTable(data);

            // Activar filtros
            const fondoFiltro = document.getElementById('cuprumFondoFiltro');
            const buscarInput = document.getElementById('cuprumBuscar');

            if (fondoFiltro) {
                fondoFiltro.addEventListener('change', applyCuprumFilters);
            }
            if (buscarInput) {
                buscarInput.addEventListener('input', applyCuprumFilters);
            }

        } catch (err) {
            loadingEl.innerText = 'Error inesperado al cargar datos de Cuprum.';
            console.error(err);
        }
    }

    function applyCuprumFilters() {
        const fondoFiltro = document.getElementById('cuprumFondoFiltro');
        const buscarInput = document.getElementById('cuprumBuscar');
        const fondo = fondoFiltro ? fondoFiltro.value : 'all';
        const buscar = buscarInput ? buscarInput.value.trim().toLowerCase() : '';

        let filtered = cuprumAllData;

        if (buscar) {
            filtered = filtered.filter(row => {
                const fecha = row.fecha ? String(row.fecha).toLowerCase() : '';
                return fecha.includes(buscar);
            });
        }

        // Resetear a página 1 antes de renderizar con nuevo filtro
        pag.pagina = 1;
        renderCuprumTable(filtered, fondo);
    }

    function renderCuprumTable(data, fondoFiltro = 'all') {
        const loadingEl = document.getElementById('cuprumLoading');
        const headerEl = document.getElementById('cuprumHeader');
        const statsEl = document.getElementById('cuprumStats');

        if (loadingEl) loadingEl.style.display = 'none';
        headerEl.innerHTML = '';

        // Determinar columnas a mostrar
        const allCols = ['fecha', 'fondo_a', 'fondo_b', 'fondo_c', 'fondo_d', 'fondo_e'];
        const fondoCols = fondoFiltro === 'all' ? allCols : ['fecha', fondoFiltro];

        // Etiquetas de cabecera
        const colLabels = {
            fecha: 'Fecha',
            fondo_a: 'Fondo A',
            fondo_b: 'Fondo B',
            fondo_c: 'Fondo C',
            fondo_d: 'Fondo D',
            fondo_e: 'Fondo E'
        };

        // Cabeceras
        fondoCols.forEach(col => {
            const th = document.createElement('th');
            th.innerText = colLabels[col] || col;
            headerEl.appendChild(th);
        });

        // Guardar filas como strings HTML y renderizar con paginación
        pag.datos  = data.map(row =>
            fondoCols.map(col => {
                if (col === 'fecha') {
                    const d = new Date(row[col] + 'T00:00:00');
                    const texto = isNaN(d.getTime()) ? (row[col] || '-') :
                        d.toLocaleDateString('es-CL', { day: '2-digit', month: 'short', year: 'numeric' });
                    return '<td style="font-weight:500;color:#c4b5fd;">' + texto + '</td>';
                } else {
                    const val = parseFloat(row[col]);
                    const texto = isNaN(val) ? '-' : val.toLocaleString('es-CL', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                    return '<td>' + texto + '</td>';
                }
            }).join('')
        );
        pag.pagina = 1;
        cuprumRenderPagina();

        // Barra de estadísticas
        if (statsEl && data.length > 0 && fondoFiltro !== 'all') {
            const vals = data.map(r => parseFloat(r[fondoFiltro])).filter(v => !isNaN(v));
            if (vals.length > 0) {
                const ultimo = vals[0];
                const primero = vals[vals.length - 1];
                const variacion = ((ultimo - primero) / primero * 100).toFixed(2);
                const max = Math.max(...vals).toLocaleString('es-CL', { minimumFractionDigits: 2 });
                const min = Math.min(...vals).toLocaleString('es-CL', { minimumFractionDigits: 2 });
                const trend = variacion >= 0 ? '▲' : '▼';
                const trendColor = variacion >= 0 ? '#34d399' : '#f87171';
                statsEl.innerHTML = `
                    <span>📊 <strong>${data.length}</strong> registros</span>
                    <span>⬆ Máx: <strong>${max}</strong></span>
                    <span>⬇ Mín: <strong>${min}</strong></span>
                    <span style="color:${trendColor}">${trend} Variación: <strong>${variacion}%</strong></span>
                `;
                statsEl.style.display = 'flex';
            }
        } else if (statsEl) {
            statsEl.innerHTML = `<span>📊 <strong>${data.length}</strong> registros cargados</span>`;
            statsEl.style.display = 'flex';
        }
    }

    // --- LOGICA DE LA PAGINA DE SERVICIOS (REINICIALIZADA) ---
    // Limpieza al recibir el foco usando setTimeout para evitar bloqueos del teclado y del foco
    ['input_servicio', 'nuevo_valor'].forEach(id => {
        const el = document.getElementById(id);
        if (el) {
            el.addEventListener('focus', function() {
                setTimeout(() => {
                    this.value = '';
                }, 0);
            });
        }
    });

    // Lógica del botón Ejecutar (ejec)
    const ejecBtn = document.getElementById('ejec');
    if (ejecBtn) {
        ejecBtn.addEventListener('click', async () => {
            const serviceName = document.getElementById('input_servicio').value.trim();
            const kgVol = parseFloat(document.getElementById('nuevo_valor').value);
            const valTotInput = document.getElementById('val_tot');

            if (!serviceName || isNaN(kgVol)) {
                alert("Por favor, ingresa el servicio y el valor Kg/Vol.");
                return;
            }

            const client = getSupabaseClient();
            if (!client) {
                alert("Error: Cliente Supabase no disponible.");
                return;
            }

            try {
                // Buscamos el servicio en la tabla 'factores'
                const { data, error } = await client
                    .from('factores')
                    .select('rate_cost, profit')
                    .eq('service', serviceName)
                    .maybeSingle();

                if (error) {
                    console.error("Error al buscar servicio:", error);
                    alert("Error en la base de datos: " + error.message);
                } else if (!data) {
                    alert("El servicio '" + serviceName + "' no existe en la tabla de factores.");
                } else {
                    const rateCost = parseFloat(data.rate_cost) || 0;
                    const profit = parseFloat(data.profit) || 0;
                    const total = (kgVol * rateCost) + profit;
                    if (valTotInput) {
                        valTotInput.value = total.toLocaleString('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
                        
                        // Pequeño efecto visual de actualización
                        valTotInput.style.color = '#10b981';
                        setTimeout(() => valTotInput.style.color = '', 500);
                    }
                }
            } catch (err) {
                console.error("Error inesperado en cálculo:", err);
                alert("Ocurrió un error inesperado al realizar el cálculo.");
            }
        });
    }


    // ================================================================
    // --- VISTA DE GRÁFICO DE RENTABILIDAD ---
    // ================================================================
    let graficoChart    = null;   // instancia Chart.js activa
    let graficoFondoActual = 'a'; // 'a' o 'c'
    let graficoCtaCuotas   = 0;   // cuotas del usuario para el fondo activo
    let graficoMesOffset   = 0;   // 0 = mes actual, -1 = mes anterior, etc.

    // Oculta todas las vistas y muestra graficoView
    function showGrafico(fondo, ctaCuotas) {
        graficoFondoActual = fondo;
        graficoCtaCuotas   = ctaCuotas;
        graficoMesOffset   = 0;

        // Ocultar todas las vistas
        ['loginView','welcomeView','recoveryView','proyectosView',
         'serviciosView','cuprumView'].forEach(id => {
            const el = document.getElementById(id);
            if (el) el.style.display = 'none';
        });

        const graficoView = document.getElementById('graficoView');
        if (graficoView) graficoView.style.display = 'block';

        // Título de la vista
        const label = fondo === 'a' ? 'Fondo A' : 'Fondo C';
        const navTitle = document.getElementById('graficoNavTitle');
        const titulo   = document.getElementById('graficoTitulo');
        if (navTitle) navTitle.textContent = 'Nido - Gráfica ' + label;
        if (titulo)   titulo.textContent   = 'Rentabilidad ' + label;

        // Info del usuario como subtítulo
        const userRut  = sessionStorage.getItem('userRut');
        const userName = sessionStorage.getItem('userName');
        const sub = document.getElementById('graficoSubtitulo');
        if (sub) sub.textContent = (userName ? userName + ' — ' : '') + 'RUT: ' + userRut;

        cargarGraficoMes();
    }

    // Calcula año/mes según el offset actual
    function getMesActual() {
        const hoy = new Date();
        hoy.setDate(1);
        hoy.setMonth(hoy.getMonth() + graficoMesOffset);
        return { anio: hoy.getFullYear(), mes: hoy.getMonth() + 1 };
    }

    // Formatea pesos CLP
    function fmtPesoGrafico(n) {
        return '$ ' + n.toLocaleString('es-CL', { minimumFractionDigits: 0, maximumFractionDigits: 0 });
    }

    async function cargarGraficoMes() {
        const loadingEl = document.getElementById('graficoLoading');
        const canvas    = document.getElementById('graficoCanvas');
        if (loadingEl) { loadingEl.style.display = 'block'; loadingEl.textContent = 'Cargando datos...'; }
        if (canvas)    canvas.style.display = 'none';

        // Destruir gráfico anterior si existe
        if (graficoChart) { graficoChart.destroy(); graficoChart = null; }

        const { anio, mes } = getMesActual();
        const mesNombres = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                            'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre'];
        const mesLabel = document.getElementById('graficoMesLabel');
        if (mesLabel) mesLabel.textContent = mesNombres[mes - 1] + ' ' + anio;

        // Bloquear botón "siguiente" si ya estamos en el mes actual
        const nextBtn = document.getElementById('graficoNextMes');
        if (nextBtn) nextBtn.style.opacity = graficoMesOffset >= 0 ? '0.35' : '1';

        const client = getSupabaseClient();
        if (!client) {
            if (loadingEl) loadingEl.textContent = 'Error: Supabase no disponible.';
            return;
        }

        try {
            // Primer y último día del mes
            const primerDia = anio + '-' + String(mes).padStart(2,'0') + '-01';
            const ultimoDia = new Date(anio, mes, 0); // día 0 del mes siguiente = último del mes
            const ultimoDiaStr = anio + '-' + String(mes).padStart(2,'0') + '-' +
                                 String(ultimoDia.getDate()).padStart(2,'0');

            const campoFondo = 'fondo_' + graficoFondoActual;

            const { data, error } = await client
                .from('cuprum')
                .select('fecha, ' + campoFondo)
                .gte('fecha', primerDia)
                .lte('fecha', ultimoDiaStr)
                .order('fecha', { ascending: true });

            if (error) throw new Error(error.message);
            if (!data || data.length === 0) {
                if (loadingEl) loadingEl.textContent = 'Sin datos para este mes.';
                return;
            }

            // Calcular saldo diario = cuota_fondo × cuotas_usuario
            const labels  = data.map(r => {
                const [,, d] = r.fecha.split('-');
                return Number(d) + '/' + String(mes).padStart(2,'0');
            });
            const saldos  = data.map(r => parseFloat(r[campoFondo]) * graficoCtaCuotas);

            const saldoInicial = saldos[0];
            const saldoFinal   = saldos[saldos.length - 1];
            const rentPct      = ((saldoFinal - saldoInicial) / saldoInicial * 100);
            const positivo     = rentPct >= 0;

            // Tarjetas resumen
            const elIni  = document.getElementById('graficoSaldoInicial');
            const elFin  = document.getElementById('graficoSaldoFinal');
            const elRent = document.getElementById('graficoRentabilidad');
            if (elIni)  elIni.textContent  = fmtPesoGrafico(saldoInicial);
            if (elFin)  elFin.textContent  = fmtPesoGrafico(saldoFinal);
            if (elRent) {
                elRent.textContent = (positivo ? '+' : '') + rentPct.toFixed(2) + '%';
                elRent.style.color = positivo ? '#34d399' : '#f87171';
            }

            // Color según fondo
            const colorLinea  = graficoFondoActual === 'a' ? '#a5b4fc' : '#6ee7b7';
            const colorGrad1  = graficoFondoActual === 'a' ? 'rgba(165,180,252,0.35)' : 'rgba(110,231,183,0.35)';
            const colorGrad2  = graficoFondoActual === 'a' ? 'rgba(165,180,252,0.02)' : 'rgba(110,231,183,0.02)';

            // Dibujar gráfico
            if (loadingEl) loadingEl.style.display = 'none';
            if (canvas)    canvas.style.display    = 'block';

            const ctx = canvas.getContext('2d');
            const gradient = ctx.createLinearGradient(0, 0, 0, 380);
            gradient.addColorStop(0, colorGrad1);
            gradient.addColorStop(1, colorGrad2);

            graficoChart = new Chart(ctx, {
                type: 'line',
                data: {
                    labels: labels,
                    datasets: [{
                        label: 'Saldo ' + (graficoFondoActual === 'a' ? 'Fondo A' : 'Fondo C'),
                        data: saldos,
                        borderColor: colorLinea,
                        backgroundColor: gradient,
                        borderWidth: 2.5,
                        pointRadius: data.length <= 15 ? 4 : 2,
                        pointHoverRadius: 7,
                        pointBackgroundColor: colorLinea,
                        fill: true,
                        tension: 0.4
                    }]
                },
                options: {
                    responsive: true,
                    maintainAspectRatio: true,
                    interaction: { mode: 'index', intersect: false },
                    plugins: {
                        legend: { display: false },
                        tooltip: {
                            backgroundColor: 'rgba(15,23,42,0.92)',
                            titleColor: 'rgba(255,255,255,0.6)',
                            bodyColor: '#fff',
                            borderColor: 'rgba(255,255,255,0.1)',
                            borderWidth: 1,
                            padding: 12,
                            callbacks: {
                                label: (ctx) => '  ' + fmtPesoGrafico(ctx.parsed.y)
                            }
                        }
                    },
                    scales: {
                        x: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: {
                                color: 'rgba(255,255,255,0.45)',
                                font: { size: 11 },
                                maxTicksLimit: 16
                            }
                        },
                        y: {
                            grid: { color: 'rgba(255,255,255,0.05)' },
                            ticks: {
                                color: 'rgba(255,255,255,0.45)',
                                font: { size: 11 },
                                callback: (v) => fmtPesoGrafico(v)
                            }
                        }
                    }
                }
            });

        } catch (err) {
            console.error('cargarGraficoMes error:', err);
            if (loadingEl) loadingEl.textContent = 'Error: ' + err.message;
        }
    }

    // Botones de mes anterior / siguiente
    const graficoPrevMes = document.getElementById('graficoPrevMes');
    const graficoNextMes = document.getElementById('graficoNextMes');
    if (graficoPrevMes) {
        graficoPrevMes.addEventListener('click', () => {
            graficoMesOffset--;
            cargarGraficoMes();
        });
    }
    if (graficoNextMes) {
        graficoNextMes.addEventListener('click', () => {
            if (graficoMesOffset < 0) { graficoMesOffset++; cargarGraficoMes(); }
        });
    }

    // Botón volver a Servicios
    const graficoBack = document.getElementById('graficoBackServicios');
    if (graficoBack) {
        graficoBack.addEventListener('click', (e) => {
            e.preventDefault();
            document.getElementById('graficoView').style.display = 'none';
            showView('servicios');
        });
    }

    // Logout desde gráfico
    const logoutBtnGrafico = document.getElementById('logoutBtnGrafico');
    if (logoutBtnGrafico) {
        logoutBtnGrafico.addEventListener('click', () => {
            sessionStorage.clear();
            document.getElementById('graficoView').style.display = 'none';
            showView('login');
        });
    }

    // Exponer showGrafico para los botones de Servicios
    window._showGrafico = showGrafico;
    // ================================================================

}); // fin DOMContentLoaded

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
