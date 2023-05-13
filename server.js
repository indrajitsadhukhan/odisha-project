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

let url = `${base_url}/openai/deployments/${deploymentName}/chat/completions?api-version=2023-03-15-preview`;
console.log(url)
function generatePrompt(prompt) {
    let messages=[{"role":"user","content":prompt}]
    return {
        "messages": messages,
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
            // res.status(200).json({ result: completion.choices[0].text });
            res.status(200).json({"result":completion.choices[0].message.content})
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
