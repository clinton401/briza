export const verificationEmailTemplate = (verificationCode: string) => {
    const currentYear = new Date().getFullYear();
    const subject = "Please verify your email";
    const text = `Thank you for registering with us. Your verification code is: ${verificationCode}. This code will expire in 1 hour. If you did not register for an account, please ignore this message or contact support.`;
   const template = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Briza - Email Verification</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f3f7;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .header {
            background-color: #34495e;
            color: #ffffff;
            text-align: center;
            padding: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            color: #555555;
            margin: 10px 0;
            line-height: 1.6;
        }
        .verification-code {
            font-size: 40px;
            font-weight: 600;
            color: #34495e;
            background: #f7f9fc;
            border: 2px dashed #bdc3c7;
            padding: 15px 20px;
            display: inline-block;
            margin: 20px 0;
            border-radius: 8px;
        }
        .cta {
            margin: 20px 0;
        }
        .cta a {
            background-color: #34495e;
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 16px;
            display: inline-block;
            transition: background-color 0.3s;
        }
        .cta a:hover {
            background-color: #2c3e50;
        }
        .footer {
            font-size: 14px;
            color: #7f8c8d;
            text-align: center;
            padding: 20px;
            background-color: #ecf0f1;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #34495e;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <h1>Welcome to Briza!</h1>
        </div>
        
        <!-- Main Content Section -->
        <div class="content">
            <p>We're excited to have you with us at Briza! Use the verification code below to confirm your email. This code is valid for <strong>one hour</strong>.</p>
            <div class="verification-code">${verificationCode}</div>
            
            <p>If you didn't request this email, feel free to ignore it. Your account is secure.</p>
        </div>
        
        <!-- Footer Section -->
        <div class="footer">
            <p>&copy; ${currentYear} Briza. All rights reserved.</p>
           <p>Questions? <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a></p>

        </div>
    </div>
</body>
</html>

    `;

    return {subject, text, template}

}
export const passwordResetEmailTemplate = (resetCode: string) => {
    const currentYear = new Date().getFullYear();
    const subject = "Password Reset Request";
    const text = `You have requested to reset your password. Your reset code is: ${resetCode}. This code will expire in 1 hour. If you did not request this, please ignore this message or contact support.`;
    const template = `
    <!DOCTYPE html>
<html lang="en">
<head>
    <meta charset="UTF-8">
    <meta http-equiv="X-UA-Compatible" content="IE=edge">
    <meta name="viewport" content="width=device-width, initial-scale=1.0">
    <title>Briza - Password Reset</title>
    <style>
        body {
            font-family: 'Arial', sans-serif;
            background-color: #f0f3f7;
            margin: 0;
            padding: 0;
            color: #333333;
        }
        .container {
            width: 100%;
            max-width: 600px;
            margin: 40px auto;
            background-color: #ffffff;
            border-radius: 10px;
            overflow: hidden;
            box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
        }
        .header {
            background-color: #e74c3c;
            color: #ffffff;
            text-align: center;
            padding: 30px;
        }
        .header h1 {
            margin: 0;
            font-size: 28px;
            font-weight: bold;
            letter-spacing: 1px;
        }
        .content {
            padding: 30px 20px;
            text-align: center;
        }
        .content p {
            font-size: 16px;
            color: #555555;
            margin: 10px 0;
            line-height: 1.6;
        }
        .reset-code {
            font-size: 40px;
            font-weight: 600;
            color: #e74c3c;
            background: #fdf3f3;
            border: 2px dashed #e6b8b8;
            padding: 15px 20px;
            display: inline-block;
            margin: 20px 0;
            border-radius: 8px;
        }
        .cta {
            margin: 20px 0;
        }
        .cta a {
            background-color: #e74c3c;
            color: #ffffff;
            text-decoration: none;
            font-weight: bold;
            padding: 12px 28px;
            border-radius: 8px;
            font-size: 16px;
            display: inline-block;
            transition: background-color 0.3s;
        }
        .cta a:hover {
            background-color: #c0392b;
        }
        .footer {
            font-size: 14px;
            color: #7f8c8d;
            text-align: center;
            padding: 20px;
            background-color: #ecf0f1;
        }
        .footer p {
            margin: 5px 0;
        }
        .footer a {
            color: #e74c3c;
            text-decoration: none;
        }
    </style>
</head>
<body>
    <div class="container">
        <!-- Header Section -->
        <div class="header">
            <h1>Password Reset Request</h1>
        </div>
        
        <!-- Main Content Section -->
        <div class="content">
            <p>We received a request to reset your password. Use the code below to proceed. This code is valid for <strong>one hour</strong>.</p>
            <div class="reset-code">${resetCode}</div>
            
            <p>If you didn't request this email, feel free to ignore it. Your account is secure.</p>
        </div>
        
        <!-- Footer Section -->
        <div class="footer">
            <p>&copy; ${currentYear} Briza. All rights reserved.</p>
            <p>Questions? <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a></p>
        </div>
    </div>
</body>
</html>
    `;

    return { subject, text, template };
};
export const twoFactorAuthenticationEmailTemplate = (twoFactorCode: string) => {
    const currentYear = new Date().getFullYear();
    const subject = "Your 2-Factor Authentication Code";
    const text = `You requested a 2-factor authentication code. Your code is: ${twoFactorCode}. This code will expire in 10 minutes. If you did not request this code, please ignore this message or contact support.`;
    const template = `
      <!DOCTYPE html>
  <html lang="en">
  <head>
      <meta charset="UTF-8">
      <meta http-equiv="X-UA-Compatible" content="IE=edge">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Briza - 2FA Code</title>
      <style>
          body {
              font-family: 'Arial', sans-serif;
              background-color: #f0f3f7;
              margin: 0;
              padding: 0;
              color: #333333;
          }
          .container {
              width: 100%;
              max-width: 600px;
              margin: 40px auto;
              background-color: #ffffff;
              border-radius: 10px;
              overflow: hidden;
              box-shadow: 0 8px 20px rgba(0, 0, 0, 0.15);
          }
          .header {
              background-color: #34495e;
              color: #ffffff;
              text-align: center;
              padding: 30px;
          }
          .header h1 {
              margin: 0;
              font-size: 28px;
              font-weight: bold;
              letter-spacing: 1px;
          }
          .content {
              padding: 30px 20px;
              text-align: center;
          }
          .content p {
              font-size: 16px;
              color: #555555;
              margin: 10px 0;
              line-height: 1.6;
          }
          .verification-code {
              font-size: 40px;
              font-weight: 600;
              color: #34495e;
              background: #f7f9fc;
              border: 2px dashed #bdc3c7;
              padding: 15px 20px;
              display: inline-block;
              margin: 20px 0;
              border-radius: 8px;
          }
          .cta {
              margin: 20px 0;
          }
          .cta a {
              background-color: #34495e;
              color: #ffffff;
              text-decoration: none;
              font-weight: bold;
              padding: 12px 28px;
              border-radius: 8px;
              font-size: 16px;
              display: inline-block;
              transition: background-color 0.3s;
          }
          .cta a:hover {
              background-color: #2c3e50;
          }
          .footer {
              font-size: 14px;
              color: #7f8c8d;
              text-align: center;
              padding: 20px;
              background-color: #ecf0f1;
          }
          .footer p {
              margin: 5px 0;
          }
          .footer a {
              color: #34495e;
              text-decoration: none;
          }
      </style>
  </head>
  <body>
      <div class="container">
          <!-- Header Section -->
          <div class="header">
              <h1>2-Factor Authentication Code</h1>
          </div>
          
          <!-- Main Content Section -->
          <div class="content">
              <p>Use the code below to complete your login. This code is valid for <strong>10 minutes</strong>.</p>
              <div class="verification-code">${twoFactorCode}</div>
              
              <p>If you didn't request this code, you can safely ignore this email. Your account remains secure.</p>
          </div>
          
          <!-- Footer Section -->
          <div class="footer">
              <p>&copy; ${currentYear} Briza. All rights reserved.</p>
             <p>Questions? <a href="mailto:${process.env.EMAIL_USER}">Contact Support</a></p>
          </div>
      </div>
  </body>
  </html>
    `;
  
    return { subject, text, template };
  };
  
