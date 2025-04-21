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
    console.error('AWS credentials are not properly configured. Check your environment variables.');
    app.use('*', (req, res) => {
      res.status(500).json({ error: 'AWS credentials not configured' });
    });
    return app;
  }

  const upload = multer({ 
    storage: multer.memoryStorage(),
    limits: {
      fileSize: 50 * 1024 * 1024 
    }
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
      
      if (!key) {
        return res.status(400).json({ error: 'File key not provided' });
      }

      const command = new GetObjectCommand({
        Bucket: AWS_CONFIG.S3_BUCKET,
        Key: key
      });

      const response = await s3Client.send(command);

      res.setHeader('Content-Disposition', `attachment; filename="${key.split('/').pop()}"`);
      res.setHeader('Content-Type', response.ContentType);
      
      response.Body.pipe(res);
    } catch (err) {
      res.status(500).json({ 
        error: 'Internal server error', 
        details: err.message,
        code: err.code,
        requestId: err.$metadata?.requestId
      });
    }
  });
  
  app.post('/upload', upload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'File not provided' });
      }

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
      
      res.json({
        success: true,
        key: fileName,
        url: fileUrl
      });
    } catch (err) {
      res.status(500).json({ 
        error: 'Internal server error', 
        details: err.message,
        code: err.code,
        requestId: err.$metadata?.requestId
      });
    }
  });
  
  app.delete('/file/:key(*)', async (req, res) => {
    try {
      const { key } = req.params;
      
      if (!key) {
        return res.status(400).json({ error: 'File key not provided' });
      }

      const deleteCommand = new DeleteObjectCommand({
        Bucket: AWS_CONFIG.S3_BUCKET,
        Key: key
      });
      
      await s3Client.send(deleteCommand);
      
      res.json({ success: true });
    } catch (err) {
      res.status(500).json({ 
        error: 'Internal server error', 
        details: err.message,
        code: err.code,
        requestId: err.$metadata?.requestId
      });
    }
  });

  return app;
} 