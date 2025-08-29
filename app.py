from flask import Flask, jsonify, request, render_template
from flask_sqlalchemy import SQLAlchemy

app = Flask(__name__)

# --- CONFIGURAÇÃO DO BANCO DE DADOS ---
app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///database.db'
app.config['SQLALCHEMY_TRACK_MODIFICATIONS'] = False
db = SQLAlchemy(app)

# --- MODELS ---
class User(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    username = db.Column(db.String(80), unique=True, nullable=False)
    email = db.Column(db.String(120), unique=True, nullable=False)
    links = db.relationship('Link', backref='owner', lazy=True, cascade="all, delete-orphan")

class Link(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    title = db.Column(db.String(100), nullable=False)
    url = db.Column(db.String(255), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('user.id'), nullable=False)

# --- ROTA PRINCIPAL ---
@app.route('/')
def home():
    return render_template('dashboard.html')

@app.route('/dashboard')
def dashboard():
    return render_template('dashboard.html')

# --- ROTAS DA API ---

# [GET] Endpoint para buscar todos os links de um usuário
@app.route('/api/links', methods=['GET'])
def get_links():
    # Por enquanto, vamos usar nosso usuário de teste fixo
    user = User.query.filter_by(username='usuario_teste').first()
    if not user:
        return jsonify({'message': 'Usuário não encontrado'}), 404
    
    links_list = [{"id": link.id, "title": link.title, "url": link.url} for link in user.links]
    
    return jsonify(links_list)

# [POST] Endpoint para adicionar um novo link
@app.route('/api/links', methods=['POST'])
def add_link():
    data = request.get_json()
    if not data or not 'title' in data or not 'url' in data:
        return jsonify({'message': 'Título e URL são obrigatórios'}), 400

    user = User.query.filter_by(username='usuario_teste').first()
    if not user:
        return jsonify({'message': 'Usuário não encontrado'}), 404

    new_link = Link(title=data['title'], url=data['url'], owner=user)
    db.session.add(new_link)
    db.session.commit()

    return jsonify({'id': new_link.id, 'title': new_link.title, 'url': new_link.url}), 201

# [DELETE] Endpoint para deletar um link
@app.route('/api/links/<int:link_id>', methods=['DELETE'])
def delete_link(link_id):
    link = Link.query.get(link_id)
    if not link:
        return jsonify({'message': 'Link não encontrado'}), 404
    
    # Futuramente, vamos adicionar uma verificação para ver se o link pertence ao usuário logado
    
    db.session.delete(link)
    db.session.commit()

    return jsonify({'message': 'Link excluído com sucesso'}), 200


if __name__ == '__main__':
    with app.app_context():
        # Criar as tabelas se não existirem
        db.create_all()
        
        # Criar usuário de teste se não existir
        if not User.query.filter_by(username='usuario_teste').first():
            test_user = User(username='usuario_teste', email='teste@exemplo.com')
            db.session.add(test_user)
            db.session.commit()
            print("Usuário de teste criado!")
        
        print("Banco de dados inicializado!")
    
    app.run(debug=True, host='0.0.0.0', port=5000)