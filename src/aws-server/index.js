import express from 'express';
import cors from 'cors';
import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from '@aws-sdk/client-s3';
import bodyParser from 'body-parser';
import { v4 as uuidv4 } from 'uuid';
import dotenv from 'dotenv';
import multer from 'multer';

dotenv.config();
const AWS_CONFIG = {
  AWS_ACCESS_KEY_ID: process.env.VITE_AWS_ACCESS_KEY_ID ||"AKIA4XIHKZCO7KWHNPYN",
  AWS_SECRET_ACCESS_KEY: process.env.VITE_AWS_SECRET_ACCESS_KEY || "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",
  AWS_REGION: process.env.VITE_AWS_REGION || 'us-east-2',
  S3_BUCKET: process.env.VITE_S3_BUCKET || 'cocktails-video-bucket'
};

export function createAwsServer(app) {
  const corsOptions = {
    origin: function(origin, callback) {
      callback(null, true);
    },
    credentials: true,
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE,OPTIONS',
    optionsSuccessStatus: 204
  };

  app.use(cors(corsOptions));
  app.use(bodyParser.json());

  if (!AWS_CONFIG.AWS_ACCESS_KEY_ID || !AWS_CONFIG.AWS_SECRET_ACCESS_KEY) {
    app.use('*', (req, res) => {
      res.status(500).json({ error: 'AWS credentials not configured' });
    });
    return app;
  }

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: { fileSize: 50 * 1024 * 1024 }
  });
  
  const s3Client = new S3Client({
    region: AWS_CONFIG.AWS_REGION,
    credentials: {
      accessKeyId: AWS_CONFIG.AWS_ACCESS_KEY_ID,
      secretAccessKey: AWS_CONFIG.AWS_SECRET_ACCESS_KEY
    }
  });

  app.get('/', (req, res) => {
    res.json({ status: 'ok', environment: process.env.NODE_ENV });
  });

  app.get('/download/:key(*)', async (req, res) => {
    try {
      const { key } = req.params;
      if (!key) return res.status(400).json({ error: 'File key not provided' });
      const command = new GetObjectCommand({
        Bucket: AWS_CONFIG.S3_BUCKET,
        Key: key
      });
      const response = await s3Client.send(command);
      res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
      res.setHeader('Content-Type', response.ContentType);
      response.Body.pipe(res);
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) return res.status(400).json({ error: 'File not provided' });
      const fileExtension = req.file.originalname.split('.').pop();
      const fileName = `${uuidv4()}.${fileExtension}`;
      const putCommand = new PutObjectCommand({
        Bucket: AWS_CONFIG.S3_BUCKET,
        Key: fileName,
        Body: req.file.buffer,
        ContentType: req.file.mimetype,
        ACL: 'public-read'
      });
      await s3Client.send(putCommand);
      const fileUrl = `https://${AWS_CONFIG.S3_BUCKET}.s3.${AWS_CONFIG.AWS_REGION}.amazonaws.com/${fileName}`;
      res.json({ success: true, key: fileName, url: fileUrl });
    } catch (err) {
      res.status(500).json({ error: 'Internal server error', details: err.message });
    }
  });

  app.delete('/file/:key(*)', async (req, res) => {
    try {
      let { key } = req.params;
      if (!key) return res.status(400).json({ error: 'File key not provided' });
      key = decodeURIComponent(key).trim();
      if (key.endsWith('.mp4.mp4')) key = key.replace('.mp4.mp4', '.mp4');
      if (key.startsWith('/')) key = key.substring(1);
      try {
        const headCommand = new GetObjectCommand({ Bucket: AWS_CONFIG.S3_BUCKET, Key: key });
        try {
          await s3Client.send(headCommand);
        } catch (headError) {
          if (headError.name === 'NoSuchKey') {
            if (key.endsWith('.mp4')) {
              const altKey = key.substring(0, key.length - 4);
              try {
                const altHeadCommand = new GetObjectCommand({ Bucket: AWS_CONFIG.S3_BUCKET, Key: altKey });
                await s3Client.send(altHeadCommand);
                key = altKey;
              } catch {}
            } else if (!key.includes('.')) {
              const altKey = `${key}.mp4`;
              try {
                const altHeadCommand = new GetObjectCommand({ Bucket: AWS_CONFIG.S3_BUCKET, Key: altKey });
                await s3Client.send(altHeadCommand);
                key = altKey;
              } catch {}
            }
          }
        }
        const deleteCommand = new DeleteObjectCommand({ Bucket: AWS_CONFIG.S3_BUCKET, Key: key });
        await s3Client.send(deleteCommand);
        return res.json({ success: true, key });
      } catch (err) {
        res.status(500).json({ error: 'Internal server error', details: err.message, key });
      }
    } catch (err) {
      res.status(500).json({ error: 'Server error', message: err.message });
    }
  });

  app.post('/mark-deleted', async (req, res) => {
    try {
      const { key } = req.body;
      if (!key) return res.status(400).json({ error: 'File key not provided' });
      res.json({ success: true, key });
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error', message: error.message });
    }
  });

  app.post('/force-delete', async (req, res) => {
    try {
      const { key } = req.body;
      if (!key) return res.status(400).json({ error: 'File key not provided' });
      const cleanKey = key.trim();
      const keyVariants = [cleanKey];
      if (cleanKey.endsWith('.mp4')) keyVariants.push(cleanKey.substring(0, cleanKey.length - 4));
      else if (!cleanKey.includes('.')) keyVariants.push(`${cleanKey}.mp4`);
      let succeeded = false;
      let deletedKey = null;
      let lastError = null;
      for (const variantKey of keyVariants) {
        try {
          const deleteCommand = new DeleteObjectCommand({ Bucket: AWS_CONFIG.S3_BUCKET, Key: variantKey });
          await s3Client.send(deleteCommand);
          succeeded = true;
          deletedKey = variantKey;
          break;
        } catch (error) {
          lastError = error;
        }
      }
      if (succeeded) {
        res.json({ success: true, key: deletedKey });
      } else {
        throw lastError || new Error(`Не удалось удалить файл с ключами: ${keyVariants.join(', ')}`);
      }
    } catch (error) {
      res.status(500).json({ success: false, error: 'Internal Server Error', message: error.message, code: error.code });
    }
  });

  return app;
} 