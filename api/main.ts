import express from "express";
import axios from "axios";
import bodyParser from "body-parser";

const app = express();
const port = 3000;

app.use(bodyParser.json());

app.use((req, res, next) => {
    res.header("Access-Control-Allow-Origin", "*");
    res.header(
        "Access-Control-Allow-Methods",
        "GET, POST, PUT, DELETE, OPTIONS"
    );
    res.header(
        "Access-Control-Allow-Headers",
        "Origin, X-Requested-With, Content-Type, Accept, Authorization"
    );
    next();
});

app.post("/api/proxy", async (req, res) => {
    console.log("Received request:", req.body);

    const { method, url, headers, data } = req.body;

    try {
        const response = await axios({
            method: method,
            url: url,
            headers: headers,
            data: data
        });

        console.log("Response from target API:", response.data);
        res.json(response.data);
    } catch (error: any) {
        console.error(
            "Error occurred:",
            error.response?.status,
            error.response?.data
        );
        res.status(error.response?.status || 500).json({
            message: error.message
        });
    }
});

app.all('*', async (req, res) => {
    try {
      const targetUrl = req.query.url;
      if (!targetUrl) {
        return res.status(400).json({ error: 'Missing "url" query parameter' });
      }
  
      const { method, headers, body } = req;
      const response = await axios({
        method,
        url: targetUrl,
        headers: { ...headers, host: new URL(targetUrl).host },
        data: body,
      });
  
      res.status(response.status).send(response.data);
    } catch (error) {
      res.status(error.response?.status || 500).send(error.response?.data || { error: 'Something went wrong' });
    }
  });
app.get("/", (req, res) => {
    res.send(
        "CORS proxy server by Aurélio Fernam. Visit https://github.com/fariosofernando"
    );
});

app.listen(port, () => {
    console.log(`CORS proxy server running at http://localhost:${port}`);
});