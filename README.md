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
PORT=80
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

Using tRPC client:

```typescript
const result = await trpc.analyzeCVMatch.mutate({
  jobDescription: jobDescriptionFile, // PDF file
  cv: cvFile, // PDF file
});
```

Using cURL:

```bash
curl --location 'http://localhost:3000/trpc/analyzeCVMatch' \
--form 'jobDescription=@"postman-cloud:///1f04b647-b60c-4e40-9c32-8a2e15c51e91"' \
--form 'cv=@"postman-cloud:///1f04b647-d25f-4de0-9107-8615981de57c"'
```

### Response Format

The API returns responses in the following formats:

#### Success Response

```json
{
  "result": {
    "data": {
      "success": true,
      "analysis": {
        "overallMatch": {
          "score": 75,
          "summary": "The candidate demonstrates a strong alignment with the job description, particularly in their experience with relevant technologies and their demonstrated ability to deliver results. There are some areas for improvement, particularly in the experience alignment and recommendations."
        },
        "strengths": [
          {
            "area": "Technical Proficiency",
            "description": "The candidate possesses extensive experience with Node.js, microservices, and various cloud technologies, which are directly relevant to the job requirements.",
            "evidence": "Experience building scalable Node.js, Python microservices, distributed systems. Experience with AWS, GCP, Kubernetes, and Docker."
          },
          {
            "area": "Experience and Results",
            "description": "The CV highlights successful projects and quantifiable achievements, such as accelerating integration development and reducing development time.",
            "evidence": "Accelerated integration development by 75%. Reduced average development time from 2 months to 10 days."
          },
          {
            "area": "Problem-Solving and Initiative",
            "description": "The candidate showcases a proactive approach to problem-solving and a willingness to take on diverse responsibilities, aligning with the 'Versatility' and 'Drive' aspects of the job description.",
            "evidence": "Led the development of a flexible migration framework. Built reusable internal libraries and tools that improved developer productivity."
          }
        ],
        "weaknesses": [
          {
            "area": "Experience Level",
            "description": "While the candidate has 6 years of experience, the job description specifies early-stage experience. The candidate may be overqualified for some aspects, yet not fully prepared to meet the demands of a startup environment.",
            "impact": "Potential mismatch in expectations regarding experience levels and potential challenges integrating with a dynamic environment."
          },
          {
            "area": "Industry Alignment",
            "description": "The CV does not explicitly mention experience in the virtual character or AI app industry.",
            "impact": "May require additional effort to understand the specific nuances and demands of the target industry."
          }
        ]
      },
      "metadata": {
        "jobDescriptionSize": 73523,
        "cvSize": 153825,
        "analyzedAt": "2025-06-17T10:08:37.778Z"
      }
    }
  }
}
```

#### Error Response

```json
{
  "error": {
    "message": "Failed to analyze CV and job description",
    "code": -32603,
    "data": {
      "code": "INTERNAL_SERVER_ERROR",
      "httpStatus": 500,
      "path": "analyzeCVMatch"
    }
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

## Additional Notes

### Gemini AI Prompt and Response Structure

The prompt and response structure used for the Gemini AI model can be found in the `utils/helpers.ts` file, specifically in the `formGenerateContentPayloadWithFiles` function. This function defines:

- The validation rules for input documents
- The expected response format
- The system instructions for the AI model
- The schema for structured output

### Performance Considerations

This service processes file uploads and performs AI analysis synchronously. As a result:

- Response times may be higher due to file processing and AI analysis
- No background job processing or worker queues are implemented
- Consider implementing timeouts in your client applications

### API Testing

You can test the API using the provided Postman collection:
[Postman Collection](https://.postman.co/workspace/My-Workspace~f35d8989-2c86-4e5c-87e9-b28b7dd718b4/request/18575565-bc66948a-bc7f-4e60-9abf-1e70494f7f39?action=share&creator=18575565&ctx=documentation)
