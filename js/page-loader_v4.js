// Carregador de páginas otimizado para evitar travamentos
class PageLoader {
    constructor() {
        this.pages = {};
        this.currentPage = 'home';
        this.loadingIndicator = this.createLoadingIndicator();
        this.cache = new Map();
        this.maxCacheSize = 10; // Limita cache para evitar memory leak
        this.isLoading = false; // Previne navegações simultâneas
        this.searchTimeout = null; // Para debounce da busca
        this.eventListeners = new Map(); // Rastreia event listeners
        this.abortController = null; // Para cancelar requests
    }

    // Cria indicador de carregamento
    createLoadingIndicator() {
        return `
            <div class="loading-container" style="text-align: center; padding: 50px;">
                <div class="loading-spinner" style="
                    border: 4px solid #f3f4f6;
                    border-top: 4px solid #3b82f6;
                    border-radius: 50%;
                    width: 40px;
                    height: 40px;
                    animation: spin 1s linear infinite;
                    margin: 0 auto 20px;
                "></div>
                <p>Carregando página...</p>
            </div>
        `;
    }

    // Registra uma página no sistema
    registerPage(pageId, htmlFilePath, pageTitle = null) {
        this.pages[pageId] = {
            htmlPath: htmlFilePath,
            title: pageTitle || this.getDefaultTitle(pageId)
        };
    }

    // Retorna título padrão baseado no ID da página
    getDefaultTitle(pageId) {
        const titles = {
            'home': 'Manual PROATI DE Adamantina',
            'comunicados-nit': 'Comunicados NIT - Manual PROATI DE Adamantina',
            'levantamentos': 'Levantamentos - Manual PROATI DE Adamantina',
            'comunicados-seduc': 'Comunicados SEDUC - Manual PROATI DE Adamantina',
            'equipe': 'Equipe - Manual PROATI DE Adamantina',
            'conectividade': 'Conectividade - Manual PROATI DE Adamantina',
            'curso-tecnico': 'Curso Técnico - Manual PROATI DE Adamantina',
            'entregas-2025': 'Entregas 2025 - Manual PROATI DE Adamantina',
            'garantia': 'Garantia - Manual PROATI DE Adamantina',
            'identificacao': 'Identificação - Manual PROATI DE Adamantina',
            'impressoras': 'Impressoras - Manual PROATI DE Adamantina',
            'legislacao': 'Legislação - Manual PROATI DE Adamantina',
            'sed-email': 'SED e E-mail - Manual PROATI DE Adamantina',
            'suporte-remoto': 'Suporte Remoto - Manual PROATI DE Adamantina',
            'equipamentos': 'Equipamentos - Manual PROATI DE Adamantina'
        };
        return titles[pageId] || 'Manual PROATI DE Adamantina';
    }

    // Gerencia cache com limite de tamanho
    manageCacheSize() {
        if (this.cache.size > this.maxCacheSize) {
            const firstKey = this.cache.keys().next().value;
            this.cache.delete(firstKey);
        }
    }

    // Carrega arquivo HTML via fetch com timeout e cancelamento
    async loadHTMLFile(filePath) {
        try {
            // Verifica cache primeiro
            /*if (this.cache.has(filePath)) {
                return this.cache.get(filePath);
            }*/

            // Cancela request anterior se existir
            if (this.abortController) {
                this.abortController.abort();
            }

            // Cria novo AbortController
            this.abortController = new AbortController();

            const response = await fetch(filePath, {
                signal: this.abortController.signal
            });
            
            if (!response.ok) {
                throw new Error(`Erro HTTP: ${response.status} - ${response.statusText}`);
            }
            
            const html = await response.text();
            
            // Gerencia tamanho do cache
            this.manageCacheSize();
            
            // Armazena no cache
            this.cache.set(filePath, html);
            
            return html;
        } catch (error) {
            if (error.name === 'AbortError') {
                console.log('Request cancelado');
                return null;
            }
            console.error(`Erro ao carregar arquivo HTML: ${filePath}`, error);
            throw error;
        }
    }

