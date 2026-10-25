import app from "../ecolens-ai/server/src/app.js";

export const maxDuration = 60; // 60 seconds maximum duration for multimodal vision inference

export const config = {
  api: {
    bodyParser: false,
  },
  maxDuration: 60,
};

export default app;
