require("dotenv").config();
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");
const sanitizeHtml = require("sanitize-html");

const mail_host = process.env.SMTP_HOST;
const mail_port = process.env.SMTP_PORT;

exports.handler = async (event, context) => {
  if (event.httpMethod != "POST") {
    return methodNotAllowedResponse();
  }
  try {
    // Extract values from payload
    const rawPayload = JSON.parse(event.body);
    const sanitizeHtmlOptions = {
      allowedTags: [], // Allow no tags
      allowedAttributes: {}, // Allow no attributes
    };

    const payload = {
      name: sanitizeHtml(rawPayload.name || "", sanitizeHtmlOptions),
      email: sanitizeHtml(rawPayload.email || "", sanitizeHtmlOptions),
      phone: sanitizeHtml(rawPayload.phone || "", sanitizeHtmlOptions),
      inquiry: sanitizeHtml(rawPayload.inquiry || "", sanitizeHtmlOptions),
      organization: sanitizeHtml(
        rawPayload.organization || "",
        sanitizeHtmlOptions
      ),
      subject: sanitizeHtml(rawPayload.subject || "", sanitizeHtmlOptions),
      message: sanitizeHtml(rawPayload.message || "", sanitizeHtmlOptions),
      token: rawPayload.token,
    };

    const validationErrors = validateFormData(payload);

    if (validationErrors.length) {
      return validationErrorResponse(validationErrors);
    }

    const captchaValid = await verifyCaptcha(payload.token);
    if (!captchaValid) {
      return captchaErrorResponse();
    }

    const emailContent = generateEmailContent(payload);

    // Creating trasport object
    const transporter = nodemailer.createTransport({
      host: mail_host,
      port: mail_port,
      secure: true,
      auth: {
        user: process.env.GMAIL_USER,
        pass: process.env.GMAIL_AP,
      },
    });

    // Feeding values to email template
    const emailMessage = {
      from: process.env.GMAIL_USER,
      to: process.env.MAIL_TO,
      subject: payload.subject || "New inquiry through contact form",
      html: emailContent,
    };

    // Send the email
    await transporter.sendMail(emailMessage);

    return {
      statusCode: 200,
      body: JSON.stringify({
        success: true,
        message: "Email sent successfully!",
      }),
    };
  } catch (error) {
    console.error("Error:", error);
    return {
      statusCode: 500,
      body: JSON.stringify({
        success: false,
        message: "There is something went wrong!",
      }),
    };
  }
};

function methodNotAllowedResponse() {
  return {
    statusCode: 405,
    headers: { Allow: "POST" },
    body: JSON.stringify({ error: "Method not allowed" }),
  };
}

function validateFormData({
  name,
  email,
  phone,
  inquiry,
  subject,
  message,
  token,
}) {
  const errors = [];
  if (!name || name.trim().length < 3 || name.trim().length > 50)
    errors.push("Name must be between 3 and 50 characters.");

  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 100)
    errors.push("Invalid email address. Must be less than 100 characters.");

  if (!phone || !/^\d{10}$/.test(phone))
    errors.push("Invalid phone number. Must be 10 digits.");

  if (!inquiry || !["services", "products", "amc", "other"].includes(inquiry))
    errors.push("Invalid inquiry type. Please select a valid inquiry type.");

  if (subject.trim() && subject.length > 150)
    errors.push("Subject must be less than 150 characters.");

  if (!message || message.trim().length < 15 || message.trim().length > 700)
    errors.push("Message must be between 15 and 700 characters.");

  if (!token) errors.push("Captcha token is missing.");
  return errors;
}

function validationErrorResponse(errors) {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Validation failed", details: errors }),
  };
}

async function verifyCaptcha(token) {
  const response = await fetch(
    `https://www.google.com/recaptcha/api/siteverify`,
    {
      method: "POST",
      headers: { "Content-Type": "application/x-www-form-urlencoded" },
      body: new URLSearchParams({
        secret: process.env.RECAPTCHA_SECRET_KEY,
        response: token,
      }),
    }
  );
  const result = await response.json();
  return result?.success;
}

function captchaErrorResponse() {
  return {
    statusCode: 400,
    body: JSON.stringify({ error: "Captcha verification failed" }),
  };
}

function generateEmailContent({
  name,
  email,
  phone,
  inquiry,
  organization,
  subject,
  message,
}) {
  const templatePath = path.join(
    __dirname,
    "templates",
    "contact-template-inline.html"
  );
  const template = fs.readFileSync(templatePath, "utf-8");
  subject = subject.trim() || "New inquiry through contact form";
  organization = organization.trim() || "Unknown";
  return ejs.render(template, {
    name,
    email,
    phone,
    inquiry,
    organization,
    subject,
    message,
  });
}