    // Carrega uma página específica com proteção contra navegações simultâneas
    async loadPage(pageId) {
        // Previne navegações simultâneas
        if (this.isLoading) {
            console.log('Navegação em andamento, ignorando...');
            return;
        }

        if (!this.pages[pageId]) {
            console.warn(`Página '${pageId}' não encontrada. Carregando página inicial.`);
            pageId = 'home';
        }

        // Se já está na página, não faz nada
        /*if (this.currentPage === pageId) {
            return;
        }*/

        this.isLoading = true;

        try {
            // Mostra indicador de carregamento
            this.showLoading();

            // Remove event listeners anteriores
            this.removeEventListeners();

            // Carrega conteúdo HTML do arquivo
            const pageInfo = this.pages[pageId];
            const htmlContent = await this.loadHTMLFile(pageInfo.htmlPath);
            
            // Se request foi cancelado, não continua
            if (htmlContent === null) {
                return;
            }
            
            // Atualiza o layout
            window.layoutTemplate.updateContent(htmlContent, pageId);
            
            // Atualiza título da página
            document.title = pageInfo.title;
            
            // Atualiza URL sem recarregar
            if (pageId !== 'home') {
                window.history.pushState({page: pageId}, '', `#${pageId}`);
            } else {
                window.history.pushState({page: pageId}, '', window.location.pathname);
            }

            this.currentPage = pageId;

            // Aguarda um frame antes de inicializar scripts
            await new Promise(resolve => requestAnimationFrame(resolve));

            // Reinicializa scripts específicos da página
            this.initPageScripts();
			
			window.scrollTo(0, 0);

        } catch (error) {
            console.error('Erro ao carregar página:', error);
            this.showError(error.message);
        } finally {
            this.isLoading = false;
        }
    }

