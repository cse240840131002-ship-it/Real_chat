import axios from "axios";

export const generateResult = async (prompt) => {
    try {
        const apiKey = process.env.OPENROUTER_API_KEY;

        // ✅ Validate API key
        if (!apiKey) {
            throw new Error("Missing OpenRouter API Key");
        }

        // ✅ Validate prompt
        if (!prompt || typeof prompt !== "string") {
            throw new Error("Invalid prompt");
        }

        const response = await axios.post(
            "https://openrouter.ai/api/v1/chat/completions",
            {
                // 🔥 Better model for JSON + code
                model: "openai/gpt-4o-mini",

                messages: [
                    {
                        role: "system",
                        content: `You MUST return ONLY valid JSON.

ALWAYS include BOTH:
- app.js
- package.json

DO NOT return plain text.
DO NOT use markdown or backticks.

STRICT FORMAT:
{
  "text": "short explanation",
  "fileTree": {
    "app.js": {
      "file": {
        "contents": "code here"
      }
    },
    "package.json": {
      "file": {
        "contents": "valid JSON string"
      }
    }
  },
  "buildCommand": {
    "mainItem": "npm",
    "commands": ["install"]
  },
  "startCommand": {
    "mainItem": "node",
    "commands": ["app.js"]
  }
}`
                    },
                    {
                        role: "user",
                        content: prompt
                    }
                ],

                temperature: 0.4,
                max_tokens: 1000,

                // ✅ Force JSON output
                response_format: {
                    type: "json_object"
                }
            },
            {
                headers: {
                    Authorization: `Bearer ${apiKey}`,
                    "Content-Type": "application/json",
                    "HTTP-Referer": "http://localhost:3000",
                    "X-Title": "AI Code Generator"
                },
                timeout: 15000
            }
        );

        let result =
            response?.data?.choices?.[0]?.message?.content;

        if (!result) {
            throw new Error("No response from AI");
        }

        // ✅ Parse JSON safely
        try {
            result = JSON.parse(result);
        } catch (err) {
            console.error("Invalid JSON from AI:", result);

            result = {
                text: result,
                fileTree: {}
            };
        }

        // 🔥 ENSURE app.js exists
        if (!result.fileTree["app.js"]) {
            result.fileTree["app.js"] = {
                file: {
                    contents: `const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.send('Hello World');
});

app.listen(3000, () => {
  console.log('Server running on port 3000');
});`
                }
            };
        }

        // 🔥 ENSURE package.json exists
        if (!result.fileTree["package.json"]) {
            result.fileTree["package.json"] = {
                file: {
                    contents: JSON.stringify({
                        name: "app",
                        version: "1.0.0",
                        main: "app.js",
                        scripts: {
                            start: "node app.js"
                        },
                        dependencies: {
                            express: "^4.21.2"
                        }
                    }, null, 2)
                }
            };
        }

        return result;

    } catch (error) {
        console.error(
            "OpenRouter Error:",
            error.response?.data || error.message
        );

        if (error.response?.status === 401) {
            throw new Error("Invalid API Key");
        }

        if (error.response?.status === 404) {
            throw new Error("Model not found");
        }

        if (error.response?.status === 429) {
            throw new Error("Rate limit exceeded");
        }

        throw error;
    }
};