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
    query_string = request.query_string
    query_string = query_string.decode('UTF-8')
    e_index = query_string.find('&')
    if(e_index!=-1):
        query_string_every_other = query_string[e_index:]
        url = url+query_string_every_other
    if not url:
        return jsonify({'error': 'URL parameter is required'}), 400
    try:
        headers = {}
        response = requests.get(url,headers=headers,verify=False)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.HTTPError as http_err:
        print('1')
        print (response.status_code)
        print(response.json())
        print (http_err)
        return response.json(), response.status_code
    except Exception as err:
        print('2')
        print (response.status_code)
        print(response.json())
        print (err)
        return response.json(), response.status_code


if __name__ == '__main__':
    open_html()
    app.run()
