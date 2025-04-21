import axios from 'axios';

/**
 * API для работы с AWS S3 через прокси на стороне клиента
 * Это решение обходит проблемы с CORS, проксируя запросы через сервер разработки Vite
 */

// Определяем базовый URL API в зависимости от окружения
const API_BASE_URL = import.meta.env.PROD 
  ? window.location.origin  // В продакшене используем текущий домен
  : ''; // В разработке используем относительный путь, Vite proxy будет перенаправлять запросы

// Имя бакета S3 для формирования URL файлов
const REGION = "eu-central-1";
const BUCKET_NAME = "cocktails-video-bucket";

// Создаем экземпляр axios с базовым URL
const apiClient = axios.create({
  baseURL: API_BASE_URL
});

/**
 * Загружает файл в AWS S3 через прокси
 * @param {File} file - Файл для загрузки
 * @param {Function} onProgress - Функция обратного вызова для отслеживания прогресса
 * @returns {Promise<Object>} - Объект с информацией о загруженном файле
 */
export async function uploadFile(file, onProgress = null) {
  if (!file) {
    throw new Error('Файл не предоставлен');
  }
  
  try {
    // Используем API сервера для загрузки файла
    const formData = new FormData();
    formData.append('file', file);
    
    const response = await apiClient.post('/api/aws/upload', formData, {
      headers: {
        'Content-Type': 'multipart/form-data'
      },
      onUploadProgress: onProgress ? (progressEvent) => {
        const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
        onProgress(percentCompleted);
      } : undefined
    });
    
    return {
      key: response.data.key,
      url: response.data.url,
      success: true
    };
  } catch (error) {
    console.error('Ошибка загрузки файла в S3:', error);
    throw error;
  }
}

/**
 * Удаляет файл из AWS S3 через прокси
 * @param {string} key - Ключ файла для удаления
 * @returns {Promise<boolean>} - Результат операции
 */
export async function deleteFile(key) {
  if (!key) {
    return true;
  }
  
  try {
    // Удаляем файл через API сервера
    await apiClient.delete(`/api/aws/file/${key}`);
    
    return true;
  } catch (error) {
    console.error('Ошибка удаления файла из S3:', error);
    return false;
  }
}

/**
 * Получает URL файла в S3
 * @param {string} key - Ключ файла
 * @returns {string} - URL файла
 */
export function getFileUrl(key) {
  if (!key) return '';
  return `https://${BUCKET_NAME}.s3.${REGION}.amazonaws.com/${key}`;
}

export default {
  uploadFile,
  deleteFile,
  getFileUrl
}; 