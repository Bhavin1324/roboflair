(function () {
  "use strict";
  let captchaWidgetId;
  function renderRecaptcha(id) {
    captchaWidgetId = grecaptcha.render(document.getElementById(id), {
      sitekey: "6LdCiFgrAAAAAHOzIQesXjb2IXwDwxXi47e5mjQx",
      size: "invisible",
      callback: onRecaptchaSuccess,
      "error-callback": () => console.error("Error in recaptcha response"),
    });
  }

  function handleFormSubmit(event) {
    event.preventDefault();

    const contactForm = event.target;

    // Trigger reCAPTCHA execution
    if (captchaWidgetId != null && typeof grecaptcha !== "undefined") {
      grecaptcha.ready(() => {
        grecaptcha.execute(captchaWidgetId);
      });
    } else {
      displayError(contactForm, "ReCAPTCHA is not initialized properly!");
    }
  }

  function onRecaptchaSuccess(token) {
    const contactForm = document.querySelector(".php-email-form");

    if (!contactForm) {
      console.error("Form not found!");
      return;
    }

    const action = contactForm.getAttribute("action");
    if (!action) {
      displayError(contactForm, "The form action property is not set!");
      return;
    }

    // Prepare form data
    const formData = new FormData(contactForm);
    formData.set("token", token);

    // Submit the form data
    contactForm.querySelector(".loading").classList.add("d-block");
    contactForm.querySelector(".error-message").classList.remove("d-block");
    contactForm.querySelector(".sent-message").classList.remove("d-block");

    contact_form_submit(contactForm, action, formData);
  }

  function formDataToJson(formData) {
    const jsonObject = {};
    formData.forEach((value, key) => {
      // Check if the key already exists
      if (jsonObject[key]) {
        // If it's not an array, convert it into an array
        if (!Array.isArray(jsonObject[key])) {
          jsonObject[key] = [jsonObject[key]];
        }
        // Append the new value to the array
        jsonObject[key].push(value);
      } else {
        // Otherwise, just set the value
        jsonObject[key] = value;
      }
    });
    return jsonObject;
  }

  function contact_form_submit(thisForm, action, formData) {
    fetch(action, {
      method: "POST",
      body: JSON.stringify(formDataToJson(formData)),
      headers: { "Content-Type": "application/json" },
    })
      .then((response) => {
        response.json().then((res) => {
          thisForm.querySelector(".loading").classList.remove("d-block");
          if (response.ok) {
            thisForm.querySelector(".sent-message").classList.add("d-block");
            thisForm.reset();
          } else {
            let errMsg = `${res.error}`;
            if (res.details && res.details.length > 0) {
              res.details.forEach((item) => {
                errMsg += `<br> ${item}`;
              });
            }
            displayError(thisForm, errMsg)
          }
        });
      })
      .catch((error) => {
        displayError(thisForm, error);
      });
  }

  function displayError(thisForm, error) {
    thisForm.querySelector(".loading").classList.remove("d-block");
    thisForm.querySelector(".error-message").innerHTML = error;
    thisForm.querySelector(".error-message").classList.add("d-block");
  }
  window.addEventListener("load", () => {
    const contactForm = document.querySelector(".php-email-form");
    if (contactForm) {
      contactForm.addEventListener("submit", handleFormSubmit);
    }
    renderRecaptcha("captcha-container");
  });
})();
