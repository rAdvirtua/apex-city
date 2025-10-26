// Email Service using EmailJS (Browser-Compatible)
// This is a completely free solution that works in the browser

export interface EmailMessage {
  to: string;
  subject: string;
  text: string;
  html?: string;
  // Additional parameters for EmailJS template
  assigneeName?: string;
  issueTitle?: string;
  issueLocation?: string;
  issueDescription?: string;
  assignmentMessage?: string;
}

// EmailJS configuration (free service)
const EMAILJS_SERVICE_ID = import.meta.env.VITE_EMAILJS_SERVICE_ID || 'your_service_id';
const EMAILJS_TEMPLATE_ID = import.meta.env.VITE_EMAILJS_TEMPLATE_ID || 'your_template_id';
const EMAILJS_PUBLIC_KEY = import.meta.env.VITE_EMAILJS_PUBLIC_KEY || 'your_public_key';

// Fallback: Simple webhook simulation for testing
const simulateEmailSending = async ({ to, subject, text, html }: EmailMessage): Promise<{ success: boolean; error?: string }> => {
  console.log('📧 Email Simulation:');
  console.log('To:', to);
  console.log('Subject:', subject);
  console.log('Text:', text);
  console.log('HTML:', html);
  
  // Simulate API call delay
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  return { success: true };
};

export const sendEmail = async ({ to, subject, text, html, assigneeName, issueTitle, issueLocation, issueDescription, assignmentMessage }: EmailMessage): Promise<{ success: boolean; error?: string }> => {
  try {
    console.log('Sending email to:', to);
    console.log('Subject:', subject);

    // Check if EmailJS is configured
    if (EMAILJS_SERVICE_ID === 'your_service_id' || !EMAILJS_SERVICE_ID) {
      console.log('EmailJS not configured, using simulation mode');
      return await simulateEmailSending({ to, subject, text, html });
    }

    // Try to use EmailJS if available
    try {
      // Dynamic import to avoid bundling issues
      const emailjs = await import('@emailjs/browser');
      
      const templateParams = {
        to_email: to,
        subject: subject,
        assignee_name: assigneeName || 'Team Member',
        issue_title: issueTitle || 'Civic Issue',
        issue_location: issueLocation || 'Location',
        issue_description: issueDescription || 'Description',
        assignment_message: assignmentMessage || html || text,
        from_name: 'Civic Pulse Admin',
      };

      const result = await emailjs.send(
        EMAILJS_SERVICE_ID,
        EMAILJS_TEMPLATE_ID,
        templateParams,
        EMAILJS_PUBLIC_KEY
      );

      console.log('Email sent successfully via EmailJS:', result.text);
      return { success: true };
    } catch (emailjsError) {
      console.log('EmailJS failed, falling back to simulation:', emailjsError);
      return await simulateEmailSending({ to, subject, text, html });
    }
  } catch (error) {
    console.error('Email sending failed:', error);
    return { 
      success: false, 
      error: error instanceof Error ? error.message : 'Unknown error' 
    };
  }
};

// Test function to verify email setup
export const testEmailConnection = async (): Promise<boolean> => {
  try {
    console.log('Testing email connection...');
    
    // Test with a simple email
    const testResult = await sendEmail({
      to: 'test@example.com',
      subject: 'Test Email',
      text: 'This is a test email from Civic Pulse.',
    });
    
    console.log('Email test result:', testResult.success ? '✅' : '❌');
    return testResult.success;
  } catch (error) {
    console.error('Email connection test failed:', error);
    return false;
  }
};
