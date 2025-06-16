document.addEventListener('DOMContentLoaded', function() {
    const form = document.getElementById('updateAccount');
    const submitBtn = form.querySelector('input[type="submit"]');
    let formChanged = false;
  
    // Check all input fields for changes
    form.addEventListener('input', function() {
      formChanged = true;
      submitBtn.disabled = !formChanged;
    });
  
    // Reset on submit
    form.addEventListener('submit', function() {
      formChanged = false;
      submitBtn.disabled = true;
    });
  });