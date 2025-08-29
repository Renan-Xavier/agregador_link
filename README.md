# Agregador de Links

Um aplicativo web moderno para organizar e gerenciar seus links favoritos.

## Funcionalidades

- ✨ Interface moderna e responsiva
- 🔍 Busca em tempo real
- 📊 Estatísticas dos links
- 📥 Exportação de dados
- ⌨️ Atalhos do teclado
- 🎨 Design elegante com gradientes
- 📱 Totalmente responsivo

## Como usar

1. **Adicionar links**: Use o formulário para adicionar novos links com título e URL
2. **Buscar**: Digite no campo de busca para filtrar seus links
3. **Visitar**: Clique em "Visitar" para abrir o link em nova aba
4. **Deletar**: Remova links desnecessários
5. **Exportar**: Baixe seus links em formato JSON

## Atalhos do Teclado

- `Ctrl + /`: Focar no campo de busca
- `Ctrl + N`: Focar no campo de título
- `Ctrl + R`: Atualizar lista de links
- `Ctrl + E`: Exportar links
- `Esc`: Limpar busca

## Tecnologias

- **Backend**: Flask + SQLAlchemy
- **Frontend**: HTML5, CSS3, JavaScript ES6
- **Design**: CSS Grid, Flexbox, Gradientes
- **Banco**: SQLite

## Estrutura do Projeto

```
agregador-links/
├── app.py              # Aplicação Flask principal
├── templates/
│   └── dashboard.html  # Interface principal
├── static/
│   ├── style.css      # Estilos modernos
│   └── script.js      # JavaScript interativo
└── instance/
    └── database.db    # Banco SQLite
```

## API Endpoints

- `GET /api/links` - Listar todos os links
- `POST /api/links` - Adicionar novo link
- `DELETE /api/links/<id>` - Deletar link

## Instalação e Execução

```bash
# Clone o repositório
git clone <url-do-repo>
cd agregador-links

# Instale as dependências
pip install flask flask-sqlalchemy

# Execute o aplicativo
python app.py
```

O aplicativo estará disponível em `http://localhost:5000`

## Screenshots

O aplicativo possui:
- Design moderno com gradientes
- Cards elegantes com sombras
- Animações suaves
- Interface responsiva
- Notificações em tempo real
