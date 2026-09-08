/**
 * Progressive enhancement only.
 * Every page must remain fully usable with this file absent:
 * navigation is plain links, and the contact form validates
 * natively via required/type/pattern attributes without JS.
 */
(function () {
  "use strict";

  /* ---------------------------------------------------------
     Mobile navigation toggle
     --------------------------------------------------------- */
  var toggle = document.querySelector(".nav-toggle");
  var nav = document.getElementById("primary-nav");

  if (toggle && nav) {
    // JS is available, so switch from "always visible" to a collapsible menu.
    nav.setAttribute("data-open", "false");
    toggle.setAttribute("aria-expanded", "false");

    toggle.addEventListener("click", function () {
      var isOpen = nav.getAttribute("data-open") === "true";
      nav.setAttribute("data-open", String(!isOpen));
      toggle.setAttribute("aria-expanded", String(!isOpen));
      toggle.textContent = isOpen ? "Menu" : "Close";
    });

    // Close the menu if focus moves outside it (keyboard users tabbing away).
    document.addEventListener("focusout", function (event) {
      if (
        nav.getAttribute("data-open") === "true" &&
        !nav.contains(event.relatedTarget) &&
        event.relatedTarget !== toggle
      ) {
        nav.setAttribute("data-open", "false");
        toggle.setAttribute("aria-expanded", "false");
        toggle.textContent = "Menu";
      }
    });
  }

  /* ---------------------------------------------------------
     Contact form: accessible client-side validation
     Native HTML5 validation already works with JS off.
     This layer adds clearer, linked error text + a live status
     region so screen reader users get the same feedback
     sighted users see, without changing how the form behaves.
     --------------------------------------------------------- */
  var form = document.getElementById("contact-form");
  if (!form) return;

  var status = document.getElementById("form-status");

  function fieldWrapper(input) {
    return input.closest(".form-field");
  }

  function showError(input, message) {
    var wrapper = fieldWrapper(input);
    var errorEl = wrapper.querySelector(".error-text");
    if (!errorEl) {
      errorEl = document.createElement("span");
      errorEl.className = "error-text";
      errorEl.id = input.id + "-error";
      wrapper.appendChild(errorEl);
    }
    errorEl.textContent = message;
    wrapper.classList.add("has-error");
    input.setAttribute("aria-invalid", "true");
    var describedBy = input.getAttribute("aria-describedby") || "";
    if (describedBy.indexOf(errorEl.id) === -1) {
      input.setAttribute(
        "aria-describedby",
        (describedBy + " " + errorEl.id).trim()
      );
    }
  }

  function clearError(input) {
    var wrapper = fieldWrapper(input);
    var errorEl = wrapper.querySelector(".error-text");
    wrapper.classList.remove("has-error");
    input.removeAttribute("aria-invalid");
    if (errorEl) {
      var describedBy = (input.getAttribute("aria-describedby") || "")
        .replace(errorEl.id, "")
        .trim();
      if (describedBy) {
        input.setAttribute("aria-describedby", describedBy);
      } else {
        input.removeAttribute("aria-describedby");
      }
      errorEl.remove();
    }
  }

  function validateField(input) {
    if (input.validity.valid) {
      clearError(input);
      return true;
    }
    var message = "Please fix this field.";
    if (input.validity.valueMissing) {
      message = "This field is required.";
    } else if (input.validity.typeMismatch && input.type === "email") {
      message = "Enter a valid email address, like name@example.com.";
    } else if (input.validity.tooShort) {
      message =
        "Please enter at least " + input.minLength + " characters.";
    }
    showError(input, message);
    return false;
  }

  Array.prototype.forEach.call(
    form.querySelectorAll("input, textarea"),
    function (input) {
      input.addEventListener("blur", function () {
        validateField(input);
      });
    }
  );

  form.addEventListener("submit", function (event) {
    var inputs = Array.prototype.slice.call(
      form.querySelectorAll("input, textarea")
    );
    var allValid = inputs
      .map(validateField)
      .every(function (valid) {
        return valid;
      });

    if (!allValid) {
      event.preventDefault();
      status.textContent =
        "There is a problem with your submission. Please review the highlighted fields above.";
      status.setAttribute("data-visible", "true");
      status.setAttribute("data-state", "error");
      var firstInvalid = form.querySelector('[aria-invalid="true"]');
      if (firstInvalid) firstInvalid.focus();
      return;
    }

    // This is a static template with no backend wired up yet.
    // Replace this block with a real fetch()/submit once a form
    // endpoint (e.g. your own API or a form service) is connected.
    event.preventDefault();
    form.reset();
    status.textContent =
      "Thanks — your message was validated successfully. Connect a form endpoint to actually send it.";
    status.setAttribute("data-visible", "true");
    status.setAttribute("data-state", "success");
    status.focus();
  });
})();
