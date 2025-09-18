const createEmailTemplate = (
  userName,
  email,
  password = null,
  resetCode = null
) => {
  if (resetCode) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #dc3545;
          color: #ffffff;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 30px;
          line-height: 1.6;
          text-align: center;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
          margin-top: 30px;
        }
        .code-box {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: center;
          border: 2px solid #dc3545;
          font-size: 24px;
          font-weight: bold;
          letter-spacing: 5px;
        }
        .warning-box {
          background-color: #fff3cd;
          border: 1px solid #ffeaa7;
          color: #856404;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: left;
        }
        .info-box {
          background-color: #d1ecf1;
          border: 1px solid #bee5eb;
          color: #0c5460;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: left;
        }
        .email-display {
          background-color: #f8f9fa;
          padding: 10px;
          border-radius: 5px;
          margin: 15px 0;
          text-align: left;
          display: inline-block;
          font-family: monospace;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🔐 Password Reset Code</h2>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>We received a request to reset your password for your account associated with:</p>
          <div class="email-display">
            <strong>Email:</strong> ${email}
          </div>
          
          <p><strong>Your password reset code is:</strong></p>
          <div class="code-box">${resetCode}</div>
          
          <div class="info-box">
            <p><strong>Don't have access to this email?</strong></p>
            <p>If you didn't request a password reset, you can safely ignore this email. Your account remains secure.</p>
          </div>

          <div class="warning-box">
            <p><strong>⚠️ Important:</strong> This code will expire in 1 hour for security reasons.</p>
            <p>Please enter this code on the password reset page to set a new password.</p>
          </div>

          <p>If you have any questions or need assistance, please don't hesitate to contact our support team.</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your Company. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <style>
        body {
          font-family: Arial, sans-serif;
          background-color: #f4f4f4;
          margin: 0;
          padding: 0;
        }
        .container {
          max-width: 600px;
          margin: 20px auto;
          background-color: #ffffff;
          padding: 20px;
          border-radius: 8px;
          box-shadow: 0 0 10px rgba(0, 0, 0, 0.1);
        }
        .header {
          background-color: #007bff;
          color: #ffffff;
          padding: 20px;
          text-align: center;
          border-radius: 8px 8px 0 0;
        }
        .content {
          padding: 30px;
          line-height: 1.6;
          text-align: center;
        }
        .footer {
          text-align: center;
          padding: 20px;
          font-size: 12px;
          color: #777;
          border-top: 1px solid #eee;
          margin-top: 30px;
        }
        .credentials {
          background-color: #f8f9fa;
          padding: 20px;
          border-radius: 8px;
          margin: 20px 0;
          text-align: left;
          border-left: 4px solid #007bff;
        }
        .credentials p {
          margin: 10px 0;
          font-size: 16px;
        }
        .security-tip {
          background-color: #e7f3ff;
          border: 1px solid #bee5eb;
          color: #0c5460;
          padding: 15px;
          border-radius: 5px;
          margin: 20px 0;
          text-align: left;
        }
        .login-button {
          display: inline-block;
          padding: 12px 30px;
          background-color: #007bff;
          color: #ffffff;
          text-decoration: none;
          border-radius: 5px;
          font-weight: bold;
          margin: 20px 0;
          border: none;
          cursor: pointer;
          font-size: 16px;
        }
        .login-button:hover {
          background-color: #0056b3;
        }
        .steps {
          text-align: left;
          display: inline-block;
          max-width: 400px;
          margin: 20px 0;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <h2>🎉 Welcome to Our Platform!</h2>
        </div>
        <div class="content">
          <p>Dear ${userName},</p>
          <p>Your account has been successfully created by an administrator. We're excited to have you on board!</p>
          
          <div class="credentials">
            <p><strong>👤 Username:</strong> ${userName}</p>
            <p><strong>📧 Email:</strong> ${email}</p>
            <p><strong>🔑 Temporary Password:</strong> ${password}</p>
          </div>

          <p><strong>Next Steps:</strong></p>
          <div class="steps">
            <ol>
              <li>Click the button below to log in to your account</li>
              <li>Use the temporary password provided above</li>
              <li><strong>Change your password immediately</strong> after logging in for security</li>
            </ol>
          </div>

          <a href="${process.env.FRONTEND_URL}/login" class="login-button">Go to Login</a>

          <div class="security-tip">
            <p><strong>💡 Security Tip:</strong></p>
            <p>Choose a strong password that includes a mix of letters, numbers, and symbols. Never share your password with anyone.</p>
          </div>

          <p>If you have any questions or need assistance getting started, please feel free to contact our support team.</p>
          
          <p style="color: #6c757d; font-style: italic;">We look forward to working with you!</p>
        </div>
        <div class="footer">
          <p>&copy; 2025 Your Company. All rights reserved.</p>
          <p>This is an automated message. Please do not reply to this email.</p>
        </div>
      </div>
    </body>
    </html>
  `;
};

module.exports = { createEmailTemplate };
