# Job CV Match Analyzer

A Node.js server that uses AI to analyze how well a CV matches a job description. The server accepts two PDF files (job description and CV) and returns an analysis of the match.

## Features

- tRPC API endpoint for type-safe API calls
- PDF file processing
- AI-powered CV analysis
- Docker support
- TypeScript for type safety

## Prerequisites

- Node.js 18 or higher
- Docker and Docker Compose (for containerized setup)
- Google Cloud Vertex AI credentials (for AI analysis)

## Environment Variables

Create a `.env` file in the root directory with the following variables:

```env
GEMINI_API_URL=your_gemini_api_url
GEMINI_AUTH_TOKEN=your_gemini_auth_token
PORT=3000
```

## Running Locally

1. Install dependencies:

```bash
npm install
```

2. Build the project:

```bash
npm run build
```

3. Start the server:

```bash
npm start
```

For development with hot-reload:

```bash
npm run start:dev
```

## Running with Docker

1. Build and start the container:

```bash
docker compose up --build
```

The server will be available at `http://localhost:3000`

## API Usage

The server exposes a tRPC endpoint at `/trpc` that accepts two PDF files:

- `jobDescription`: The job description PDF
- `cv`: The candidate's CV PDF

### Example Request

```typescript
const result = await trpc.analyzeCVMatch.mutate({
  jobDescription: jobDescriptionFile, // PDF file
  cv: cvFile, // PDF file
});
```

### Response Format

```typescript
{
  success: boolean;
  analysis: {
    // AI analysis results
  }
  metadata: {
    jobDescriptionSize: number;
    cvSize: number;
    analyzedAt: string;
  }
}
```

## Development

- Run tests: `npm test`
- Run tests with coverage: `npm run test:coverage`
- Lint code: `npm run lint`
- Format code: `npm run format`
- Type check: `npm run type-check`

## License

MIT
