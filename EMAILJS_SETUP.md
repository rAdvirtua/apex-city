# EmailJS Setup Guide (Real Email Sending)

## 🚀 Quick Setup (5 minutes)

### Step 1: Create EmailJS Account
1. Go to [EmailJS.com](https://www.emailjs.com/)
2. Click "Sign Up" (free account)
3. Verify your email

### Step 2: Add Email Service
1. Go to **Email Services** → **Add New Service**
2. Choose **Gmail** (or your preferred email provider)
3. Connect your Gmail account
4. Copy the **Service ID** (e.g., `service_abc123`)

### Step 3: Create Email Template
1. Go to **Email Templates** → **Create New Template**
2. Use this template:

```html
Subject: {{subject}}

Hello {{assignee_name}},

You have been assigned to handle a civic issue:

ISSUE DETAILS:
- Title: {{issue_title}}
- Location: {{issue_location}}
- Description: {{issue_description}}

ASSIGNMENT MESSAGE:
{{assignment_message}}

Please review the issue and take appropriate action.

Best regards,
Admin Team
```

3. Save and copy the **Template ID** (e.g., `template_xyz789`)

### Step 4: Get Public Key
1. Go to **Account** → **General**
2. Copy your **Public Key** (e.g., `user_abc123def456`)

### Step 5: Add to Environment
Create `.env.local` file:
```bash
VITE_EMAILJS_SERVICE_ID=service_abc123
VITE_EMAILJS_TEMPLATE_ID=template_xyz789
VITE_EMAILJS_PUBLIC_KEY=user_abc123def456
```

### Step 6: Test
1. Restart your dev server
2. Try assigning an issue
3. Check your email inbox!
