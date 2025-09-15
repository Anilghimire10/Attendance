require("dotenv").config();
const { SendMailClient } = require("zeptomail");
const ApiError = require("./apiError");

const url = "https://api.zeptomail.com/";
const token = process.env.ZEPTO_API_TOKEN;

const client = new SendMailClient({ url, token });

const sendMail = async ({
  recipientEmail,
  subject,
  emailBody,
  attachments,
}) => {
  try {
    const messageConfigurations = {
      from: {
        address: process.env.EMAIL_FROM,
        name: process.env.EMAIL_FROM_NAME,
      },
      to: [
        {
          email_address: {
            address: recipientEmail,
            name: recipientEmail,
          },
        },
      ],
      subject: subject || "Untitled",
      htmlbody: emailBody || "TemplateNotFound",
      attachments: attachments,
    };

    const response = await client.sendMail(messageConfigurations);
    return response;
  } catch (err) {
    throw new ApiError(err.message, err.statusCode || 500);
  }
};

module.exports = { sendMail };
