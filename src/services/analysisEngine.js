/**
 * TrustGuard AI Security & Privacy Analysis Engine
 * Detects:
 * - Personally Identifiable Information (PII)
 * - Credentials & Secrets (API Keys, Tokens, Passwords)
 * - Financial Information (Cards, Accounts, UPI, Wire Transfer demands)
 * - Social Engineering (Urgency, Impersonation, Coercion, Phishing signals)
 * - Suspicious Links
 */

export const PRESET_EXAMPLES = [
  {
    id: 'payment-urgency',
    title: 'Vendor Payment & Aadhaar (High Risk)',
    category: 'Finance & Privacy',
    text: `Hi Rahul,

Please send the payment of ₹48,500 immediately to the account below.
My Aadhaar number is 4829-1920-1234.
Account: 928102938192
IFSC: HDFC0001234

This is urgent as the supplier deadline expires in 2 hours. Do not delay.

Thanks,
Vikram`
  },
  {
    id: 'ai-prompt-keys',
    title: 'AI Prompt with API Key (High Risk)',
    category: 'Credentials',
    text: `I am querying OpenAI for customer summaries.
Here is my authorization header:
Authorization: Bearer sk-proj-9xLkM3n0P1qRsTuVwXyZ8aBcDeFgHiJkLmNoPqRsTuVw
User details: John Doe, SSN: 219-45-8831, email: j.doe@megacorp.internal.
Please summarize their recent purchase history and refund requests.`
  },
  {
    id: 'social-engineering',
    title: 'IT Impersonation Urgent Reset (High Risk)',
    category: 'Social Engineering',
    text: `URGENT SECURITY NOTICE FROM IT HELPDESK:
We detected unauthorized login attempts on your workstation. Your access will be terminated within 30 minutes unless you verify your identity.
Please visit http://it-helpdesk-auth-verify.biz/reset-pwd immediately and confirm your current password: Summer2024! to restore full access.`
  },
  {
    id: 'customer-support-pii',
    title: 'Customer Support Request (Medium Risk)',
    category: 'Privacy & Financial',
    text: `Hello Support,
I was double charged on my card ending in 4111-2222-3333-4444.
My registered phone number is +1-555-019-2834 and my personal email is sarah.connor@gmail.com.
Can you please initiate a refund to my UPI id sarah@okhdfcbank?`
  },
  {
    id: 'clean-business-email',
    title: 'Quarterly Planning Message (Safe)',
    category: 'Safe Content',
    text: `Hi Team,
Attached is the finalized agenda for tomorrow's Q4 product roadmap alignment meeting.
We will review sprint priorities, platform reliability goals, and resource allocation.
Looking forward to everyone's input.
Best regards,
Product Operations`
  }
];

