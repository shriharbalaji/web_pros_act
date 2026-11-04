/**
 * profile.js
 * Reads the submitted profile from sessionStorage and displays it
 * on profile.html. All values are written with textContent to prevent HTML injection.
 */
(function () {
  'use strict';

  var STORAGE_KEY = 'userProfile';

  var emptyState = document.getElementById('emptyState');
  var profileCard = document.getElementById('profileCard');

  function readProfile() {
    try {
      return JSON.parse(sessionStorage.getItem(STORAGE_KEY));
    } catch (error) {
      return null;
    }
  }

  function getInitials(fullName) {
    var parts = fullName.split(/\s+/).filter(Boolean);
    if (parts.length === 0) {
      return '--';
    }
    var first = parts[0].charAt(0);
    var last = parts.length > 1 ? parts[parts.length - 1].charAt(0) : '';
    return (first + last).toUpperCase();
  }

  function formatDate(isoString) {
    var date = new Date(isoString);
    if (isNaN(date.getTime())) {
      return '';
    }
    return date.toLocaleString(undefined, {
      day: '2-digit',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    });
  }

  function renderProfile(profile) {
    // Plain text fields
    var plainFields = ['fullName', 'gender', 'city', 'state', 'country'];
    plainFields.forEach(function (key) {
      var target = document.querySelector('[data-value="' + key + '"]');
      if (target) {
        target.textContent = profile[key] || '\u2014';
      }
    });

    // Mobile and email, with clickable links
    var mobileLink = document.getElementById('mobileLink');
    mobileLink.textContent = profile.mobile;
    mobileLink.href = 'tel:' + profile.mobile.replace(/[\s-]/g, '');

    var emailLink = document.getElementById('emailLink');
    emailLink.textContent = profile.email;
    emailLink.href = 'mailto:' + profile.email;

    // Header
    document.getElementById('displayName').textContent = profile.fullName;
    document.getElementById('avatar').textContent = getInitials(profile.fullName);
    document.getElementById('submittedAt').textContent = formatDate(profile.submittedAt);

    document.title = profile.fullName + ' | Submitted Profile';
  }

  function bindActions() {
    document.getElementById('printBtn').addEventListener('click', function () {
      window.print();
    });

    document.getElementById('clearBtn').addEventListener('click', function () {
      if (window.confirm('Remove the saved details from this browser session?')) {
        sessionStorage.removeItem(STORAGE_KEY);
        window.location.reload();
      }
    });
  }

  /* ----------------------------------------------------------------------
     Init
     ---------------------------------------------------------------------- */
  var profile = readProfile();

  if (!profile) {
    emptyState.hidden = false;
    profileCard.hidden = true;
    return;
  }

  renderProfile(profile);
  bindActions();
})();
