// Notification Service - email only
import { sendEmail, EmailMessage } from './emailService';

export interface NotificationData {
  assigneeName: string;
  assigneeEmail: string;
  issueTitle: string;
  issueDescription: string;
  issueLocation: string;
  assignmentMessage: string;
}

export const sendAssignmentNotification = async (data: NotificationData): Promise<{
  emailSuccess: boolean;
  errors: string[];
}> => {
  const errors: string[] = [];
  let emailSuccess = false;

  // Prepare email content
  const emailSubject = `Civic Issue Assignment: ${data.issueTitle}`;
  const emailText = `
Hello ${data.assigneeName},

You have been assigned to handle a civic issue:

ISSUE DETAILS:
- Title: ${data.issueTitle}
- Location: ${data.issueLocation}
- Description: ${data.issueDescription}

ASSIGNMENT MESSAGE:
${data.assignmentMessage}

Please review the issue and take appropriate action.

Best regards,
Admin Team
  `.trim();

  const emailHtml = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
      <h2 style="color: #2563eb;">Civic Issue Assignment</h2>
      <p>Hello <strong>${data.assigneeName}</strong>,</p>
      
      <p>You have been assigned to handle a civic issue:</p>
      
      <div style="background-color: #f8fafc; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #1e40af; margin-top: 0;">Issue Details</h3>
        <p><strong>Title:</strong> ${data.issueTitle}</p>
        <p><strong>Location:</strong> ${data.issueLocation}</p>
        <p><strong>Description:</strong> ${data.issueDescription}</p>
      </div>
      
      <div style="background-color: #fef3c7; padding: 20px; border-radius: 8px; margin: 20px 0;">
        <h3 style="color: #92400e; margin-top: 0;">Assignment Message</h3>
        <p style="white-space: pre-line;">${data.assignmentMessage}</p>
      </div>
      
      <p>Please review the issue and take appropriate action.</p>
      
      <p>Best regards,<br>Admin Team</p>
    </div>
  `;

  // Send email
  try {
    const emailResult = await sendEmail({
      to: data.assigneeEmail,
      subject: emailSubject,
      text: emailText,
      html: emailHtml,
      // Additional parameters for EmailJS template
      assigneeName: data.assigneeName,
      issueTitle: data.issueTitle,
      issueLocation: data.issueLocation,
      issueDescription: data.issueDescription,
      assignmentMessage: data.assignmentMessage,
    });
    
    emailSuccess = emailResult.success;
    if (!emailResult.success) {
      errors.push(`Email failed: ${emailResult.error}`);
    }
  } catch (error) {
    errors.push(`Email error: ${error instanceof Error ? error.message : 'Unknown error'}`);
  }

  return {
    emailSuccess,
    errors,
  };
};

// Test function
export const testNotificationService = async (): Promise<boolean> => {
  try {
    console.log('Testing notification service...');
    
    // Test email connection
    const { testEmailConnection } = await import('./emailService');
    const emailTest = await testEmailConnection();
    
    console.log('Email test:', emailTest ? '✅' : '❌');
    
    return emailTest;
  } catch (error) {
    console.error('Notification service test failed:', error);
    return false;
  }
};
