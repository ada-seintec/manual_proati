// Template base otimizado para evitar travamentos
class LayoutTemplate {
    constructor() {
        this.currentPage = 'home';
        this.eventListeners = new Map(); // Rastreia event listeners
        this.isInitialized = false;
        this.menuItems = [
            { id: 'home', title: '🏠 Início', icon: '🏠' },
            { id: 'comunicados-nit', title: '📢 Comunicados NIT', icon: '📢' },
            { id: 'levantamentos', title: '📊 Levantamentos', icon: '📊' },
			{ id: 'saresp', title: '📝 Saresp', icon: '📝' },
            { id: 'comunicados-seduc', title: '📄 Comunicados SEDUC', icon: '📄' },
            { id: 'equipe', title: '👥 Equipe', icon: '👥' },
            { id: 'conectividade', title: '🌐 Conectividade', icon: '🌐' },
            { id: 'curso-tecnico', title: '🎓 Curso Técnico', icon: '🎓' },
            { id: 'entregas-2025', title: '📦 Entregas 2025', icon: '📦' },
            { id: 'garantia', title: '🛡️ Garantia', icon: '🛡️' },
            { id: 'identificacao', title: '🏷️ Identificação', icon: '🏷️' },
            { id: 'impressoras', title: '🖨️ Impressoras', icon: '🖨️' },
            { id: 'legislacao', title: '⚖️ Legislação', icon: '⚖️' },
            { id: 'sed-email', title: '📧 SED e E-mail', icon: '📧' },
            { id: 'suporte-remoto', title: '🔧 Suporte Remoto', icon: '🔧' },
            { id: 'equipamentos', title: '💻 Equipamentos', icon: '💻' }
        ];
    }

    // Gera o HTML do header
    generateHeader() {
        return `
            <header class="header">
                <div class="container">
                    <div class="header-content">
                        <div>
                            <div class="logo">Manual PROATI</div>
                            <div class="subtitle">Diretoria de Ensino - Adamantina</div>
                        </div>
                    </div>
                </div>
            </header>
        `;
    }

    // Gera o HTML da sidebar de forma otimizada
    generateSidebar() {
        const menuItemsHTML = this.menuItems.map(item => {
            const activeClass = item.id === this.currentPage ? 'active' : '';
            return `<li><a href="#${item.id}" class="${activeClass}" data-page="${item.id}">${item.title}</a></li>`;
        }).join('');

        return `
            <aside class="sidebar">
                <h3>📋 Menu Rápido</h3>
                <ul class="sidebar-menu">
                    ${menuItemsHTML}
                </ul>
            </aside>
        `;
    }

    // Gera o HTML do footer
    generateFooter() {
        return `
            <footer class="footer">
                <div class="container">
                    <div class="footer-content">
                        <div class="footer-section">
                            <h4>📍 Diretoria de Ensino</h4>
                            <p>Região de Adamantina</p>
                            <p>Estado de São Paulo</p>
                        </div>
                        <div class="footer-section">
                            <h4>📞 Contato NIT</h4>
                            <p>E-mail: deadanit@educacao.sp.gov.br</p>
                            <p>WhatsApp: (18) 3502-2303</p>
                        </div>
                        <div class="footer-section">
                            <h4>🕒 Horário de Atendimento</h4>
                            <p>Segunda a Sexta</p>
                            <p>8:00-13:00 e 13:30-17:30</p>
                        </div>
                    </div>
                    <p style="margin-top: 20px; padding-top: 20px; border-top: 1px solid #374151;">
                        © 2025 Manual de Sobrevivência do PROATI - DE Adamantina
                    </p>
                </div>
            </footer>
        `;
    }

    // Gera o container principal para o conteúdo
    generateMainContainer(content) {
        return `
            <div class="container">
                <div class="main-layout">
                    ${this.generateSidebar()}
                    <main class="main-content fade-in">
                        ${content}
                    </main>
                </div>
            </div>
        `;
    }

    // Gera o layout completo da página
    generateFullLayout(pageContent, pageTitle = 'Manual PROATI DE Adamantina') {
        return `
            <!DOCTYPE html>
            <html lang="pt-BR">
            <head>
                <meta charset="UTF-8">
                <meta name="viewport" content="width=device-width, initial-scale=1.0">
                <title>${pageTitle}</title>
                <meta name="description" content="Manual de Sobrevivência do PROATI - Diretoria de Ensino de Adamantina">
                <link rel="stylesheet" href="css/style.css">
                <link rel="icon" type="image/x-icon" href="favicon.ico">
            </head>
            <body>
                ${this.generateHeader()}
                ${this.generateMainContainer(pageContent)}
                ${this.generateFooter()}
                <script src="js/layout-template.js"></script>
                <script src="js/page-loader.js"></script>
				<script async data-id="101488917" src="//static.getclicky.com/js"></script>
            </body>
            </html>
        `;
    }

    // Remove event listeners anteriores
    removeEventListeners() {
        this.eventListeners.forEach((listener, element) => {
            if (element && listener) {
                element.removeEventListener(listener.type, listener.handler);
            }
        });
        this.eventListeners.clear();
    }

    // Adiciona event listener com rastreamento
    addEventListenerTracked(element, type, handler) {
        if (element) {
            element.addEventListener(type, handler);
            this.eventListeners.set(element, { type, handler });
        }
    }

