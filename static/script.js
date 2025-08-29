class LinkManager {
    constructor() {
        this.links = [];
        this.isLoading = false;
        this.init();
    }

    init() {
        this.bindEvents();
        this.loadLinks();
        this.updateStats();
    }

    bindEvents() {
        const form = document.getElementById('add-link-form');
        if (form) {
            form.addEventListener('submit', (e) => this.handleAddLink(e));
        }
    }

    async loadLinks() {
        try {
            this.showLoading();
            const response = await fetch('/api/links');
            
            if (!response.ok) {
                throw new Error(`Erro HTTP! status: ${response.status}`);
            }
            
            this.links = await response.json();
            this.renderLinks();
            this.updateStats();
        } catch (error) {
            console.error('Erro ao carregar links:', error);
            this.showNotification('Erro ao carregar os links. Tente novamente.', 'error');
            this.showEmptyState('Erro ao carregar os links');
        } finally {
            this.hideLoading();
        }
    }

    async handleAddLink(event) {
        event.preventDefault();
        
        const titleInput = document.getElementById('title');
        const urlInput = document.getElementById('url');
        
        const title = titleInput.value.trim();
        const url = urlInput.value.trim();
        
        if (!title || !url) {
            this.showNotification('Por favor, preencha todos os campos', 'error');
            return;
        }

        if (!this.isValidUrl(url)) {
            this.showNotification('Por favor, insira uma URL válida (deve começar com http:// ou https://)', 'error');
            return;
        }

        try {
            const response = await fetch('/api/links', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ title, url })
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
            }

            const newLink = await response.json();
            this.links.push(newLink);
            this.renderLinks();
            this.updateStats();
            
            // Limpar formulário
            titleInput.value = '';
            urlInput.value = '';
            
            this.showNotification('Link adicionado com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao adicionar link:', error);
            this.showNotification(error.message || 'Erro ao adicionar o link. Tente novamente.', 'error');
        }
    }

    async deleteLink(linkId) {
        if (!confirm('Tem certeza que deseja excluir este link?')) {
            return;
        }

        try {
            const response = await fetch(`/api/links/${linkId}`, {
                method: 'DELETE'
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.message || `Erro HTTP! status: ${response.status}`);
            }

            this.links = this.links.filter(link => link.id !== linkId);
            this.renderLinks();
            this.updateStats();
            this.showNotification('Link excluído com sucesso!', 'success');
        } catch (error) {
            console.error('Erro ao excluir link:', error);
            this.showNotification(error.message || 'Erro ao excluir o link. Tente novamente.', 'error');
        }
    }

    renderLinks() {
        const linksList = document.getElementById('links-list');
        
        if (!linksList) return;

        if (this.links.length === 0) {
            this.showEmptyState();
            return;
        }

        linksList.innerHTML = this.links.map((link, index) => `
            <div class="link-item fade-in" style="animation-delay: ${index * 0.1}s">
                <div class="link-content">
                    <div class="link-title">${this.escapeHtml(link.title)}</div>
                    <a href="${this.escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-url">
                        ${this.truncateUrl(link.url)}
                    </a>
                </div>
                <div class="link-actions">
                    <button class="btn-visit" onclick="window.open('${this.escapeHtml(link.url)}', '_blank', 'noopener,noreferrer')" title="Abrir este link em uma nova aba">
                        Visitar
                    </button>
                    <button class="btn-delete" onclick="linkManager.deleteLink(${link.id})" title="Excluir este link permanentemente">
                        Excluir
                    </button>
                </div>
            </div>
        `).join('');
    }

    showLoading() {
        const linksList = document.getElementById('links-list');
        if (linksList) {
            linksList.innerHTML = '<div class="loading">Carregando links...</div>';
        }
        this.isLoading = true;
    }

    hideLoading() {
        this.isLoading = false;
    }

    showEmptyState(message = null) {
        const linksList = document.getElementById('links-list');
        if (linksList) {
            linksList.innerHTML = `
                <div class="empty-state">
                    <h3>${message || 'Nenhum link encontrado'}</h3>
                    <p>${message ? 'Verifique sua conexão e tente novamente.' : 'Adicione seu primeiro link usando o formulário acima!'}</p>
                </div>
            `;
        }
    }

    updateStats() {
        const totalLinksElement = document.getElementById('total-links');
        if (totalLinksElement) {
            totalLinksElement.textContent = this.links.length;
        }

        // Atualizar outras estatísticas se necessário
        const domainsCount = new Set(this.links.map(link => {
            try {
                return new URL(link.url).hostname;
            } catch {
                return 'unknown';
            }
        })).size;

        const totalDomainsElement = document.getElementById('total-domains');
        if (totalDomainsElement) {
            totalDomainsElement.textContent = domainsCount;
        }
    }

    showNotification(message, type = 'success') {
        // Remove notificação existente se houver
        const existingNotification = document.querySelector('.notification');
        if (existingNotification) {
            existingNotification.remove();
        }

        const notification = document.createElement('div');
        notification.className = `notification ${type}`;
        notification.textContent = message;
        
        document.body.appendChild(notification);

        // Remove a notificação após 4 segundos
        setTimeout(() => {
            if (notification.parentNode) {
                notification.remove();
            }
        }, 4000);
    }

    isValidUrl(string) {
        try {
            new URL(string);
            return true;
        } catch (_) {
            return false;
        }
    }

    escapeHtml(text) {
        const div = document.createElement('div');
        div.textContent = text;
        return div.innerHTML;
    }

    truncateUrl(url, maxLength = 50) {
        if (url.length <= maxLength) return url;
        return url.substring(0, maxLength) + '...';
    }

    // Método para buscar links
    searchLinks(query) {
        const filtered = this.links.filter(link => 
            link.title.toLowerCase().includes(query.toLowerCase()) ||
            link.url.toLowerCase().includes(query.toLowerCase())
        );
        
        const linksList = document.getElementById('links-list');
        if (linksList) {
            if (filtered.length === 0) {
                linksList.innerHTML = `
                    <div class="empty-state">
                        <h3>Nenhum resultado encontrado</h3>
                        <p>Tente usar termos diferentes na busca.</p>
                    </div>
                `;
            } else {
                linksList.innerHTML = filtered.map((link, index) => `
                    <div class="link-item fade-in" style="animation-delay: ${index * 0.1}s">
                        <div class="link-content">
                            <div class="link-title">${this.escapeHtml(link.title)}</div>
                            <a href="${this.escapeHtml(link.url)}" target="_blank" rel="noopener noreferrer" class="link-url">
                                ${this.truncateUrl(link.url)}
                            </a>
                        </div>
                        <div class="link-actions">
                            <button class="btn-visit" onclick="window.open('${this.escapeHtml(link.url)}', '_blank', 'noopener,noreferrer')" title="Abrir este link em uma nova aba">
                                Visitar
                            </button>
                            <button class="btn-delete" onclick="linkManager.deleteLink(${link.id})" title="Excluir este link permanentemente">
                                Excluir
                            </button>
                        </div>
                    </div>
                `).join('');
            }
        }
    }
}

// Instanciar o gerenciador quando a página carregar
let linkManager;

document.addEventListener('DOMContentLoaded', () => {
    linkManager = new LinkManager();
    
    // Adicionar funcionalidade de busca se o campo existir
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        let searchTimeout;
        searchInput.addEventListener('input', (e) => {
            clearTimeout(searchTimeout);
            searchTimeout = setTimeout(() => {
                if (e.target.value.trim() === '') {
                    linkManager.renderLinks();
                } else {
                    linkManager.searchLinks(e.target.value);
                }
            }, 300);
        });
    }
});

// Funções auxiliares globais
function refreshLinks() {
    if (linkManager) {
        linkManager.loadLinks();
    }
}

function clearSearch() {
    const searchInput = document.getElementById('search-input');
    if (searchInput) {
        searchInput.value = '';
        linkManager.renderLinks();
    }
}
