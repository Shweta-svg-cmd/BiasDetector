# NewsLens: Media Bias Analyzer

NewsLens is a web application that analyzes news articles for bias, generates unbiased versions, and compares coverage across multiple news sources.

## Features

- **Bias Analysis**: Detect political bias, emotional language, and loaded terms in news articles
- **Neutral Version Generation**: Get a neutrally rewritten version of the article
- **Source Comparison**: Compare how different outlets cover the same story
- **Visual Analytics**: Interactive charts and visualizations of analysis results
- **Multiple Input Methods**: Analyze articles via URL or by pasting text

## Technologies Used

- **Frontend**: React, TypeScript, TailwindCSS, Recharts, Shadcn UI
- **Backend**: Node.js, Express
- **Natural Language Processing**: OpenAI API (GPT-4o)
- **News Data**: NewsAPI

## Getting Started

### Prerequisites

- Node.js (v18+)
- npm or yarn
- API Keys for OpenAI and NewsAPI (optional, app works with demo data)

### Environment Variables

Create a `.env` file in the root directory with the following variables:

```
OPENAI_API_KEY=your_openai_api_key
NEWS_API_KEY=your_newsapi_key
```

Note: The application includes fallback demo data if these API keys aren't provided.

### Installation

1. Clone the repository
2. Install dependencies:
   ```
   npm install
   ```
3. Start the development server:
   ```
   npm run dev
   ```

## API Endpoints

- `GET /api/health`: Health check endpoint
- `POST /api/analyze`: Analyze an article (provide URL or text+title)
- `GET /api/articles/:id`: Get article by ID
- `GET /api/articles/:id/related`: Get related articles

## Deployment

This application can be deployed on platforms like Render, Vercel, or Netlify.

## License

This project is open source and available under the [MIT License](LICENSE).