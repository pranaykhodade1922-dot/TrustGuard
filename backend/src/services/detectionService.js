/**
 * TrustGuard AI — Deterministic Detection Service
 * Pinpoints exact sensitive data patterns using validated regex & algorithmic checksums.
 * Every detected item contains exact span copied directly from input text.
 */

/**
 * Validates a number string using the Luhn checksum algorithm (ISO/IEC 7812-1)
 * @param {string} numberString
 * @returns {boolean}
 */
export function isValidLuhn(numberString) {
  const digitsOnly = numberString.replace(/\D/g, '');
  if (digitsOnly.length < 13 || digitsOnly.length > 19) return false;

  let sum = 0;
  let alternate = false;
  for (let i = digitsOnly.length - 1; i >= 0; i--) {
    let n = parseInt(digitsOnly.charAt(i), 10);
    if (alternate) {
      n *= 2;
      if (n > 9) n = (n % 10) + 1;
    }
    sum += n;
    alternate = !alternate;
  }
  return sum % 10 === 0;
}

export const detectionService = {
  /**
   * Detects email addresses
   */
  detectEmails(text) {
    const findings = [];
    const regex = /\b[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}\b/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'PII',
        reason: 'Direct email address detected in text.',
      });
    }
    return findings;
  },

  /**
   * Detects telephone and mobile numbers
   */
  detectPhoneNumbers(text) {
    const findings = [];
    // Matches international (+XX...) or formatted phone numbers (with hyphens, dots, parentheses, or spaces)
    const regex = /(?:\+\d{1,3}[-.\s]?)?\(?\d{3}\)?[-.\s]\d{3}[-.\s]\d{4}\b|\+\d{1,3}\s?\d{9,12}\b/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const span = match[0].trim();
      const digits = span.replace(/\D/g, '');
      if (digits.length >= 10 && digits.length <= 15) {
        findings.push({
          span,
          category: 'PII',
          reason: 'Personal or business phone number detected.',
        });
      }
    }
    return findings;
  },

  /**
   * Detects credit and debit card numbers with Luhn verification
   */
  detectCreditCards(text) {
    const findings = [];
    // 16-digit (and 15-digit Amex) card patterns with optional separators
    const regex = /\b(?:\d{4}[-\s]?){3}\d{4}\b|\b\d{4}[-\s]?\d{6}[-\s]?\d{5}\b/g;
    let match;
    while ((match = regex.exec(text)) !== null) {
      const span = match[0];
      if (isValidLuhn(span)) {
        findings.push({
          span,
          category: 'FINANCIAL',
          reason: 'Valid credit/debit payment card number detected (passes Luhn checksum).',
        });
      }
    }
    return findings;
  },

  /**
   * Detects exposed API keys, bearer tokens, cloud credentials, and private keys
   */
  detectApiKeys(text) {
    const findings = [];

    // OpenAI keys (legacy & project tokens)
    const openaiRegex = /\bsk-(?:proj-|live-)?[A-Za-z0-9_-]{32,}\b/g;
    let match;
    while ((match = openaiRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'CREDENTIAL',
        reason: 'OpenAI API secret key detected.',
      });
    }

    // AWS Access Key IDs
    const awsRegex = /\b(?:AKIA|ABIA|ACCA|ASIA)[0-9A-Z]{16}\b/g;
    while ((match = awsRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'CREDENTIAL',
        reason: 'Amazon Web Services (AWS) Access Key ID detected.',
      });
    }

    // GitHub Personal Access Tokens
    const ghRegex = /\b(?:ghp|gho|ghu|ghs|ghr)_[A-Za-z0-9_]{36}\b/g;
    while ((match = ghRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'CREDENTIAL',
        reason: 'GitHub personal authentication token detected.',
      });
    }

    // Slack tokens
    const slackRegex = /\bxox[baprs]-[0-9]{10,13}-[0-9]{10,13}-[a-zA-Z0-9]{24,32}\b/g;
    while ((match = slackRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'CREDENTIAL',
        reason: 'Slack workspace access token detected.',
      });
    }

    // Cryptographic Private Keys
    const privateKeyRegex = /-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----[\s\S]*?-----END (?:RSA |EC |OPENSSH )?PRIVATE KEY-----/g;
    while ((match = privateKeyRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'CREDENTIAL',
        reason: 'Raw cryptographic private key detected.',
      });
    }

    // Explicit Bearer Tokens / Authorization Headers
    const bearerRegex = /Authorization:\s*Bearer\s+([A-Za-z0-9_.-]{24,})/gi;
    while ((match = bearerRegex.exec(text)) !== null) {
      const fullSpan = match[0];
      findings.push({
        span: match[1] && text.includes(match[1]) ? match[1] : fullSpan,
        category: 'CREDENTIAL',
        reason: 'HTTP Bearer authorization token detected.',
      });
    }

    return findings;
  },

  /**
   * Detects explicit plaintext password assignments
   */
  detectPasswords(text) {
    const findings = [];
    const pwdRegex = /(?:password|passwd|pwd)\s*[:=]\s*['"]?([^\s'"]{6,})['"]?/gi;
    let match;
    while ((match = pwdRegex.exec(text)) !== null) {
      const passwordVal = match[1];
      if (passwordVal && text.includes(passwordVal)) {
        findings.push({
          span: passwordVal,
          category: 'CREDENTIAL',
          reason: 'Hardcoded plaintext password detected.',
        });
      }
    }
    return findings;
  },

  /**
   * Detects national government identifiers (Aadhaar, PAN, SSN)
   */
  detectGovernmentIds(text) {
    const findings = [];

    // Indian Aadhaar (12 digits, spaced or hyphenated)
    const aadhaarRegex = /\b[2-9]\d{3}[-\s]\d{4}[-\s]\d{4}\b/g;
    let match;
    while ((match = aadhaarRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'PII',
        reason: 'Indian Aadhaar national identity number detected.',
      });
    }

    // Indian PAN (5 uppercase letters + 4 digits + 1 letter)
    const panRegex = /\b[A-Z]{5}[0-9]{4}[A-Z]\b/g;
    while ((match = panRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'PII',
        reason: 'Indian Income Tax PAN identifier detected.',
      });
    }

    // US Social Security Number (SSN: 3-2-4 digits)
    const ssnRegex = /\b(?!000|666|9\d{2})\d{3}[-\s](?!00)\d{2}[-\s](?!0000)\d{4}\b/g;
    while ((match = ssnRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'PII',
        reason: 'US Social Security Number (SSN) detected.',
      });
    }

    return findings;
  },

  /**
   * Detects financial information (UPI addresses, IFSC codes, bank routing numbers, transaction sums)
   */
  detectFinancialInfo(text) {
    const findings = [];

    // Virtual Payment Addresses (UPI Handles: user@bankname, e.g. user@okhdfcbank, user@paytm, user@upi)
    // Exclude standard domains ending in .com, .org, .net, .edu, .io, .ai, .in, etc.
    const upiRegex = /\b[a-zA-Z0-9.\-_]{2,64}@(?!gmail|yahoo|hotmail|outlook|icloud|proton|aol|mail|acme)[a-zA-Z]{2,32}(?!\.[a-zA-Z]{2,})\b/g;
    let match;
    while ((match = upiRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'FINANCIAL',
        reason: 'Virtual Payment Address (UPI handle) detected.',
      });
    }

    // Indian Bank IFSC Code (4 letters + '0' + 6 alphanumeric)
    const ifscRegex = /\b[A-Z]{4}0[A-Z0-9]{6}\b/g;
    while ((match = ifscRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'FINANCIAL',
        reason: 'Bank routing identifier (IFSC code) detected.',
      });
    }

    // Bank Account Number (labeled explicitly: Account: 123456789012)
    const accountRegex = /(?:Account(?:\s*Number)?|A\/C|acc\s*no\.?)\s*[:=]?\s*(\d{9,18})\b/gi;
    while ((match = accountRegex.exec(text)) !== null) {
      const acctNum = match[1];
      if (acctNum && text.includes(acctNum)) {
        findings.push({
          span: acctNum,
          category: 'FINANCIAL',
          reason: 'Bank account number detected.',
        });
      }
    }

    // Transaction amounts (e.g. ₹48,500, $5,000.00)
    const amountRegex = /(?:₹|\$|€|£|INR|USD)\s*[\d,]+(?:\.\d{1,2})?\b/gi;
    while ((match = amountRegex.exec(text)) !== null) {
      findings.push({
        span: match[0],
        category: 'FINANCIAL',
        reason: 'Specific financial transaction amount detected.',
      });
    }

    return findings;
  },

  /**
   * Runs all deterministic detectors against input text
   * @param {string} text - Raw input content
   * @returns {Array<{ span: string, category: string, reason: string }>}
   */
  detectAll(text) {
    if (!text || typeof text !== 'string') return [];

    const all = [
      ...this.detectEmails(text),
      ...this.detectPhoneNumbers(text),
      ...this.detectCreditCards(text),
      ...this.detectApiKeys(text),
      ...this.detectPasswords(text),
      ...this.detectGovernmentIds(text),
      ...this.detectFinancialInfo(text),
    ];

    return all;
  },
};
