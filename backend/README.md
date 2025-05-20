# Backend

## Setup

1. Clone the repository:
   ```bash
   git clone
   ```
2. Navigate to the project directory:
   ```bash
   cd <project-directory>
   ```
3. Create a virtual environment:
   ```bash
   python -m venv venv
   ```
4. Activate the virtual environment:
   - On Windows:
     ```bash
     venv\Scripts\activate
     ```
   - On macOS/Linux:
     ```bash
     source venv/bin/activate
     ```
5. Install the required packages:
   ```bash
   pip install -r requirements.txt
   ```
6. Run the flask server:
   ```bash
   flask run
   ```
7. Open your browser and navigate to `http://localhost:5000` to see the application running.

## API Endpoints

- `GET /`: Accesses the home page on production.
- `POST /predict`: Accepts an image file in the request.
  - **Response:** Returns a JSON object with `predicted_class` and `accuracy` fields.
  - **Error:** Returns an error message if the prediction fails.