export function analyzeContent(text) {
  if (!text || text.trim() === '') {
    return {
      score: 0,
      level: 'SAFE',
      issuesCount: 0,
      categories: {
        privacy: { level: 'Safe', count: 0 },
        credential: { level: 'Safe', count: 0 },
        financial: { level: 'Safe', count: 0 },
        socialEngineering: { level: 'Safe', count: 0 },
      },
      findings: [],
      originalText: text || '',
      protectedText: text || '',
      analyzedAt: new Date().toISOString(),
    };
  }

  const rawFindings = [];

  const addFinding = (f) => {
    // Avoid exact duplicate matches or strict containment overlaps
    const hasOverlap = rawFindings.some(existing => {
      return (f.startIndex >= existing.startIndex && f.endIndex <= existing.endIndex) ||
             (existing.startIndex >= f.startIndex && existing.endIndex <= f.endIndex);
    });
    if (!hasOverlap) {
      rawFindings.push(f);
    }
  };

  let match;

  // 1. CREDENTIALS & SECRETS
  // OpenAI API Key
  const openaiKeyRegex = /sk-(?:proj-)?[a-zA-Z0-9_-]{28,64}/g;
  while ((match = openaiKeyRegex.exec(text)) !== null) {
    addFinding({
      id: `cred-${rawFindings.length + 1}`,
      type: 'API Secret Key',
      category: 'credential',
      categoryLabel: 'Credential Risk',
      severity: 'High',
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      redaction: '[CREDENTIAL REDACTED]',
      explanation: 'Production API keys grant direct, unmonitored access to cloud services and third-party models. Exposing keys in messages or prompts leads to automated exfiltration.',
      recommendation: 'Rotate this secret key immediately and store secrets using environment variables or a vault.',
    });
  }

  // AWS Access Key ID
  const awsKeyRegex = /\b(AKIA[0-9A-Z]{16})\b/g;
  while ((match = awsKeyRegex.exec(text)) !== null) {
    addFinding({
      id: `cred-${rawFindings.length + 1}`,
      type: 'AWS Access Key',
      category: 'credential',
      categoryLabel: 'Credential Risk',
      severity: 'High',
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      redaction: '[AWS KEY REDACTED]',
      explanation: 'AWS IAM access keys provide administrative or service permissions across infrastructure. Publicly sharing them risks infrastructure compromise.',
      recommendation: 'Revoke this access key from AWS IAM and switch to temporary STS credentials.',
    });
  }

  // Cleartext Password
  const passwordRegex = /(?:password|passwd|pwd)\s*[:=]\s*(['"][^'"\n\r]+['"]|\S+)/gi;
  while ((match = passwordRegex.exec(text)) !== null) {
    const fullMatch = match[0];
    const passVal = match[1].replace(/^['"]|['"]$/g, '');
    const valIndex = match.index + fullMatch.indexOf(passVal);
    addFinding({
      id: `cred-${rawFindings.length + 1}`,
      type: 'Exposed Password',
      category: 'credential',
      categoryLabel: 'Credential Risk',
      severity: 'High',
      text: passVal,
      startIndex: valIndex,
      endIndex: valIndex + passVal.length,
      redaction: '[PASSWORD REDACTED]',
      explanation: 'Cleartext passwords should never be communicated over email, chat, or pasted into external AI assistants.',
      recommendation: 'Share credentials using encrypted password vaults or one-time secret links with expiration.',
    });
  }

  // Bearer Token
  const bearerRegex = /Bearer\s+([a-zA-Z0-9._~+/-]{20,})/gi;
  while ((match = bearerRegex.exec(text)) !== null) {
    const token = match[1];
    const tokenIndex = match.index + match[0].indexOf(token);
    addFinding({
      id: `cred-${rawFindings.length + 1}`,
      type: 'Bearer Authentication Token',
      category: 'credential',
      categoryLabel: 'Credential Risk',
      severity: 'High',
      text: token,
      startIndex: tokenIndex,
      endIndex: tokenIndex + token.length,
      redaction: '[TOKEN REDACTED]',
      explanation: 'Active session tokens and OAuth credentials can be replayed by adversaries to impersonate authorized users.',
      recommendation: 'Invalidate token and remove it from plaintext content.',
    });
  }

  // 2. FINANCIAL: 16-Digit Payment Cards
  const ccRegex = /\b(?:\d{4}[-\s]?){3}\d{4}\b/g;
  while ((match = ccRegex.exec(text)) !== null) {
    const cleanDigits = match[0].replace(/\D/g, '');
    if (cleanDigits.length === 16) {
      addFinding({
        id: `fin-${rawFindings.length + 1}`,
        type: 'Payment Card Number',
        category: 'financial',
        categoryLabel: 'Financial',
        severity: 'High',
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        redaction: '[PAYMENT CARD REDACTED]',
        explanation: 'Full payment card numbers fall directly under PCI-DSS compliance scope. Transmitting plaintext PANs invites interception and fraudulent transactions.',
        recommendation: 'Mask all digits except the last four (e.g., **** **** **** 4444).',
      });
    }
  }

  // Bank Account Numbers ("Account: ...")
  const bankAccRegex = /\bAccount:\s*(\d{9,18})\b/gi;
  while ((match = bankAccRegex.exec(text)) !== null) {
    const accNum = match[1];
    const accIndex = match.index + match[0].indexOf(accNum);
    addFinding({
      id: `fin-${rawFindings.length + 1}`,
      type: 'Bank Account Number',
      category: 'financial',
      categoryLabel: 'Financial',
      severity: 'Medium',
      text: accNum,
      startIndex: accIndex,
      endIndex: accIndex + accNum.length,
      redaction: '[BANK ACCOUNT REDACTED]',
      explanation: 'Plaintext bank account numbers coupled with routing codes allow unauthorized debit attempts and invoice redirection fraud.',
      recommendation: 'Obtain and store banking details only through formal vendor management workflows.',
    });
  }

  // UPI IDs
  const upiRegex = /\b[a-zA-Z0-9._-]+@(okhdfcbank|okaxis|okicici|oksbi|paytm|upi|ybl|axl|ibl)\b/gi;
  while ((match = upiRegex.exec(text)) !== null) {
    addFinding({
      id: `fin-${rawFindings.length + 1}`,
      type: 'Virtual Payment Address (UPI)',
      category: 'financial',
      categoryLabel: 'Financial',
      severity: 'Medium',
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      redaction: '[UPI ID REDACTED]',
      explanation: 'UPI handles link directly to personal banking rails and can be exploited for fraudulent payment collect requests.',
      recommendation: 'Verify payment requests via an authenticated corporate billing portal.',
    });
  }

  // Currency amounts associated with payment requests
  const currencyAmountRegex = /(?:₹|\$|€|£)\s*[0-9]{1,3}(?:,[0-9]{3})*(?:\.[0-9]{2})?/g;
  while ((match = currencyAmountRegex.exec(text)) !== null) {
    const contextStart = Math.max(0, match.index - 40);
    const contextEnd = Math.min(text.length, match.index + match[0].length + 40);
    const surrounding = text.substring(contextStart, contextEnd).toLowerCase();
    if (surrounding.includes('payment') || surrounding.includes('transfer') || surrounding.includes('send') || surrounding.includes('charge') || surrounding.includes('refund')) {
      addFinding({
        id: `fin-${rawFindings.length + 1}`,
        type: 'Financial Transaction Amount',
        category: 'financial',
        categoryLabel: 'Financial',
        severity: 'Medium',
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        redaction: '[FINANCIAL INFORMATION REDACTED]',
        explanation: 'Specific transaction amounts in informal communications are frequently targeted during Business Email Compromise (BEC) wire-fraud maneuvers.',
        recommendation: 'Validate payment invoices out-of-band with accounting signatories.',
      });
    }
  }

  // 3. PRIVACY: Aadhaar Number (explicitly avoiding account numbers or 16 digit cards)
  const aadhaarRegex = /\b(?:\d{4}[-\s]\d{4}[-\s]\d{4}|[X]{8}\d{4})\b/g;
  while ((match = aadhaarRegex.exec(text)) !== null) {
    const precedingText = text.substring(Math.max(0, match.index - 12), match.index).toLowerCase();
    if (!precedingText.includes('account')) {
      addFinding({
        id: `priv-${rawFindings.length + 1}`,
        type: 'Government ID (Aadhaar)',
        category: 'privacy',
        categoryLabel: 'Privacy',
        severity: 'High',
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        redaction: '[GOVERNMENT ID REDACTED]',
        explanation: 'This appears to be a sensitive national government identifier (Aadhaar number) that should not be shared without verified necessity and cryptographic masking.',
        recommendation: 'Mask the identifier or use virtual ID (VID) tokens for identity verification.',
      });
    }
  }

  // US Social Security Number (SSN)
  const ssnRegex = /\b(?!000|666|9\d{2})\d{3}-(?!00)\d{2}-(?!0000)\d{4}\b/g;
  while ((match = ssnRegex.exec(text)) !== null) {
    addFinding({
      id: `priv-${rawFindings.length + 1}`,
      type: 'Government ID (SSN)',
      category: 'privacy',
      categoryLabel: 'Privacy',
      severity: 'High',
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      redaction: '[SSN REDACTED]',
      explanation: 'Social Security Numbers are sensitive federal identifiers subject to stringent data privacy regulations (HIPAA, GLBA). Exposure poses severe identity theft risks.',
      recommendation: 'Strip SSN or keep only the last 4 digits if strictly necessary for verification.',
    });
  }

  // Email Addresses
  const emailRegex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
  while ((match = emailRegex.exec(text)) !== null) {
    addFinding({
      id: `priv-${rawFindings.length + 1}`,
      type: 'Personal / Work Email',
      category: 'privacy',
      categoryLabel: 'Privacy',
      severity: 'Low',
      text: match[0],
      startIndex: match.index,
      endIndex: match.index + match[0].length,
      redaction: '[EMAIL REDACTED]',
      explanation: 'Unsolicited email disclosure can expose personnel to spear-phishing campaigns and email enumeration attacks.',
      recommendation: 'Replace with anonymized recipient handle if submitting to external platforms.',
    });
  }

  // Phone Numbers
  const phoneRegex = /(?:\+?\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}\b/g;
  while ((match = phoneRegex.exec(text)) !== null) {
    const raw = match[0].trim();
    if (raw.length >= 10 && !raw.includes('@')) {
      addFinding({
        id: `priv-${rawFindings.length + 1}`,
        type: 'Phone Number',
        category: 'privacy',
        categoryLabel: 'Privacy',
        severity: 'Low',
        text: raw,
        startIndex: match.index,
        endIndex: match.index + raw.length,
        redaction: '[PHONE REDACTED]',
        explanation: 'Direct phone numbers are sensitive PII frequently used as secondary vectors for SMS-based social engineering (smishing).',
        recommendation: 'Redact direct contact lines prior to external dispatch.',
      });
    }
  }

  // 4. SOCIAL ENGINEERING & URGENCY SIGNALS
  const urgencyPatterns = [
    {
      regex: /Please send the payment of [^\n\r]+ immediately/gi,
      type: 'Urgent Payment Demand',
      explanation: 'The message creates artificial urgency around an immediate financial transfer, a classic indicator of CEO fraud and supplier payment interception.',
      severity: 'High'
    },
    {
      regex: /transfer the money immediately|wire the funds immediately/gi,
      type: 'Urgent Wire Transfer Demand',
      explanation: 'Immediate fund transfer demands attempt to bypass standard organizational verification controls.',
      severity: 'High'
    },
    {
      regex: /deadline expires in \d+ hours|within \d+ minutes unless you verify|access will be terminated within/gi,
      type: 'Artificial Urgency / Coercion',
      explanation: 'Time-pressured deadlines are designed to induce panic and force victims into acting without standard verification checks.',
      severity: 'High'
    },
    {
      regex: /URGENT SECURITY NOTICE FROM IT HELPDESK|IT Helpdesk request/gi,
      type: 'Authority Impersonation',
      explanation: 'Impersonating internal IT or security departments is a primary pretexting tactic used to extract employee credentials.',
      severity: 'High'
    },
    {
      regex: /Do not delay|Do not disclose to anyone/gi,
      type: 'Secrecy & Isolation Tactic',
      explanation: 'Instructing recipients not to verify instructions or communicate with peers isolates targets from secondary validation.',
      severity: 'Medium'
    }
  ];

  for (const item of urgencyPatterns) {
    while ((match = item.regex.exec(text)) !== null) {
      addFinding({
        id: `soc-${rawFindings.length + 1}`,
        type: item.type,
        category: 'socialEngineering',
        categoryLabel: 'Social Engineering',
        severity: item.severity,
        text: match[0],
        startIndex: match.index,
        endIndex: match.index + match[0].length,
        redaction: '[URGENCY SIGNAL REMOVED]',
        explanation: item.explanation,
        recommendation: 'Pause and establish out-of-band verification via voice call or verified internal directory before acting.',
      });
    }
  }

  // 5. SUSPICIOUS LINKS
  const linkRegex = /https?:\/\/[^\s/$.?#].[^\s]*/gi;
  while ((match = linkRegex.exec(text)) !== null) {
    const url = match[0];
    const isSuspicious = url.includes('.biz') || url.includes('auth-verify') || url.includes('reset-pwd') || url.includes('bit.ly') || /\d{1,3}\.\d{1,3}\.\d{1,3}\.\d{1,3}/.test(url);
    if (isSuspicious) {
      addFinding({
        id: `link-${rawFindings.length + 1}`,
        type: 'Suspicious / Phishing Link',
        category: 'socialEngineering',
        categoryLabel: 'Suspicious Link',
        severity: 'High',
        text: url,
        startIndex: match.index,
        endIndex: match.index + url.length,
        redaction: '[SUSPICIOUS URL BLOCKED]',
        explanation: 'This link routes through an unverified top-level domain or mimics corporate single sign-on portals commonly used to harvest credentials.',
        recommendation: 'Do not click or submit login information. Submit to corporate security operations for sandboxing.',
      });
    }
  }

  // Sort findings by position
  rawFindings.sort((a, b) => a.startIndex - b.startIndex);

  // Generate Protected (Redacted) Version
  let protectedText = '';
  let lastIndex = 0;

  for (const f of rawFindings) {
    if (f.startIndex >= lastIndex) {
      protectedText += text.substring(lastIndex, f.startIndex);
      protectedText += f.redaction;
      lastIndex = f.endIndex;
    }
  }
  protectedText += text.substring(lastIndex);

  // Category statistics
  const categoryStats = {
    privacy: { count: 0, severityHigh: 0, severityMed: 0 },
    credential: { count: 0, severityHigh: 0, severityMed: 0 },
    financial: { count: 0, severityHigh: 0, severityMed: 0 },
    socialEngineering: { count: 0, severityHigh: 0, severityMed: 0 },
  };

  rawFindings.forEach(f => {
    const cat = f.category === 'socialEngineering' ? 'socialEngineering' : f.category;
    if (categoryStats[cat]) {
      categoryStats[cat].count++;
      if (f.severity === 'High') categoryStats[cat].severityHigh++;
      if (f.severity === 'Medium') categoryStats[cat].severityMed++;
    }
  });

  const getCategoryLevel = (stats) => {
    if (stats.severityHigh > 0) return 'High';
    if (stats.severityMed > 0 || stats.count > 1) return 'Medium';
    if (stats.count > 0) return 'Low';
    return 'Safe';
  };

  const categories = {
    privacy: {
      level: getCategoryLevel(categoryStats.privacy),
      count: categoryStats.privacy.count,
      label: 'Privacy Risk',
    },
    credential: {
      level: getCategoryLevel(categoryStats.credential),
      count: categoryStats.credential.count,
      label: 'Credential Risk',
    },
    financial: {
      level: getCategoryLevel(categoryStats.financial),
      count: categoryStats.financial.count,
      label: 'Financial Risk',
    },
    socialEngineering: {
      level: getCategoryLevel(categoryStats.socialEngineering),
      count: categoryStats.socialEngineering.count,
      label: 'Social Engineering',
    },
  };

  // Calculate Overall Risk Score (0 - 100)
  let baseScore = 0;
  rawFindings.forEach(f => {
    if (f.severity === 'High') baseScore += 26;
    else if (f.severity === 'Medium') baseScore += 16;
    else baseScore += 6;
  });

  let score = Math.min(100, Math.max(0, baseScore));
  if (rawFindings.length === 0) {
    score = 0;
  } else if (score < 25) {
    score = Math.max(25, score);
  }

  let level = 'SAFE';
  if (score >= 71) level = 'HIGH RISK';
  else if (score >= 41) level = 'MEDIUM RISK';
  else if (score >= 21) level = 'LOW RISK';
  else level = 'SAFE';

  return {
    score,
    level,
    issuesCount: rawFindings.length,
    categories,
    findings: rawFindings,
    originalText: text,
    protectedText,
    analyzedAt: new Date().toISOString(),
  };
}
