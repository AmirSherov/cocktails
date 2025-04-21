import axios from 'axios';

const API_BASE_URL = '/api/aws';

const s3Proxy = {
  /**
   * Загружает файл на S3 через прокси
   * @param {File} file - Файл для загрузки
   * @param {Function} onProgress - Функция обратного вызова для отслеживания прогресса
   * @returns {Promise<Object>} - Результат загрузки
   */
  async uploadFile(file, onProgress) {
    const formData = new FormData();
    formData.append('file', file);

    try {
      const response = await axios.post(`${API_BASE_URL}/upload`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data'
        },
        onUploadProgress: (progressEvent) => {
          if (onProgress) {
            const percentCompleted = Math.round((progressEvent.loaded * 100) / progressEvent.total);
            onProgress(percentCompleted);
          }
        }
      });

      return response.data;
    } catch (error) {
      console.error('Error uploading file:', error);
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
      }
      if (error.code === 'ECONNREFUSED') {
        throw new Error('Сервер недоступен. Убедитесь, что сервер запущен на порту 3000');
      }
      throw error;
    }
  },

  /**
   * Удаляет файл из S3 через прокси
   * @param {string} key - Ключ файла для удаления
   * @returns {Promise<boolean>} - Результат удаления
   */
  async deleteFile(key) {
    try {
      const response = await axios.delete(`${API_BASE_URL}/file/${key}`);
      return response.data.success;
    } catch (error) {
      console.error('Error deleting file:', error);
      if (error.response?.data) {
        console.error('Server error details:', error.response.data);
      }
      throw error;
    }
  },

  /**
   * Получает URL файла по ключу
   * @param {string} key - Ключ файла
   * @returns {string} - URL файла
   */
  getFileUrl(key) {
    if (!key) return '';
    const region = 'us-east-2';
    const bucket = 'cocktails-video-bucket';
    return `https://${bucket}.s3.${region}.amazonaws.com/${key}`;
  }
};

export default s3Proxy; 