\# Nkorofi AI



A public-facing AI assistant that answers questions about Nkorofi Makgato — his projects, skills, education, and certifications. Embedded on his portfolio as a chat widget.



\*\* Live demo:\*\* https://nkorofi-ai.vercel.app



\## Features



\-  \*\*Real-time streaming\*\* — tokens appear as the AI generates them

\-  \*\*Grounded knowledge\*\* — answers only from a curated knowledge file, cannot invent facts

\-  \*\*Server-side API key\*\* — the Groq key lives in a Vercel Function, never in the browser

\-  \*\*Fast\*\* — powered by Llama 3.3 70B on Groq's LPU hardware

\-  \*\*Free\*\* — uses Groq's free tier

\-  \*\*Dark, minimal UI\*\* with starter prompts



\## Tech Stack



\- \*\*React 19\*\* + \*\*TypeScript\*\*

\- \*\*Vite\*\* for build tooling

\- \*\*Tailwind CSS v4\*\* for styling

\- \*\*Groq\*\* (Llama 3.3 70B) for the language model

\- \*\*Vercel Functions\*\* for the serverless backend

\- \*\*Server-Sent Events\*\* for token streaming



\## How It Works



1\. The user types a question in the chat widget

2\. The frontend sends the message history to `/api/chat` (a Vercel Function)

3\. That function constructs a system prompt containing a knowledge base about Nkorofi

4\. It calls Groq's chat completions endpoint with `stream: true`

5\. Tokens stream back through the function to the browser as Server-Sent Events

6\. The UI renders each token as it arrives



The system prompt and knowledge file ensure the AI cannot invent facts — if something isn't in the knowledge base, it says so and redirects to email contact.



\## Getting Started



```bash

git clone https://github.com/nkorofimakgato-blip/nkorofi-ai.git

cd nkorofi-ai

npm install

