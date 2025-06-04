from flask import Flask, request, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from flask_cors import CORS
from functools import wraps
import os

app = Flask(__name__)
# Configuração do Flask
app.config.update(
    SECRET_KEY='uma-chave-qualquer',
    SESSION_COOKIE_HTTPONLY=True,
    SESSION_COOKIE_SAMESITE='None',
    SESSION_COOKIE_SECURE=True,
)
# permite que o front acesse o back e envie cookies de sessão
CORS(app, supports_credentials=True, origins=[
    "http://localhost:5173",
    "https://project3-2025a-bruno-frontend.onrender.com"
])

# Configuração da conexão com MySQL 
app.config['SQLALCHEMY_DATABASE_URI'] = 'mysql://root:Brunop10%40@localhost/project3'
#os.environ.get('DATABASE_URL').replace('mysql://', 'mysql+pymysql://')

db = SQLAlchemy(app)

# Modelo de Link
class Link(db.Model):
    __tablename__ = 'links'

    id = db.Column(db.Integer, primary_key=True)
    url = db.Column(db.String(500), nullable=False)
    titulo = db.Column(db.String(200), nullable=False)
    data_adicao = db.Column(db.DateTime, server_default=db.func.now())
    confiabilidade = db.Column(db.Float, nullable=True)
    user_email     = db.Column(db.String(120), nullable=False)

    def to_dict(self):
        return {
            'id': self.id,
            'url': self.url,
            'titulo': self.titulo,
            'data_adicao': self.data_adicao.isoformat(),
            'confiabilidade': self.confiabilidade,
            'user_email': self.user_email
        }

# Modelo de Usuário
class User(db.Model):
    __tablename__ = 'users'
    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False)
    senha = db.Column(db.String(255), nullable=False)
    data_criacao = db.Column(db.DateTime, server_default=db.func.now())

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'data_criacao': self.data_criacao.isoformat()
        }


# Dicionário em memória para usuários pré-cadastrados
USERS = {
    'bruno@example.com': '123',
    'user2@example.com': '123',
    'user3@example.com': '123'
}

# Decorator para proteger rotas
def login_required(f):
    @wraps(f)
    def decorated(*args, **kwargs):
        if 'user_email' not in session:
            return jsonify({'erro': 'Autenticação necessária'}), 401
        return f(*args, **kwargs)
    return decorated

# Rota de teste
@app.route('/')
def home():
    return jsonify({'msg': 'Backend do Compartilhamento de Links ativo'}), 200

# Rota de login
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json(force=True)
    email = data.get('email')
    senha = data.get('senha')
    #if not email or not senha or USERS.get(email) != senha:
    #    return jsonify({'erro': 'Credenciais inválidas'}), 401
    if not email or not senha:
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400

    usuario = User.query.filter_by(email=email).first()
    if not usuario or usuario.senha != senha:  # Atualizar para hash no futuro
        return jsonify({'erro': 'Credenciais inválidas'}), 401

    session['user_email'] = email
    return jsonify({'msg': 'Login realizado com sucesso'})

@app.route('/login', methods=['GET'])
def login_placeholder():
    return '', 200

# Rota de registro
@app.route('/register', methods=['POST'])
def register_user():
    data = request.get_json(force=True)
    email = data.get('email')
    senha = data.get('senha')
    if not email or not senha:
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'erro': 'Email já cadastrado'}), 409

    novo_usuario = User(email=email, senha=senha)  # Senha deve ser hasheada em produção
    db.session.add(novo_usuario)
    db.session.commit()
    return jsonify({'msg': 'Usuário registrado com sucesso'}), 201

# CRUD de Links
@app.route('/links', methods=['GET'])
@login_required
def list_links():
    links = Link.query.order_by(Link.data_adicao.desc()).all()
    return jsonify([l.to_dict() for l in links])

@app.route('/links', methods=['POST'])
@login_required
def create_link():
    data = request.get_json(force=True)
    url = data.get('url')
    titulo = data.get('titulo')
    user_email=session['user_email']
    if not url or not titulo:
        return jsonify({'erro': 'URL e título são obrigatórios'}), 400

    novo = Link(url=url, titulo=titulo, user_email=user_email)
    db.session.add(novo)
    db.session.commit()
    return jsonify({'id': novo.id}), 201

@app.route('/links/<int:id>', methods=['PUT'])
@login_required
def update_link(id):
    link = Link.query.get_or_404(id)
    data = request.get_json(force=True)
    link.url = data.get('url', link.url)
    link.titulo = data.get('titulo', link.titulo)
    db.session.commit()
    return jsonify({'msg': 'Link atualizado com sucesso'})

@app.route('/links/<int:id>', methods=['DELETE'])
@login_required
def delete_link(id):
    link = Link.query.get_or_404(id)
    db.session.delete(link)
    db.session.commit()
    return jsonify({'msg': 'Link removido com sucesso'})


@app.route('/my-links', methods=['GET'])
@login_required
def list_my_links():
    email = session['user_email']
    links = Link.query.filter_by(user_email=email).order_by(Link.data_adicao.desc()).all()
    return jsonify([l.to_dict() for l in links])

##############################################################################################################
# CRUD de Favoritos
class Favorite(db.Model):
    id = db.Column(db.Integer, primary_key=True)
    user_email = db.Column(db.String(128), nullable=False)
    link_id = db.Column(db.Integer, db.ForeignKey('links.id', ondelete='CASCADE'), nullable=False)

    link = db.relationship('Link', backref=db.backref('favorited_by', cascade='all, delete-orphan'))

    def to_dict(self):
        return self.link.to_dict()

@app.route('/favorites', methods=['GET'])
@login_required
def list_favorites():
    user = session['user_email']
    favs = Favorite.query.filter_by(user_email=user).all()
    
    return jsonify([f.to_dict() for f in favs]), 200

@app.route('/favorites/<int:link_id>', methods=['POST'])
@login_required
def add_favorite(link_id):
    user = session['user_email']
   
    link = Link.query.get(link_id)
    if not link:
        return jsonify({'erro': 'Link não encontrado'}), 404

    existe = Favorite.query.filter_by(user_email=user, link_id=link_id).first()
    if existe:
        return jsonify({'msg': 'Já é favorito'}), 200

    fav = Favorite(user_email=user, link_id=link_id)
    db.session.add(fav)
    db.session.commit()
    return jsonify({'msg': 'Adicionado aos favoritos'}), 201

@app.route('/favorites/<int:link_id>', methods=['DELETE'])
@login_required
def delete_favorite(link_id):
    user = session['user_email']
    fav = Favorite.query.filter_by(user_email=user, link_id=link_id).first()
    if not fav:
        return jsonify({'erro': 'Favorito não encontrado'}), 404

    db.session.delete(fav)
    db.session.commit()
    return jsonify({'msg': 'Removido dos favoritos'}), 200

if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Tabelas criadas com sucesso!")
    from os import environ
    port = int(environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)