    // Mostra indicador de carregamento
    showLoading() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = this.loadingIndicator;
        }
    }

    // Mostra mensagem de erro
    showError(errorMessage = 'Erro desconhecido') {
        const errorContent = `
            <div class="error-container" style="text-align: center; padding: 50px;">
                <h2 style="color: #ef4444;">❌ Erro ao Carregar Página</h2>
                <p>Ocorreu um erro ao carregar o conteúdo:</p>
                <p style="background: #fee2e2; color: #dc2626; padding: 10px; border-radius: 8px; margin: 20px 0;">
                    ${errorMessage}
                </p>
                <button onclick="window.pageLoader.loadPage('home')" class="btn btn-primary" style="
                    background: #3b82f6; 
                    color: white; 
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 8px; 
                    cursor: pointer;
                    font-size: 16px;
                ">
                    🏠 Voltar ao Início
                </button>
                <button onclick="window.pageLoader.loadPage('${this.currentPage}')" class="btn btn-secondary" style="
                    background: #6b7280; 
                    color: white; 
                    padding: 10px 20px; 
                    border: none; 
                    border-radius: 8px; 
                    cursor: pointer;
                    font-size: 16px;
                    margin-left: 10px;
                ">
                    🔄 Tentar Novamente
                </button>
            </div>
        `;
        
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.innerHTML = errorContent;
        }
    }

    // Remove todos os event listeners registrados
    removeEventListeners() {
        this.eventListeners.forEach((listener, element) => {
            if (element && listener) {
                element.removeEventListener(listener.type, listener.handler);
            }
        });
        this.eventListeners.clear();

        // Limpa timeout de busca
        if (this.searchTimeout) {
            clearTimeout(this.searchTimeout);
            this.searchTimeout = null;
        }
    }

    // Adiciona event listener com rastreamento
    addEventListenerTracked(element, type, handler) {
        if (element) {
            element.addEventListener(type, handler);
            this.eventListeners.set(element, { type, handler });
        }
    }

    // Inicializa scripts específicos da página
    initPageScripts() {
        // Reinicializa busca com debounce
        const searchInput = document.getElementById('search-input');
        if (searchInput) {
            this.initSearchOptimized(searchInput);
        }

        // Reinicializa animações
        this.initAnimations();

        // Reinicializa links internos
        this.initInternalLinks();

        // Reinicializa recursos específicos da página
        this.initPageSpecificFeatures();
    }

    // Inicializa funcionalidade de busca otimizada com debounce
    initSearchOptimized(searchInput) {
        const searchHandler = (e) => {
            // Limpa timeout anterior
            if (this.searchTimeout) {
                clearTimeout(this.searchTimeout);
            }

            // Debounce de 300ms
            this.searchTimeout = setTimeout(() => {
                const searchTerm = e.target.value.toLowerCase();
                this.performSearch(searchTerm);
            }, 300);
        };

        this.addEventListenerTracked(searchInput, 'input', searchHandler);
    }

    // Executa busca de forma otimizada
    performSearch(searchTerm) {
        // Usa requestAnimationFrame para não bloquear UI
        requestAnimationFrame(() => {
            const contentElements = document.querySelectorAll('.main-content h1, .main-content h2, .main-content h3, .main-content p, .main-content li');
            
            // Processa em lotes para evitar travamento
            const batchSize = 50;
            let index = 0;

            const processBatch = () => {
                const endIndex = Math.min(index + batchSize, contentElements.length);
                
                for (let i = index; i < endIndex; i++) {
                    const element = contentElements[i];
                    const text = element.textContent.toLowerCase();
                    const parent = element.closest('section, div, article') || element.parentElement;
                    
                    if (text.includes(searchTerm) || searchTerm === '') {
                        if (parent) parent.style.display = '';
                        element.style.backgroundColor = searchTerm ? '#fff3cd' : '';
                    } else {
                        if (searchTerm && parent) {
                            parent.style.display = 'none';
                        }
                    }
                }

                index = endIndex;

                // Se ainda há elementos para processar, agenda próximo lote
                if (index < contentElements.length) {
                    requestAnimationFrame(processBatch);
                }
            };

            processBatch();
        });
    }

    // Inicializa links internos para navegação SPA
    initInternalLinks() {
        const internalLinks = document.querySelectorAll('a[href^="#"], a[data-page]');
        
        internalLinks.forEach(link => {
            const linkHandler = (e) => {
                e.preventDefault();
                const pageId = link.getAttribute('data-page') || link.getAttribute('href').slice(1);
                if (pageId && this.pages[pageId]) {
                    this.loadPage(pageId);
                }
            };

            this.addEventListenerTracked(link, 'click', linkHandler);
        });
    }

    // Inicializa animações
    initAnimations() {
        const mainContent = document.querySelector('.main-content');
        if (mainContent) {
            mainContent.classList.remove('fade-in');
            // Usa requestAnimationFrame para animação suave
            requestAnimationFrame(() => {
                mainContent.classList.add('fade-in');
            });
        }
    }

    // Inicializa recursos específicos da página
    initPageSpecificFeatures() {
        switch(this.currentPage) {
            case 'levantamentos':
                this.initLevantamentosFeatures();
                break;
            case 'conectividade':
                this.initConectividadeFeatures();
                break;
            case 'comunicados-nit':
                this.initComunicadosFeatures();
                break;
        }
    }
	
	// Função para carregar e exibir datas de atualização
	async loadUpdateDates() {
		try {
			const response = await fetch('https://script.googleusercontent.com/macros/echo?user_content_key=AehSKLiqN3CMukIdMAdaFnJERStgOvPMJSx-BT0LeB_WSfNZAjWVlzMksXqFNA73IM8Y_e1f9HjerQ5ozbLb4k9hUiWEwyH09ztghtnYUoyQWSYmSlw4pRCDvMzIqY_aM1J9BszCLZxNCFRq2yutC5e75hCsTxuOBEmoj7o3jpa0W6Be7nzN-RtvzMRheh92pfnRLrpe6EnX-_hABKds94P1p7oY4_L1oLkrlas8EgFgmIazBdax1lb5mm-DLA00Lynl6GJJoiWF7QFd4aJBCvWiHQbOMUj6N1SV3Xc4PuRX&lib=MGqs4kGrWEmw2oa0v22DgoDThdS_WAule');
			
			if (!response.ok) {
				throw new Error('Erro ao carregar dados');
			}
			
			const data = await response.json();
			
			// Processa cada escola
			const updateElements = document.querySelectorAll('.update-date');
			
			updateElements.forEach(element => {
				const escolaNome = element.getAttribute('data-escola');
				const dateText = element.querySelector('.date-text');
				
				// Procura a escola nos dados retornados
				const escolaData = data.find(item => item[1] === escolaNome);
				
				if (escolaData && escolaData[0]) {
					const updateDate = new Date(escolaData[0]);
					const updateNoTime = new Date(updateDate.getFullYear(), updateDate.getMonth(), updateDate.getDate());
					
					const today = new Date();
					const todayNoTime = new Date(today.getFullYear(), today.getMonth(), today.getDate());
					
					const diffTime = Math.abs(todayNoTime - updateNoTime);
					const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
					
					// Formata a data para exibição
					const formattedDate = updateNoTime.toLocaleDateString('pt-BR');
					
					// Define a cor baseada nos dias
					let color = '';
					let status = '';
					
					if (diffDays <= 15) {
						color = '#22c55e'; // Verde
						status = '✅';
					} else if (diffDays <= 30) {
						color = '#f59e0b'; // Amarelo
						status = '⚠️';
					} else {
						color = '#ef4444'; // Vermelho
						status = '🔴';
					}
					
					dateText.innerHTML = `${status} ${formattedDate} (${diffDays} dias)`;
					dateText.style.color = color;
					
				} else {
					dateText.innerHTML = '❓ Sem dados';
					dateText.style.color = '#6b7280';
				}
			});
			
		} catch (error) {
			console.error('Erro ao carregar datas de atualização:', error);
			
			// Em caso de erro, mostra mensagem padrão
			const dateTexts = document.querySelectorAll('.date-text');
			dateTexts.forEach(dateText => {
				dateText.innerHTML = '❌ Erro ao carregar';
				dateText.style.color = '#ef4444';
			});
		}
	}

    // Recursos específicos otimizados
    initLevantamentosFeatures() {
        console.log('Inicializando recursos da página de levantamentos');
		this.loadUpdateDates();
    }

    initConectividadeFeatures() {
        console.log('Inicializando recursos da página de conectividade');
    }

    initComunicadosFeatures() {
        console.log('Inicializando recursos da página de comunicados');
    }

    // Limpa cache e recursos
    cleanup() {
        this.removeEventListeners();
        this.cache.clear();
        if (this.abortController) {
            this.abortController.abort();
        }
    }

    // Métodos utilitários
    clearCache() {
        this.cache.clear();
        console.log('Cache de páginas limpo');
    }

    getCurrentPage() {
        return this.currentPage;
    }

    getRegisteredPages() {
        return Object.keys(this.pages);
    }

    getPageInfo(pageId) {
        return this.pages[pageId] || null;
    }

    // Pré-carrega uma página de forma otimizada
    async preloadPage(pageId) {
        if (this.pages[pageId] && !this.cache.has(this.pages[pageId].htmlPath)) {
            try {
                await this.loadHTMLFile(this.pages[pageId].htmlPath);
                console.log(`Página '${pageId}' pré-carregada com sucesso`);
            } catch (error) {
                console.warn(`Erro ao pré-carregar página '${pageId}':`, error);
            }
        }
    }
}

// CSS otimizado para animações
const loadingCSS = `
    @keyframes spin {
        0% { transform: rotate(0deg); }
        100% { transform: rotate(360deg); }
    }
    
    .btn:hover {
        opacity: 0.9;
        transform: translateY(-1px);
    }
    
    .btn {
        transition: all 0.2s ease;
        will-change: transform;
    }
    
    .fade-in {
        animation: fadeIn 0.3s ease-out;
        will-change: opacity, transform;
    }
    
    .main-content {
        contain: layout style paint;
    }
`;

// Adiciona CSS ao documento de forma otimizada
if (!document.getElementById('page-loader-styles')) {
    const style = document.createElement('style');
    style.id = 'page-loader-styles';
    style.textContent = loadingCSS;
    document.head.appendChild(style);
}

// Instância global do carregador
window.pageLoader = new PageLoader();

// Cleanup ao sair da página
window.addEventListener('beforeunload', () => {
    if (window.pageLoader) {
        window.pageLoader.cleanup();
    }
});

