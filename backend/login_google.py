from flask import Blueprint, redirect, url_for, session, jsonify, current_app
from authlib.integrations.flask_client import OAuth
import os

bp_google = Blueprint('bp_google', __name__)
oauth = OAuth()

# Variáveis para armazenar referências passadas pelo app.py
_db = None
_User = None

def config_oauth(app, db, User):
    global _db, _User
    _db = db
    _User = User
    
    # Inicializa o OAuth com a instância do Flask
    oauth.init_app(app)

    # Registra o provedor “google” com descoberta OIDC
    oauth.register(
        name='google',
        client_id=app.config.get('GOOGLE_CLIENT_ID'),
        client_secret=app.config.get('GOOGLE_CLIENT_SECRET'),
        server_metadata_url='https://accounts.google.com/.well-known/openid-configuration',
        client_kwargs={
            'scope': 'openid email profile',
            'prompt': 'select_account'
        }
    )

@bp_google.route('/login/google')
def login_google():
    redirect_uri = os.getenv(
        'GOOGLE_REDIRECT_URI',
        url_for('bp_google.google_callback', _external=True)
    )
    print(">>> Redirect URI:", redirect_uri)
    return oauth.google.authorize_redirect(redirect_uri=redirect_uri)

@bp_google.route('/auth/callback')
def google_callback():
    try:
        token = oauth.google.authorize_access_token()
        print("Token recebido:", token)

        # Obtém informações do usuário via endpoint UserInfo
        user_info = oauth.google.userinfo()
        print("User info:", user_info)

        email = user_info.get('email')
        if not email:
            return jsonify({'erro': 'Não foi possível obter email do Google'}), 400

        # Grava no banco usando as referências passadas via config_oauth
        user = _User.query.filter_by(email=email).first()
        if not user:
            user = _User(email=email, senha='')  # senha vazia => login federado
            _db.session.add(user)
            _db.session.commit()

        session['user_email'] = email

        front_url = current_app.config.get('FRONT_URL', 'http://localhost:5173')
        # Redireciona para a rota de links com parâmetro para o React saber que veio do Google
        return redirect(f"{front_url}/links?google=ok")

    except Exception as e:
        print("Erro no callback do Google:", e)
        return jsonify({'erro': str(e)}), 500