    // Atualiza apenas o conteúdo principal de forma otimizada
    updateContent(content, pageId) {
        this.currentPage = pageId;
        
        // Usa requestAnimationFrame para operações DOM
        requestAnimationFrame(() => {
            const mainContent = document.querySelector('.main-content');
            const sidebar = document.querySelector('.sidebar');
            
            if (mainContent) {
                mainContent.innerHTML = content;
                mainContent.classList.add('fade-in');
            }

            // Atualiza links ativos na sidebar de forma otimizada
            if (sidebar) {
                const activeLink = sidebar.querySelector('a.active');
                const newActiveLink = sidebar.querySelector(`a[data-page="${pageId}"]`);
                
                // Remove classe active do link anterior
                if (activeLink) {
                    activeLink.classList.remove('active');
                }
                
                // Adiciona classe active ao novo link
                if (newActiveLink) {
                    newActiveLink.classList.add('active');
                }
            }

            // Atualiza título da página
            document.title = this.getPageTitle(pageId);
        });
    }

    // Retorna o título da página baseado no ID
    getPageTitle(pageId) {
        const menuItem = this.menuItems.find(item => item.id === pageId);
        const baseTitle = 'Manual PROATI DE Adamantina';
        
        if (menuItem && pageId !== 'home') {
            return `${menuItem.title.replace(/[📢📊📄👥🌐🎓📦🛡️🏷️🖨️⚖️📧🔧💻]/g, '').trim()} - ${baseTitle}`;
        }
        
        return baseTitle;
    }

    // Inicializa navegação otimizada com event delegation
    initNavigation() {
        // Remove listeners anteriores
        this.removeEventListeners();

        // Event delegation para links de navegação
        const navigationHandler = (e) => {
            const target = e.target.closest('a[data-page]');
            if (target) {
                e.preventDefault();
                const pageId = target.dataset.page;
                
                // Throttle para evitar cliques múltiplos
                if (!target.dataset.navigating) {
                    target.dataset.navigating = 'true';
                    
                    window.pageLoader.loadPage(pageId).finally(() => {
                        setTimeout(() => {
                            delete target.dataset.navigating;
                        }, 300);
                    });
                }
            }
        };

        // Adiciona listener ao documento (event delegation)
        this.addEventListenerTracked(document, 'click', navigationHandler);
    }

    // Inicializa navegação por hash otimizada
    initHashNavigation() {
        const hashChangeHandler = () => {
            const pageId = window.location.hash.slice(1) || 'home';
            if (window.pageLoader && this.currentPage !== pageId) {
                window.pageLoader.loadPage(pageId);
            }
        };

        this.addEventListenerTracked(window, 'hashchange', hashChangeHandler);
    }

    // Inicializa menu mobile otimizado
    initMobileMenu() {
        // Cria botão do menu mobile se não existir
        if (!document.querySelector('.mobile-menu-toggle')) {
            const mobileButton = document.createElement('button');
            mobileButton.className = 'mobile-menu-toggle';
            mobileButton.innerHTML = '☰';
            mobileButton.setAttribute('aria-label', 'Abrir menu');
            document.body.appendChild(mobileButton);

            // Cria overlay
            const overlay = document.createElement('div');
            overlay.className = 'sidebar-overlay';
            document.body.appendChild(overlay);
        }

        const mobileToggle = document.querySelector('.mobile-menu-toggle');
        const sidebar = document.querySelector('.sidebar');
        const overlay = document.querySelector('.sidebar-overlay');

        if (mobileToggle && sidebar && overlay) {
            // Handler para abrir/fechar menu
            const toggleHandler = (e) => {
                e.stopPropagation();
                sidebar.classList.toggle('open');
                overlay.classList.toggle('show');
                
                // Atualiza aria-label
                const isOpen = sidebar.classList.contains('open');
                mobileToggle.setAttribute('aria-label', isOpen ? 'Fechar menu' : 'Abrir menu');
            };

            // Handler para fechar menu
            const closeHandler = () => {
                sidebar.classList.remove('open');
                overlay.classList.remove('show');
                mobileToggle.setAttribute('aria-label', 'Abrir menu');
            };

            // Adiciona listeners
            this.addEventListenerTracked(mobileToggle, 'click', toggleHandler);
            this.addEventListenerTracked(overlay, 'click', closeHandler);
            
            // Fecha menu ao navegar
            const navigationCloseHandler = (e) => {
                if (e.target.closest('a[data-page]')) {
                    closeHandler();
                }
            };
            
            this.addEventListenerTracked(sidebar, 'click', navigationCloseHandler);
        }
    }

    // Inicializa o layout de forma otimizada
    init() {
        // Evita inicialização múltipla
        if (this.isInitialized) {
            return;
        }

        // Aguarda DOM estar pronto
        if (document.readyState === 'loading') {
            document.addEventListener('DOMContentLoaded', () => this.init());
            return;
        }

        this.isInitialized = true;

        // Inicializa componentes
        this.initNavigation();
        this.initHashNavigation();
        this.initMobileMenu();

        // Carrega página inicial
        const initialPage = window.location.hash.slice(1) || 'home';
        if (window.pageLoader) {
            window.pageLoader.loadPage(initialPage);
        }
    }

    // Cleanup
    cleanup() {
        this.removeEventListeners();
        this.isInitialized = false;
    }
}
