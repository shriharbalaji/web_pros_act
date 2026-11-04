// script.js
// Shared by both pages:
//  - index.html   : validates the form, saves the data, opens display.html
//  - display.html : reads the saved data and shows it in a table

const STORAGE_KEY = "userInfo";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.getElementById("userForm");
  const output = document.getElementById("output");

  if (form) {
    initFormPage(form);
  }

  if (output) {
    initDetailsPage(output);
  }
});

/* ---------- FORM PAGE (index.html) ---------- */

function initFormPage(form) {
  // If the user came back via "Edit Details", fill the form with the saved values
  const saved = getSavedData();
  if (saved) {
    fillForm(form, saved);
  }

  form.addEventListener("submit", (event) => {
    event.preventDefault();
    clearErrors();

    const data = readFormData(form);
    const errors = validateData(data);

    if (Object.keys(errors).length > 0) {
      showErrors(errors);
      return;
    }

    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(data));
    window.location.href = "display.html";
  });

  form.addEventListener("reset", () => {
    // Wait for the browser to reset the fields, then clear messages
    setTimeout(clearErrors, 0);
  });
}

function readFormData(form) {
  const genderInput = form.querySelector('input[name="gender"]:checked');

  return {
    name: form.name.value.trim(),
    gender: genderInput ? genderInput.value : "",
    mobile: form.mobile.value.trim(),
    email: form.email.value.trim(),
    city: form.city.value.trim(),
    state: form.state.value.trim(),
    country: form.country.value.trim()
  };
}

function fillForm(form, data) {
  form.name.value = data.name;
  form.mobile.value = data.mobile;
  form.email.value = data.email;
  form.city.value = data.city;
  form.state.value = data.state;
  form.country.value = data.country;

  form.querySelectorAll('input[name="gender"]').forEach((radio) => {
    radio.checked = radio.value === data.gender;
  });
}

function validateData(data) {
  const errors = {};

  if (data.name === "") {
    errors.name = "Please enter your full name.";
  } else if (!/^[A-Za-z][A-Za-z .'-]*$/.test(data.name)) {
    errors.name = "Name can contain only letters, spaces, dots, apostrophes and hyphens.";
  }

  if (data.gender === "") {
    errors.gender = "Please select your gender.";
  }

  if (data.mobile === "") {
    errors.mobile = "Please enter your mobile number.";
  } else if (!/^\d{10}$/.test(data.mobile)) {
    errors.mobile = "Mobile number must be exactly 10 digits.";
  }

  if (data.email === "") {
    errors.email = "Please enter your mail ID.";
  } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email)) {
    errors.email = "Please enter a valid mail ID (e.g. name@example.com).";
  }

  if (data.city === "") {
    errors.city = "Please enter your city.";
  }

  if (data.state === "") {
    errors.state = "Please enter your state.";
  }

  if (data.country === "") {
    errors.country = "Please select your country.";
  }

  return errors;
}

function showErrors(errors) {
  for (const field in errors) {
    const span = document.getElementById("err-" + field);
    if (span) {
      span.textContent = errors[field];
    }
  }

  // Focus the first invalid field
  const firstField = Object.keys(errors)[0];
  const input = document.getElementById(firstField) ||
                document.querySelector(`input[name="${firstField}"]`);
  if (input) {
    input.focus();
  }
}

function clearErrors() {
  document.querySelectorAll(".error").forEach((span) => {
    span.textContent = "";
  });
}

/* ---------- DETAILS PAGE (display.html) ---------- */

function initDetailsPage(output) {
  const data = getSavedData();

  if (!data) {
    output.innerHTML = '<p class="message">No user information found. <a href="index.html">Fill in the form</a>.</p>';
  } else {
    displayData(output, data);
  }

  const clearBtn = document.getElementById("clearBtn");
  if (clearBtn) {
    clearBtn.addEventListener("click", () => {
      if (confirm("Are you sure you want to clear all the data?")) {
        sessionStorage.removeItem(STORAGE_KEY);
        window.location.href = "index.html";
      }
    });
  }
}

function displayData(output, data) {
  const labels = {
    name: "Full Name",
    gender: "Gender",
    mobile: "Mobile Number",
    email: "Mail ID",
    city: "City",
    state: "State",
    country: "Country"
  };

  const table = document.createElement("table");

  for (const key in labels) {
    const row = document.createElement("tr");

    const th = document.createElement("th");
    th.textContent = labels[key];

    const td = document.createElement("td");
    td.textContent = data[key] || "-";

    row.appendChild(th);
    row.appendChild(td);
    table.appendChild(row);
  }

  output.innerHTML = "";
  output.appendChild(table);
}

/* ---------- Shared helper ---------- */

function getSavedData() {
  const saved = sessionStorage.getItem(STORAGE_KEY);
  return saved ? JSON.parse(saved) : null;
}
