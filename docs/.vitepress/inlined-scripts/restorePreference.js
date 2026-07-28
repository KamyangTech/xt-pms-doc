;(() => {
  // 恢复深色模式偏好
  const saved = localStorage.getItem('dark-mode')
  if (saved === 'true') {
    document.documentElement.classList.add('dark')
  }
})()
