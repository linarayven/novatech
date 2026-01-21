// Валидация email
export const validateEmail = (email: string): boolean => {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

// Валидация телефона
export const validatePhone = (phone: string): boolean => {
  const digitsOnly = phone.replace(/\D/g, '');
  return digitsOnly.length >= 10;
};

// Форматирование цены
export const formatPrice = (price: number | string) => {
  const num = typeof price === 'string' ? parseFloat(price) : price;
  return num.toLocaleString('uk-UA') + ' грн';
};

// Обработка ввода email с фильтрацией символов
export const filterEmailInput = (value: string) => {
  return value.replace(/[^a-zA-Z0-9@._\-+]/g, '');
};

// Обработка ввода телефона с форматированием +38 0XX XXX XX XX
export const formatPhoneInput = (value: string) => {
  if (!value || value === '') {
    return '+38 ';
  }
  
  if (!value.startsWith('+38')) {
    return value;
  }
  
  const digitsOnly = value.replace(/\D/g, '');
  const limited = digitsOnly.slice(0, 12);
  
  let formatted = '+38';
  if (limited.length > 2) {
    formatted += ' ' + limited.slice(2, 5);
  }
  if (limited.length > 5) {
    formatted += ' ' + limited.slice(5, 8);
  }
  if (limited.length > 8) {
    formatted += ' ' + limited.slice(8, 10);
  }
  if (limited.length > 10) {
    formatted += ' ' + limited.slice(10, 12);
  }
  
  return formatted;
};

// Обработка ввода прізвища с фильтрацией и ограничением длины
export const filterLastNameInput = (value: string) => {
  const filtered = value.replace(/[^а-яА-ЯіІєЄґҐ'ʼ\s-]/g, '');
  return filtered.slice(0, 50);
};

// Обработка ввода імені с фильтрацией и ограничением длины
export const filterFirstNameInput = (value: string) => {
  const filtered = value.replace(/[^а-яА-ЯіІєЄґҐ'ʼ\s-]/g, '');
  return filtered.slice(0, 50);
};