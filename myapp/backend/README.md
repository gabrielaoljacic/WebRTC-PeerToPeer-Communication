# Metered Python Backend for Video Calling

Flask backend for the WebRTC video chat application.

## Quick Start

1. Install dependencies:
```bash
cd backend
python -m venv venv
source venv/bin/activate  # Linux/Mac
venv\Scripts\activate     # Windows
pip install -r requirements.txt
```

2. Create `.env` file in `/backend` with:
```
METERED_SECRET_KEY=your_api_key
METERED_DOMAIN=your_domain.metered.live
```

3. Run the server:
```bash
flask run  # if this does not run you may instead try running --> flask --app flaskr run
```
