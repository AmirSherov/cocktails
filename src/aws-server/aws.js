import axios from 'axios'

// Получаем базовый URL из переменных окружения или используем дефолтный
const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:3000'

const awsAxios = axios.create({
  baseURL: `${API_URL}/api/aws`
})

/**
 * @param {File} file - Файл для загрузки
 * @param {Function} onProgress - Функция обратного вызова для отслеживания прогресса загрузки
 * @param {Function} onSuccess - Функция обратного вызова при успешной загрузке
 * @param {Function} onError - Функция обратного вызова при ошибке загрузки
 * @returns {Promise<string>} - Ключ загруженного файла
 */
export const uploadVideoToS3 = async (file, onProgress, onSuccess, onError) => {
  const formData = new FormData()
  formData.append('file', file)

  const response = await awsAxios.post('/upload', formData, {
    headers: {
      'Content-Type': 'multipart/form-data'
    }
  })

  return response.data.key
}

/**
 * Удаляет видео из S3 через прокси
 * @param {string} videoKey - Ключ видео для удаления
 * @returns {Promise<boolean>} - Результат операции удаления
 */
export const deleteVideoFromS3 = async (key) => {
  if (!key) return true;

  try {
    await awsAxios.delete(`/file/${encodeURIComponent(key)}`);
    return true;
  } catch (error) {
    console.error("Ошибка удаления видео из S3:", error);
    return false;
  }
}

/**
 * Получает URL видео по ключу
 * @param {string} key - Ключ видео
 * @returns {string} - URL видео
 */
export const getVideoUrl = (key) => {
  return `${awsAxios.defaults.baseURL}/download/${encodeURIComponent(key)}`
}

export const downloadVideoFromS3 = async (key) => {
  return awsAxios.get(`/download/${encodeURIComponent(key)}`, {
    responseType: 'blob'
  })
} 