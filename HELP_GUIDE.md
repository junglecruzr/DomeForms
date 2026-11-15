# DomeForms User Help Guide

**Version:** 1.0  
**Last Updated:** November 14, 2026  

---

## Table of Contents

1. [Getting Started](#getting-started)
2. [Account Management](#account-management)
3. [Creating Your First Form](#creating-your-first-form)
4. [Working with Forms](#working-with-forms)
5. [Theming & Styling](#theming--styling)
6. [Integrations](#integrations)
7. [Troubleshooting](#troubleshooting)

---

## Getting Started

### System Requirements

- **Browser:** Chrome, Firefox, Safari, or Edge (latest versions)
- **Internet Connection:** Required for initial setup and updates
- **Server:** Self-hosted on Linux/Ubuntu (Docker recommended)

### Installation

1. **Clone the repository:**
   ```bash
   git clone https://github.com/your-github-user/DomeForms.git
   cd DomeForms
   ```

2. **Install dependencies:**
   ```bash
   pnpm install
   ```

3. **Start the local services:**
   ```bash
   docker-compose up -d
   ```

4. **Run database migrations:**
   ```bash
   pnpm db:migrate
   ```

5. **Start the development servers:**
   ```bash
   pnpm dev
   ```

6. **Access the application:**
   - Frontend: http://localhost:5173
   - API: http://localhost:3000

### Default Login Credentials

For first-time setup, use:
- **Email:** admin@domeforms.com
- **Password:** Admin123!

**Important:** Change these credentials immediately after first login in Settings → Account.

---

## Account Management

### Creating an Account

1. Navigate to `/register`
2. Enter your name, email, and password (minimum 8 characters)
3. Click "Create account"
4. You will be automatically logged in and redirected to the dashboard

### Logging In

1. Navigate to `/login`
2. Enter your registered email and password
3. Click "Sign in"
4. If you forget your password, contact your administrator

### Profile Settings

1. Click the profile icon in the top-right corner
2. Select "Settings"
3. Update your:
   - Display name
   - Email address
   - Password
   - Organization details

### Security Features

- **Session Management:** Sessions last 7 days by default
- **Password Requirements:** Minimum 8 characters, mixed case preferred
- **JWT Tokens:** Secure authentication via JSON Web Tokens
- **HTTPS:** All connections are encrypted in production

---

## Creating Your First Form

### Step-by-Step Guide

#### 1. Navigate to the Form Builder
From the dashboard, click "New Form" or the "+" button.

#### 2. Name Your Form
- Give it a descriptive title (e.g., "Contact Form", "Survey 2024")
- Add an optional description

#### 3. Add Fields
Click "Add Field" and select from available types:
- **Text Input:** Single-line text responses
- **Paragraph:** Multi-line text area
- **Number:** Numeric inputs with validation
- **Email:** Email address validation
- **Phone:** Phone number format
- **Select Dropdown:** Single choice selection
- **Checkbox Group:** Multiple choice selection
- **Radio Buttons:** Single choice from list
- **Date Picker:** Date selection
- **File Upload:** Document/image uploads
- **Signature Pad:** Handwritten signatures
- **Calculation:** Auto-calculated fields

#### 4. Configure Field Properties
For each field, you can set:
- Label text
- Placeholder text
- Required/optional status
- Validation rules
- Conditional visibility
- Default values

#### 5. Set Up Conditional Logic
Enable logic to show/hide fields based on:
- Other field values
- User selections
- Calculated expressions

#### 6. Preview and Test
- Click "Preview" to test the form
- Fill out test data
- Verify all validations work correctly

#### 7. Save and Publish
- Click "Save" to store the form
- Use "Publish" to get the embed code
- Share the public link


---

## Working with Forms

### Dashboard Overview

The main dashboard displays:
- All your forms in a card grid
- Search and filter options
- Quick actions (edit, preview, delete)
- Recent activity

### Form Actions

| Action | Description |
|--------|-------------|
| **Edit** | Modify form structure and settings |
| **Preview** | View form as users will see it |
| **Duplicate** | Create a copy of the form |
| **Export** | Download form data as CSV/JSON |
| **Delete** | Permanently remove the form |
| **Share** | Get embed code or public link |

### Managing Submissions

1. Click on any form to view submissions
2. Filter by date range or submission status
3. Export submissions to CSV or Excel
4. View individual response details

### Sharing Forms

**Public Link:**
```
https://yourdomain.com/form/{formId}
```

**Embed Code:**
```html
<iframe src="https://yourdomain.com/form/{formId}" width="100%" height="600"></iframe>
```

**JavaScript SDK:**
```javascript
import { renderForm } from '@domeforms/renderer';

renderForm({
  formId: 'your-form-id',
  container: '#form-container',
  theme: 'default'
});
```

---

## Theming & Styling

### Available Themes

DomeForms includes several built-in themes:
- **Default** - Clean, minimal design
- **Modern** - Bold colors, rounded corners
- **Professional** - Corporate styling
- **Dark** - Dark mode interface

### Custom Themes

1. Go to Themes section
2. Click "Create New Theme"
3. Customize:
   - Primary color
   - Secondary color
   - Font family
   - Border radius
   - Spacing

4. Apply theme to specific forms

### Live Preview

Themes update in real-time as you modify settings. Use the preview panel to see changes instantly.

---

## Integrations

### Email Notifications

Configure automatic email alerts when form submissions arrive:
1. Go to Form Settings → Integrations → Email
2. Enter recipient email addresses
3. Customize email templates
4. Test and save

### Webhooks

Receive HTTP callbacks for form events:
1. Add webhook URL in integration settings
2. Choose trigger events (submit, update, delete)
3. Secret key for signature verification
4. Test endpoint connectivity

### Payment Integration (Stripe)

Accept payments through forms:
1. Connect Stripe account
2. Add price fields to forms
3. Configure payment methods
4. Set up webhook endpoints
5. Test in sandbox mode

### CRM Integrations

Connect to popular CRMs:
- HubSpot
- Salesforce
- Zoho CRM

Sync form submissions directly to customer records.


---

## Troubleshooting

### Common Issues

#### Cannot Log In
- Check email/password spelling
- Ensure password is at least 8 characters
- Clear browser cache and cookies
- Try incognito/private browsing mode

#### Form Not Loading
- Verify your internet connection
- Check if the form is published
- Ensure the embed code is correct
- Refresh the page

#### Submission Errors
- Check required fields are filled
- Verify file size limits
- Ensure valid email format
- Check server logs for errors

### Browser Console Errors

Open browser developer tools (F12) and check the Console tab for JavaScript errors. Common fixes:
- **CORS errors:** Ensure proper headers in nginx.conf
- **401 Unauthorized:** Session may have expired, refresh page
- **404 Not Found:** Check URL routing configuration

### Server-Side Issues

Check Nginx access and error logs:
```bash
sudo tail -f /var/log/nginx/access.log
sudo tail -f /var/log/nginx/error.log
```

Verify backend service is running:
```bash
pm2 list
pm2 logs domeforms-api --lines 50
```

### Database Connection Issues

Ensure PostgreSQL is accessible:
```bash
docker ps | grep postgres
psql -U postgres -d domeforms -c "SELECT 1"
```

### Need More Help?

- Check the [GitHub Issues](https://github.com/your-github-user/DomeForms/issues)
- Review the [Technical White Paper](WHITE_PAPER.md)
- Contact the development team

---

## Quick Reference Card

| Task | Steps |
|------|-------|
| **Create Form** | Dashboard → New Form → Add Fields → Save |
| **Edit Form** | Dashboard → Edit button → Modify → Save |
| **View Submissions** | Click Form → Submissions tab → Browse/Export |
| **Change Theme** | Themes → Select/Create → Apply to Form |
| **Add Integration** | Form Settings → Integrations → Configure |
| **Get Embed Code** | Form Settings → Share → Copy iframe code |
| **Delete Form** | Form Options Menu → Delete → Confirm |

---

*This documentation covers DomeForms v1.1. For the latest updates, visit the GitHub repository.*
