const axios = require("axios");

const URL = "https://www.gokgs.com/json-cors/access";
const HEADERS = ["access-control-allow-credentials", "vary", "set-cookie"];

/**
 * Copy required headers from the KGS response to the proxy response.
 */
function setHeaders(kgsResponse, res) {
  HEADERS.forEach(header => {
    if (header in kgsResponse.headers) {
      const newHeader = kgsResponse.headers[header];

      if (header === "set-cookie") {
        newHeader[0] = `${newHeader[0].replace(
          "Path=/json-cors",
          "Path=/api/json-cors"
        )}; SameSite=Strict`;
      }

      res.setHeader(header, newHeader);
    }
  });
}

/**
 * Vercel serverless function used for proxying requests to the KGS server.
 * This is only needed for the preview builds deployed to Vercel.
 */
module.exports = async function kgsProxy(req, res) {
  switch (req.method) {
    case "POST": {
      const { cookie } = req.headers;
      const headers = cookie && { cookie };
      let kgsResponse;

      try {
        kgsResponse = await axios.post(URL, req.body, { headers });
      } catch (err) {
        if (err.isAxiosError) {
          res.json(err.toJSON());
        } else {
          throw err;
        }

        break;
      }

      setHeaders(kgsResponse, res);

      res.statusCode = kgsResponse.status;
      res.json(kgsResponse.data);
      break;
    }

    default: {
      const { cookie } = req.headers;
      const headers = cookie && { cookie };
      let kgsResponse;

      try {
        kgsResponse = await axios.get(URL, { headers });
      } catch (err) {
        if (err.isAxiosError) {
          res.json(err.toJSON());
        } else {
          throw err;
        }

        break;
      }

      setHeaders(kgsResponse, res);

      res.statusCode = kgsResponse.status;
      res.json(kgsResponse.data);
    }
  }
};
