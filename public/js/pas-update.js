document.addEventListener('DOMContentLoaded', function() {
    const passwordForm = document.getElementById('updatePassword');
    const passwordInput = document.getElementById('input-pass2');
    const submitBtn = passwordForm.querySelector('input[type="submit"]');
    const originalPassword = ''; // Assuming empty as initial value
    
    // Function to validate password
    function validatePassword(password) {
      const hasNumber = /\d/.test(password);
      const hasLower = /[a-z]/.test(password);
      const hasUpper = /[A-Z]/.test(password);
      const hasSpecial = /[^a-zA-Z0-9]/.test(password);
      const hasLength = password.length >= 12;
      
      return hasNumber && hasLower && hasUpper && hasSpecial && hasLength;
    }
  
    // Function to toggle password visibility
    function myFunction() {
      const checkbox = document.getElementById('checkbox2');
      passwordInput.type = checkbox.checked ? 'text' : 'password';
    }
  
    // Check password on input
    passwordInput.addEventListener('input', function() {
      const isValid = validatePassword(passwordInput.value);
      const isChanged = passwordInput.value !== originalPassword;
      
      submitBtn.disabled = !(isValid && isChanged);
      
      // Visual feedback (optional)
      if (passwordInput.value && !isValid) {
        passwordInput.style.borderColor = 'red';
      } else {
        passwordInput.style.borderColor = '';
      }
    });
  
    // Initialize button state
    submitBtn.disabled = true;
  
    // Attach the toggle function to the checkbox
    document.getElementById('checkbox2').addEventListener('change', myFunction);
  });