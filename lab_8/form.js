/**
 * form.js
 * Validates the registration form, stores the data in sessionStorage,
 * and redirects to profile.html to display it.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'userProfile';
  var form = document.getElementById('userForm');

  if (!form) {
    return;
  }

  /* ----------------------------------------------------------------------
     Validation rules
     ---------------------------------------------------------------------- */
  var rules = {
    fullName: {
      test: function (v) { return /^[A-Za-z][A-Za-z .'-]{1,79}$/.test(v); },
      message: 'Enter a valid name using letters only (2 to 80 characters).'
    },
    gender: {
      test: function (v) { return v !== ''; },
      message: 'Please select a gender.'
    },
    mobile: {
      test: function (v) { return /^\+?\d{7,15}$/.test(v.replace(/[\s-]/g, '')); },
      message: 'Enter a valid mobile number (7 to 15 digits, optional + prefix).'
    },
    email: {
      test: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/.test(v); },
      message: 'Enter a valid email address, for example name@example.com.'
    },
    city: {
      test: function (v) { return /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(v); },
      message: 'Enter a valid city name.'
    },
    state: {
      test: function (v) { return /^[A-Za-z][A-Za-z .'-]{1,59}$/.test(v); },
      message: 'Enter a valid state or province name.'
    },
    country: {
      test: function (v) { return v !== ''; },
      message: 'Please select a country.'
    }
  };

  var fieldNames = Object.keys(rules);

  /* ----------------------------------------------------------------------
     Helpers
     ---------------------------------------------------------------------- */
  function getWrapper(name) {
    return form.querySelector('[data-field="' + name + '"]');
  }

  function getValue(name) {
    if (name === 'gender') {
      var checked = form.querySelector('input[name="gender"]:checked');
      return checked ? checked.value : '';
    }
    return form.elements[name].value.trim();
  }

  function setError(name, message) {
    var wrapper = getWrapper(name);
    wrapper.classList.toggle('has-error', Boolean(message));
    wrapper.querySelector('.error').textContent = message || '';
  }

  function validateField(name) {
    var isValid = rules[name].test(getValue(name));
    setError(name, isValid ? '' : rules[name].message);
    return isValid;
  }

  function setFormValues(data) {
    fieldNames.forEach(function (name) {
      if (!(name in data)) {
        return;
      }
      if (name === 'gender') {
        var radio = form.querySelector('input[name="gender"][value="' + data.gender + '"]');
        if (radio) {
          radio.checked = true;
        }
      } else {
        form.elements[name].value = data[name];
      }
    });
  }

  function readSavedProfile() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  /* ----------------------------------------------------------------------
     Pre-fill when returning to edit an existing submission
     ---------------------------------------------------------------------- */
  var saved = readSavedProfile();
  if (saved) {
    setFormValues(saved);
  }

  /* ----------------------------------------------------------------------
     Live validation feedback
     ---------------------------------------------------------------------- */
  fieldNames.forEach(function (name) {
    var wrapper = getWrapper(name);
    var inputs = wrapper.querySelectorAll('input, select');

    inputs.forEach(function (input) {
      var eventName = (input.tagName === 'SELECT' || input.type === 'radio') ? 'change' : 'blur';
      input.addEventListener(eventName, function () {
        validateField(name);
      });

      // Once a field shows an error, clear it as soon as the user corrects it.
      input.addEventListener('input', function () {
        if (wrapper.classList.contains('has-error')) {
          validateField(name);
        }
      });
    });
  });

  form.addEventListener('reset', function () {
    // Allow the browser to reset the inputs first, then clear messages.
    setTimeout(function () {
      fieldNames.forEach(function (name) { setError(name, ''); });
    }, 0);
  });

  /* ----------------------------------------------------------------------
     Submit
     ---------------------------------------------------------------------- */
  form.addEventListener('submit', function (event) {
    event.preventDefault();

    var invalidFields = fieldNames.filter(function (name) {
      return !validateField(name);
    });

    if (invalidFields.length > 0) {
      var firstInvalid = getWrapper(invalidFields[0]).querySelector('input, select');
      if (firstInvalid) {
        firstInvalid.focus();
      }
      return;
    }

    var profile = {};
    fieldNames.forEach(function (name) {
      profile[name] = getValue(name);
    });
    profile.submittedAt = new Date().toISOString();

    try {
      sessionStorage.setItem(STORAGE_KEY, JSON.stringify(profile));
    } catch (error) {
      window.alert('Unable to save your details in this browser. Please check your browser settings.');
      return;
    }

    window.location.href = 'profile.html';
  });
})();
