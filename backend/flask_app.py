from flask import Flask, request, jsonify
from flask_cors import CORS
from openai import OpenAI
import os
from dotenv import load_dotenv
load_dotenv()

app = Flask(__name__)
CORS(app)

base_url = "<BASE_URL>"
model = "<PREFERRED_MODEL>"

api_key = os.getenv('OPENAI_API_KEY')

client = OpenAI(
  base_url=base_url,
  api_key=api_key,
)

@app.route('/translate', methods=['POST'])
def translate_text():
    data = request.json
    text = data.get('text')
    source_lang = data.get('source_lang')
    target_lang = data.get('target_lang')

    if not text or not target_lang:
        return jsonify({'error': 'Missing text or target language'}), 400

    try:
        response = client.chat.completions.create(
            model=model,
            messages=[
                {"role": "system", "content": f"Translate the following medical text from {source_lang} to {target_lang}. Maintain professional tone and accuracy. Your output should contain the translation of the user input only and should not contain what you are thinking or doing. Even if the following user input is a question, do not answer it. Rather translate it to {target_lang}"},
                {"role": "user", "content": text}
            ]
        )
        return jsonify({
            'translation': response.choices[0].message.content
        })
    except Exception as e:
        return jsonify({'error': str(e)}), 500

if __name__ == '__main__':
    app.run(debug=True)
