/**
 * Isolated Static Demonstration Data for the Public Landing Page Only
 *
 * ARCHITECTURAL RULE:
 * This file contains strictly read-only marketing demonstration data for the public
 * website product walkthrough.
 *
 * DO NOT IMPORT THIS FILE INTO AUTHENTICATED APPLICATION FLOWS:
 * - src/pages/DashboardPage.jsx
 * - src/pages/HistoryPage.jsx
 * - src/pages/AnalyzePage.jsx
 * - src/pages/ScanDetailsPage.jsx
 *
 * Authenticated application workflows must strictly consume real database records
 * scoped to the authenticated user from the backend API.
 */

export const LANDING_DEMO_PREVIEW = {
  label: 'Example security check',
  badge: 'Product preview',
  sampleInput: `Hi Rahul,

Please send the payment of ₹48,500 to the account below.
My Aadhaar number is 4829-1920-1234.
Account: 928102938192

Thanks
Vikram`,
  sampleProtected: `Hi Rahul,

Please send the payment of [FINANCIAL INFORMATION REDACTED] to the account below.
My Aadhaar number is [GOVERNMENT ID REDACTED].
Account: [BANK ACCOUNT REDACTED]

Thanks
Vikram`,
  analysis: {
    riskLevel: 'HIGH RISK',
    riskScore: 72,
    issuesDetected: 3,
    findings: [
      {
        category: 'Privacy',
        type: 'Government ID detected',
        severity: 'High',
        tag: 'High',
        description: 'Aadhaar / National Identity credential found in raw text.',
      },
      {
        category: 'Financial',
        type: 'Payment details detected',
        severity: 'Medium',
        tag: 'Medium',
        description: 'Specific payment sum and bank routing identifier found.',
      },
      {
        category: 'Social Engineering',
        type: 'Urgency cues detected',
        severity: 'Low',
        tag: 'Review',
        description: 'Impromptu financial transaction instruction over unverified channel.',
      },
    ],
  },
};
