from flask import Flask, request, jsonify
from tensorflow import keras
from keras.models import load_model
import os
import cv2
import numpy as np
import matplotlib.image as mpimg
from sklearn.preprocessing import LabelBinarizer
from flask_cors import CORS

default_image_size = tuple((128,128))
labels=[
  "Tomato___Late_blight",
  "Tomato___healthy",
  "Tomato___Early_blight",
  "Tomato___Septoria_leaf_spot",
  "Tomato___Tomato_Yellow_Leaf_Curl_Virus",
  "Tomato___Bacterial_spot",
  "Tomato___Target_Spot",
  "Tomato___Tomato_mosaic_virus",
  "Tomato___Leaf_Mold"
  "Tomato___Spider_mites",
]
labelencoder = LabelBinarizer()
label=labelencoder.fit_transform([0,1,2,3,4,5,6,7,8,9])

app = Flask(__name__)
#app = Flask(__name__, static_folder='../static', static_url_path='/')
CORS(app)

model = load_model('model.h5')

def img_to_np(DIR):
  cv_img=mpimg.imread(DIR,0)
  cv_img=cv2.resize(cv_img,default_image_size)
  img = np.uint8(cv_img)

  return img

@app.route("/")
def index():
  return app.send_static_file('index.html')

@app.route('/predict', methods=['POST'])
def predict():
  if 'file' not in request.files:
    return jsonify({'error': 'No file part in the request'}), 400

  file = request.files['file']
  if file.filename == '':
    return jsonify({'error': 'No selected file'}), 400

  if file:
    # Check if the uploaded file is an image
    if not file.mimetype.startswith('image/'):
      return jsonify({'error': 'Uploaded file is not an image'}), 400

    # Save the file to a temporary location
    upload_dir = 'uploads'
    if not os.path.exists(upload_dir):
        os.makedirs(upload_dir)
    file_path = os.path.join(upload_dir, file.filename)
    file.save(file_path)

    # Preprocess the image
    img = img_to_np(file_path)
    img = img.reshape(1,128,128,3)

    # Make prediction
    predictions = model.predict(img)
    confidence = float(np.max(predictions))
    predicted_class = labels[labelencoder.inverse_transform(predictions)[0]]

    # Clean up the saved file
    os.remove(file_path)

    return jsonify({'predicted_class': predicted_class, 'accuracy': confidence})