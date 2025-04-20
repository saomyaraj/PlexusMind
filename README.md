# AI-Powered Personal Knowledge Graph

An intelligent note-taking application that automatically discovers and visualizes connections between your notes using advanced NLP techniques.

## Features

- 📝 Rich text note-taking with Markdown support
- 🧠 Automatic entity recognition and relationship extraction
- 🔍 Semantic search and similarity-based note connections
- 📊 Interactive knowledge graph visualization
- 🏷️ Smart auto-tagging and organization
- 🔗 Discover hidden connections between topics

## Tech Stack

- **Frontend**: React + Vite, D3.js for visualization
- **Backend**: Node.js/Express
- **Database**: MongoDB
- **NLP Service**: Python (spaCy, Transformers)

## Prerequisites

- Node.js >= 18.0.0
- Python >= 3.8
- MongoDB
- Git

## Setup Instructions

1. Clone the repository:

   ```bash
   git clone <https://github.com/saomyaraj/PlexusMind.git>
   cd PlexusMind
   ```

2. Install backend dependencies:

   ```bash
   cd backend
   npm install
   ```

3. Install Python NLP service dependencies:

   ```bash
   cd services
   python -m pip install -r requirements.txt
   python -m spacy download en_core_web_lg
   ```

4. Install frontend dependencies:

   ```bash
   cd frontend
   npm install
   ```

5. Set up MongoDB:
   - Make sure MongoDB is running locally
   - The default connection URL is: mongodb://localhost:27017/knowledge_graph

6. Configure environment variables:
   - Copy `.env.example` to `.env` in both frontend and backend directories
   - Adjust the values as needed

## Running the Application

1. Start all services (in development mode):

   ```bash
   # In backend directory
   npm run dev:all
   ```

2. In a separate terminal, start the frontend:

   ```bash
   # In frontend directory
   npm run dev
   ```

3. Access the application:
   - Frontend: <http://localhost:5173>
   - Backend API: <http://localhost:3000>
   - NLP Service: <http://localhost:5000>

## Development

- Frontend hot-reloading is enabled
- Backend uses nodemon for auto-restart
- NLP service will reload on code changes

## API Endpoints

### Notes

- `POST /api/notes` - Create a new note
- `GET /api/notes` - Get all notes
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Graph

- `GET /api/graph/data` - Get graph visualization data
- `GET /api/graph/analyze` - Get graph analysis and clusters
- `GET /api/graph/related/:noteId` - Get related notes
- `GET /api/graph/path/:sourceId/:targetId` - Find path between notes

### Links

- `POST /api/links/manual` - Create a manual link
- `GET /api/links/note/:noteId` - Get links for a note
- `PUT /api/links/:linkId` - Update link metadata
- `DELETE /api/links/:linkId` - Delete a link

## Contributing

1. Fork the repository
2. Create your feature branch (`git checkout -b feature/AmazingFeature`)
3. Commit your changes (`git commit -m 'Add some AmazingFeature'`)
4. Push to the branch (`git push origin feature/AmazingFeature`)
5. Open a Pull Request

## License

MIT License - see the [LICENSE](LICENSE) file for details
