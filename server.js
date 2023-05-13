import express from 'express'
import * as dotenv from 'dotenv'
import cors from 'cors'
import fetch from "node-fetch";
dotenv.config()

const app = express()
app.use(cors())
app.use(express.json())

const apiKey = process.env.AZURE_OPENAI_KEY;
const base_url = process.env.BASE_URL;
const deploymentName = process.env.DEPLOYMENT_NAME;

let url = `${base_url}/openai/deployments/${deploymentName}/completions?api-version=2022-12-01`;

function generatePrompt(prompt) {
    return {
        'prompt': prompt,
        'max_tokens': 1000,
        'temperature': 0.3,
    };
}
app.post('/completion', async (req, res) => {
    try {
        const response = await fetch(url, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'api-key': apiKey
            },
            body: JSON.stringify(generatePrompt(req.body.prompt))
        });
    
        if (!response.ok) {
            console.log(`HTTP Code: ${response.status} - ${response.statusText}`);
        } else {
            const completion = await response.json();
            res.status(200).json({ result: completion.choices[0].text });
        }
  
    } catch (error) {
      // console.error(error)
      console.log(error)
      res.status(500).send(error || 'Something went wrong');
    }
  })

app.listen(8080, () => {
    console.log(`Server running on port 8080`)
});
