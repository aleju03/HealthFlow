const validateStep = (currentStep) => {
  switch (currentStep) {
    case 1:
      if (!formData.email || !formData.username) {
        setError('Por favor, completa todos los campos');
        return false;
      }
      return true;

    case 2:
      if (!formData.password || !formData.confirmPassword) {
        setError('Por favor, completa todos los campos');
        return false;
      }
      if (formData.password !== formData.confirmPassword) {
        setError('Las contraseñas no coinciden');
        return false;
      }
      return true;

    case 3:
      if (!formData.current_weight || !formData.current_height || !formData.birthday || !formData.gender) {
        setError('Por favor, completa todos los campos');
        return false;
      }
      return true;

    default:
      return false;
  }
}; 