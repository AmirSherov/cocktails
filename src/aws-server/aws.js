import axios from 'axios'

// Для продакшена:
const API_URL = 'https://mrbarmister.pro'
// Для локальной разработки (раскомментируй строку ниже):
// const API_URL = 'http://localhost:3000'

const awsAxios = axios.create({
  baseURL: `${API_URL}/api/aws`
})

/**
 * @param {File} file - Файл для загрузки
 * @returns {Promise<string>} - Ключ загруженного файла
 */
export const uploadVideoToS3 = async (file) => {
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
 * @param {string} key - Ключ видео для удаления
 * @returns {Promise<boolean>} - Результат операции удаления
 */
export const deleteVideoFromS3 = async (key) => {
  if (!key) return true;

  try {
    // Подготавливаем и очищаем ключ
    let cleanKey = key.trim();
    
    // Исправляем дублирование расширения
    if (cleanKey.endsWith('.mp4.mp4')) {
      cleanKey = cleanKey.replace('.mp4.mp4', '.mp4');
    }
    
    console.log(`[AWS] Удаляем файл с ключом: ${cleanKey}`);
    
    // РЕАЛЬНОЕ удаление файла с использованием всех возможных вариантов ключа
    const variants = [cleanKey];
    
    // Добавляем вариант с расширением или без, в зависимости от текущего ключа
    if (cleanKey.endsWith('.mp4')) {
      variants.push(cleanKey.substring(0, cleanKey.length - 4));
    } else if (!cleanKey.includes('.')) {
      variants.push(`${cleanKey}.mp4`);
    }
    
    // Пробуем все варианты ключей для удаления
    for (const variant of variants) {
      try {
        console.log(`[AWS] Отправляем запрос на удаление файла: ${variant}`);
        
        const response = await awsAxios.delete(`/file/${encodeURIComponent(variant)}`, {
          headers: {
            'Cache-Control': 'no-cache',
            'X-Force-Delete': 'true'
          },
          timeout: 10000
        });
        
        if (response.data && response.data.success) {
          console.log(`[AWS] Файл успешно удален: ${variant}`);
          return true;
        } else {
          console.warn(`[AWS] Сервер вернул неожиданный ответ:`, response.data);
        }
      } catch (variantError) {
        console.error(`[AWS] Ошибка при удалении варианта ${variant}:`, 
          variantError.response?.status || variantError.message);
      }
    }
    
    // Если все попытки не удались, используем крайнее средство - запрос на принудительное удаление
    try {
      console.log(`[AWS] Отправляем запрос на принудительное удаление: ${cleanKey}`);
      
      const response = await awsAxios.post('/force-delete', { key: cleanKey }, {
        headers: {
          'Content-Type': 'application/json',
          'Cache-Control': 'no-cache'
        },
        timeout: 10000
      });
      
      if (response.data && response.data.success) {
        console.log(`[AWS] Файл удален принудительно: ${cleanKey}`);
        return true;
      }
    } catch (forceError) {
      console.error(`[AWS] Ошибка при принудительном удалении:`, forceError.message);
    }
    
    // Если все попытки не удались
    console.error(`[AWS] Не удалось удалить файл: ${cleanKey}`);
    return false;
  } catch (finalError) {
    console.error(`[AWS] Критическая ошибка при удалении:`, finalError.message);
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