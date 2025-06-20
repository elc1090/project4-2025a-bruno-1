from flask import Flask, request, session, jsonify
from flask_sqlalchemy import SQLAlchemy
from sqlalchemy.dialects.mysql import JSON
from flask_cors import CORS
from functools import wraps
from dotenv import load_dotenv
import os
import requests
from bs4 import BeautifulSoup
import json
from werkzeug.security import generate_password_hash, check_password_hash

load_dotenv()  # Isso carrega o .env para os os.environ

app = Flask(__name__)

# carregar para o app.config (necessário para o OAuth)
app.config['GOOGLE_CLIENT_ID'] = os.getenv('GOOGLE_CLIENT_ID')
app.config['GOOGLE_CLIENT_SECRET'] = os.getenv('GOOGLE_CLIENT_SECRET')
app.config['FRONT_URL'] = os.getenv('FRONT_URL')

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

# Usa DATABASE_URL do ambiente (Render, Railway etc). Em dev cai no .env:
DATABASE_URL = os.getenv('DATABASE_URL',
    'mysql://root:Brunop10%40@localhost/project3'
)
# SQLAlchemy + PyMySQL
app.config['SQLALCHEMY_DATABASE_URI'] = DATABASE_URL.replace(
    'mysql://', 'mysql+pymysql://'
)

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
    language = db.Column(db.String(20), nullable=True, default=None)
    tags = db.Column(JSON, nullable=True, default=[])

    def to_dict(self):
         # Normaliza o campo tags para sempre ser lista de strings
        raw_tags = self.tags
        if isinstance(raw_tags, str):
            try:
                tags = json.loads(raw_tags)
            except json.JSONDecodeError:
                tags = []
        elif isinstance(raw_tags, list):
            tags = raw_tags
        else:
            tags = []
        return {
            'id': self.id,
            'url': self.url,
            'titulo': self.titulo,
            'data_adicao': self.data_adicao.isoformat(),
            'confiabilidade': self.confiabilidade,
            'user_email': self.user_email,
            'language': self.language,
            'tags': tags
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

# Rota para verificar se o usuário está logado
@app.route('/me')
def who_am_i():
    if 'user_email' not in session:
        return jsonify({'logged_in': False}), 401
    return jsonify({'logged_in': True, 'email': session['user_email']})

# Rota de login
@app.route('/login', methods=['POST'])
def login_user():
    data = request.get_json(force=True)
    email = data.get('email')
    senha = data.get('senha')
    if not email or not senha:
        return jsonify({'erro': 'Email e senha são obrigatórios'}), 400

    usuario = User.query.filter_by(email=email).first()
    if usuario and check_password_hash(usuario.senha, senha):
        session['user_email'] = usuario.email
        return jsonify({'msg': 'Login bem-sucedido'}), 200

    else:
        return jsonify({'erro': 'Credenciais inválidas'}), 401


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

    hashed = generate_password_hash(senha)
    novo_usuario = User(email=email, senha=hashed)
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
    tags = data.get('tags', [])
    user_email=session['user_email']
    if not url or not titulo:
        return jsonify({'erro': 'URL e título são obrigatórios'}), 400

    novo = Link(url=url, titulo=titulo, user_email=user_email, tags=json.dumps(tags) if tags else None)
    db.session.add(novo)
    db.session.commit()
    return jsonify({'id': novo.id}), 201

@app.route('/links/<int:id>', methods=['GET'])
@login_required
def get_link(id):
    l = Link.query.get_or_404(id)
    return jsonify({
        'id': l.id,
        'url': l.url,
        'titulo': l.titulo,
        'tags': json.loads(l.tags) if l.tags else [],
        'language': l.language,
        'confiabilidade': l.confiabilidade
    }), 200


@app.route('/links/<int:id>', methods=['PUT'])
@login_required
def update_link(id):
    link = Link.query.get_or_404(id)
    data = request.get_json(force=True)
    link.url = data.get('url', link.url)
    link.titulo = data.get('titulo', link.titulo)
    if 'language' in data:
        link.language = data.get('language') or None
    if 'tags' in data:
        link.tags = json.dumps(data.get('tags', [])) if data.get('tags') else None
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

#  login com Google ####################################################################################################################
from login_google import bp_google, config_oauth
config_oauth(app, db, User)
app.register_blueprint(bp_google)
########################################################################################################################################

@app.route('/extract-keywords', methods=['POST'])
def extract_keywords():
    data = request.get_json(force=True)
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL é obrigatória'}), 400

    # 1) Verifica cache no banco
    link_existente = Link.query.get(data.get('id'))
    if link_existente and link_existente.tags is not None:
        # tags já vem como list ou string JSON
        raw = link_existente.tags
        if isinstance(raw, str):
            try:
                raw = json.loads(raw)
            except json.JSONDecodeError:
                raw = []
        if isinstance(raw, list):
            return jsonify({'keywords': raw}), 200

    try:
        # 2) Busca HTML e extrai texto
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        for t in soup(['script', 'style']):
            t.decompose()
        texto = soup.get_text(separator=' ', strip=True)

        # 3) Chama Cortical.io (limita a 5 keywords)
        payload = {"text": texto}
        cortical_resp = requests.post(
            'https://api.cortical.io/nlp/keywords?limit=5',
            json=payload,
            timeout=15
        )
        cortical_resp.raise_for_status()
        result = cortical_resp.json()

        # 4) Extrai só o campo 'word' e salva no banco
        raw_keywords = result.get('keywords', [])
        words = [
            item['word'] for item in raw_keywords
            if isinstance(item, dict) and 'word' in item
        ]

        if link_existente:
            link_existente.tags = words
            db.session.commit()

        # 5) Retorna apenas o array de strings
        return jsonify({'keywords': words}), 200

    except requests.HTTPError as http_err:
        status = getattr(http_err.response, 'status_code', 500)
        return jsonify({'error': f'Falha HTTP: {http_err}'}), status
    except Exception as e:
        return jsonify({'error': str(e)}), 500

@app.route('/detect-language', methods=['POST'])
def detect_language():
    data = request.get_json(force=True)
    url = data.get('url')
    if not url:
        return jsonify({'error': 'URL é obrigatória'}), 400

    #  Verifica cache no banco
    link = Link.query.get(data.get('id'))
    if link and link.language is not None:
        return jsonify({'language_code': link.language}), 200

    try:
        # Busca HTML e extrai texto
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
        soup = BeautifulSoup(resp.text, 'html.parser')
        for t in soup(['script', 'style']):
            t.decompose()
        texto = soup.get_text(separator=' ', strip=True)

        # Chama Cortical API de detecção de idioma
        payload = { "text": texto }
        cortical_resp = requests.post(
            'https://api.cortical.io/nlp/language',
            json=payload,
            timeout=15
        )
        cortical_resp.raise_for_status()
        result = cortical_resp.json()

        # Extrai o código de idioma (campo 'language' na resposta)
        lang_code = result.get('language') or 'und'

        # Persiste no banco
        if link:
            link.language = lang_code
        else:
            # opcional: criar novo registro se quiser
            link = Link(url=url, titulo='', user_email=session.get('user_email', ''), language=lang_code)
            db.session.add(link)
        db.session.commit()

        # Retorna o código de idioma
        return jsonify({'language_code': lang_code}), 200

    except requests.HTTPError as http_err:
        status = getattr(http_err.response, 'status_code', 500)
        return jsonify({'error': f'Falha HTTP: {http_err}'}), status

    except Exception as e:
        return jsonify({'error': str(e)}), 500

import logging
from requests.exceptions import HTTPError
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

@app.route('/compare-reliability', methods=['POST'])
@login_required
def compare_reliability():
    data = request.get_json(force=True)
    link_id = data.get('id')
    url     = data.get('url')
    title   = data.get('title')

    if not url or not title:
        return jsonify({'error': 'URL e título são obrigatórios'}), 400

    link = Link.query.get(link_id)

    # 1. Obter o conteúdo da URL
    try:
        resp = requests.get(url, timeout=15)
        resp.raise_for_status()
    except Exception as e:
        logger.error(f"Erro ao buscar {url}: {e}")
        return jsonify({'error': f'Erro ao buscar URL: {str(e)}'}), 500

    # 2. Extrair texto da página
    soup = BeautifulSoup(resp.text, 'html.parser')
    for tag in soup(['script', 'style']):
        tag.decompose()
    snippet = soup.get_text(separator=' ', strip=True)[:10000]

    # 3. Preparar payload
    payload = [
        {"text": title},
        {"text": snippet}
    ]
    cortical_url = 'https://api.cortical.io/nlp/compare'

    # 4. Chamar API de comparação
    try:
        cortical = requests.post(cortical_url, json=payload, timeout=20)

        if cortical.status_code == 422:
            logger.info(f"Cortical 422 para {url}: {cortical.text}")
            if link:
                link.confiabilidade = -1.0
                db.session.commit()
            return jsonify({'confiabilidade': -1}), 200

        cortical.raise_for_status()
        body = cortical.json()
        similarity = body.get('similarity')

        if similarity is None:
            raise ValueError(f"Resposta inesperada da Cortical: {body}")

    except HTTPError as http_err:
        detail = getattr(cortical, 'text', str(http_err))
        if 'Language' in detail and 'not supported' in detail:
            logger.warning(f"Linguagem não suportada para {url}")
            if link:
                link.confiabilidade = -1.0
                db.session.commit()
            return jsonify({'confiabilidade': -1}), 200
        logger.error(f"HTTPError na API Cortical: {detail}")
        return jsonify({'error': 'Erro da API Cortical', 'detail': detail}), 400

    except Exception as e:
        logger.error(f"Erro interno no compare_reliability: {e}")
        return jsonify({'error': 'Erro interno', 'detail': str(e)}), 500

    # 5. Salvar confiabilidade no banco
    if link:
        link.confiabilidade = float(similarity)
        db.session.commit()

    return jsonify({'confiabilidade': similarity}), 200


if __name__ == '__main__':
    with app.app_context():
        db.create_all()
        print("Tabelas criadas com sucesso!")
    from os import environ
    port = int(environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port)
