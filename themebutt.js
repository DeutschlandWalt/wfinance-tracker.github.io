function toggleTheme() {
    document.body.classList.toggle('dark-mode');
    
    // Меняем текст кнопки
    const themeBtn = document.getElementById('themeToggle');
    if (document.body.classList.contains('dark-mode')) {
      themeBtn.textContent = '☀️';
      localStorage.setItem('theme', 'dark');
    } else {
      themeBtn.textContent = '🌙';
      localStorage.setItem('theme', 'light');
    }
  }

  // Проверяем сохранённую тему при загрузке
  window.onload = function() {
    const savedTheme = localStorage.getItem('theme');
    if (savedTheme === 'dark') {
      document.body.classList.add('dark-mode');
      document.getElementById('themeToggle').textContent = '☀️';
    }
    
    // Вешаем обработчик на кнопку
    document.getElementById('themeToggle').addEventListener('click', toggleTheme);
  };