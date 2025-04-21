import axios from '@/plugins/axios';

/**
 * Сервис для работы с API
 */
export default {
  /**
   * Получить предварительно подписанный URL для загрузки файла в S3
   * @param {string} fileType - MIME-тип файла
   * @param {string} fileExtension - Расширение файла
   * @returns {Promise<Object>} - Ответ от сервера с данными для загрузки
   */
  getPresignedUrl(fileType, fileExtension) {
    return axios.post('/aws/presigned-url', {
      fileType,
      fileExtension,
      folder: 'videos'
    });
  },

  /**
   * Подтвердить загрузку файла
   * @param {string} key - Ключ загруженного файла
   * @returns {Promise<Object>} - Ответ от сервера с подтверждением
   */
  confirmFileUpload(key) {
    return axios.post('/aws/confirm-upload', { key });
  }
}; 