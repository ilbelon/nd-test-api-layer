from flask import Flask, request, jsonify
from flask_cors import CORS
import requests
import webbrowser, os

app = Flask(__name__)
CORS(app, origins="*")

# Funzione per aprire la pagina HTML
def open_html():
    webbrowser.open('file://' + os.path.realpath('./dist/index.html'))

@app.route('/webcaller', methods=['GET'])
def run_script():
    response = None
    url = request.args.get('url')
    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400
    try:
        headers = {'X-IBM-Client-Id': '**', 'X-IBM-Client-Secret': '**'}
        response = requests.get(url,headers=headers,verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        return jsonify({'error': f'HTTP error occurred: {http_err}'}), response.status_code
    except Exception as err:
        return jsonify({'error': f'Other error occurred: {err}'}), response.status_code


if __name__ == '__main__':
    open_html()
    app.run()
