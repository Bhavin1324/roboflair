require("dotenv").config();
const nodemailer = require("nodemailer");
const ejs = require("ejs");
const fs = require("fs");
const path = require("path");

const mail_host = process.env.SMTP_HOST;
const mail_port = process.env.SMTP_PORT;

exports.handler = async (event, context) => {
  if (event.httpMethod != "POST") {
    return methodNotAllowedResponse();
  }
  try {
    // Extract values from payload
    const payload = JSON.parse(event.body);

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
  if (!name || name.length < 3)
    errors.push("Name must be at least 3 characters.");
  if (!email || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email))
    errors.push("Invalid email address.");
  if (!phone || !/^\d{10}$/.test(phone))
    errors.push("Invalid phone number. Must be 10 digits.");
  if (!inquiry || !["services", "products", "amc"].includes(inquiry))
    errors.push("Invalid inquiry type.");
  // if (!subject || subject.length < 5)
  //   errors.push("Subject must be at least 5 characters.");
  if (!message || message.length < 10)
    errors.push("Message must be at least 10 characters.");
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
