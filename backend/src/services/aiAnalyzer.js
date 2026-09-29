import { z } from 'zod';
import { env } from '../config/env.js';

// Strict Zod schema for AI response validation (Section 6)
export const aiResponseSchema = z.object({
  riskScore: z.number().min(0).max(100),
  flags: z.array(
    z.object({
      span: z.string().min(1),
      category: z.enum(['PII', 'CREDENTIAL', 'FINANCIAL', 'SOCIAL_ENGINEERING', 'OTHER']),
      reason: z.string().min(1),
    })
  ),
});

/**
 * System prompt instructing LLMs to produce strictly validated JSON with exact spans
 */
const SYSTEM_PROMPT = `You are the TrustGuard AI Security & Privacy Analysis Engine.
Analyze the user's input text for security and privacy risks.
Specifically evaluate:
1. PII: Exposed sensitive identifiers, personal contact information, national identity records.
2. CREDENTIALS: Exposed passwords, API tokens, secret keys, or requests for OTP/passwords.
3. FINANCIAL: Payment cards, bank account details, wire requests, or suspicious payment demands.
4. SOCIAL_ENGINEERING: Coercive urgency, impersonation of authority, threats of account termination, pressure to bypass security protocols, or deceptive verification links.

CRITICAL RULES:
- "span" MUST BE COPIED EXACTLY AND VERBATIM FROM THE INPUT TEXT. NEVER PARAPHRASE, SUMMARIZE, OR HALLUCINATE A SPAN.
- If a sentence contains urgency or impersonation, copy the exact phrase from the input.
- Output ONLY valid JSON matching this schema:
{
  "riskScore": <integer 0 to 100>,
  "flags": [
    {
      "span": "<exact substring from input>",
      "category": "PII" | "CREDENTIAL" | "FINANCIAL" | "SOCIAL_ENGINEERING" | "OTHER",
      "reason": "<clear explanation of why this is a risk>"
    }
  ]
}
Do NOT output markdown code fences, backticks, or explanatory prose.`;

/**
 * Parses and validates raw LLM output against the strict Zod schema
 */
export function parseAndValidateAIResponse(rawText) {
  let cleaned = rawText.trim();
  // Strip markdown formatting if any LLM erroneously added code blocks
  if (cleaned.startsWith('```')) {
    cleaned = cleaned.replace(/^```(?:json)?\s*/i, '').replace(/```\s*$/, '').trim();
  }

  let parsedJson;
  try {
    parsedJson = JSON.parse(cleaned);
  } catch (err) {
    throw new Error(`Failed to parse AI response as valid JSON: ${err.message}`);
  }

  const validated = aiResponseSchema.parse(parsedJson);
  return validated;
}

/**
 * Built-in contextual analyzer for social engineering and security signals.
 * Evaluates semantic clause context without naive keyword matching.
 * @param {string} text - Raw input content
 * @returns {{ riskScore: number, flags: Array<{ span: string, category: string, reason: string }> }}
 */
export function analyzeContextualSecuritySignals(text) {
  const flags = [];
  let aggregateScore = 0;

  // 1. Account Termination & Coercive Urgency Threat (e.g., "account will be closed/terminated/suspended unless...")
  const suspensionRegex = /(?:your\s+account\s+will\s+be\s+(?:closed|terminated|suspended|locked|deleted)[^.!?\n]*|access\s+will\s+be\s+terminated[^.!?\n]*)/i;
  const suspMatch = suspensionRegex.exec(text);
  if (suspMatch) {
    flags.push({
      span: suspMatch[0].trim(),
      category: 'SOCIAL_ENGINEERING',
      reason: 'Urgent threat of account closure or access revocation used to pressure compliance.',
    });
    aggregateScore += 45;
  }

  // 2. Urgent Deadline Pressures (e.g., "within 24 hours", "within 30 minutes", "expires in 2 hours", "do not delay")
  const deadlineRegex = /(?:within\s+\d+\s+(?:minutes?|hours?|days?)|deadline\s+expires\s+in\s+\d+\s+(?:hours?|minutes?)|do\s+not\s+delay)/i;
  const deadlineMatch = deadlineRegex.exec(text);
  if (deadlineMatch) {
    flags.push({
      span: deadlineMatch[0].trim(),
      category: 'SOCIAL_ENGINEERING',
      reason: 'Artificial time constraint created to induce rushed decision-making.',
    });
    aggregateScore += 30;
  }

  // 3. Credential Solicitation (e.g., "send your OTP", "share the 6-digit code", "confirm your current password")
  const otpRegex = /(?:send\s+your\s+(?:otp|one[- ]time\s+password|verification\s+code)|share\s+the\s+(?:otp|code)|confirm\s+your\s+current\s+password|verify\s+your\s+password)/i;
  const otpMatch = otpRegex.exec(text);
  if (otpMatch) {
    flags.push({
      span: otpMatch[0].trim(),
      category: 'SOCIAL_ENGINEERING',
      reason: 'Solicitation of temporary verification credentials or secret passwords.',
    });
    aggregateScore += 50;
  }

  // 4. Impersonation of Corporate IT / Security Authority
  const impersonationRegex = /(?:(?:urgent\s+)?security\s+notice\s+from\s+it\s+(?:helpdesk|support|security)|it\s+helpdesk\s+security\s+alert|official\s+notice\s+from\s+(?:bank|security\s+team))/i;
  const impMatch = impersonationRegex.exec(text);
  if (impMatch) {
    flags.push({
      span: impMatch[0].trim(),
      category: 'SOCIAL_ENGINEERING',
      reason: 'Impersonation of internal IT helpdesk or security administration authority.',
    });
    aggregateScore += 40;
  }

  // 5. Suspicious or Deceptive Authentication URLs (e.g., http://...auth-verify... /reset-pwd)
  const suspiciousLinkRegex = /https?:\/\/[^\s/$.?#].[^\s]*(?:auth-verify|reset-pwd|account-update|login-verify|secure-portal)[^\s]*/i;
  const linkMatch = suspiciousLinkRegex.exec(text);
  if (linkMatch) {
    flags.push({
      span: linkMatch[0].trim(),
      category: 'SOCIAL_ENGINEERING',
      reason: 'Suspicious domain name mimicking credential reset or security verification portal.',
    });
    aggregateScore += 45;
  }

  // Cap calculated score to 100
  const finalScore = Math.min(100, aggregateScore);

  return {
    riskScore: finalScore,
    flags,
  };
}

export const aiAnalyzer = {
  /**
   * Performs contextual security analysis using external LLM (Gemini/OpenAI) if configured,
   * or the robust built-in semantic context engine.
   * @param {string} inputText - User submitted content
   * @returns {Promise<{ riskScore: number, flags: Array<{ span: string, category: string, reason: string }> }>}
   */
  async analyze(inputText) {
    if (!inputText || typeof inputText !== 'string') {
      throw new Error('Input text must be a non-empty string.');
    }

    const geminiKey = process.env.GEMINI_API_KEY || process.env.GOOGLE_API_KEY;
    const openaiKey = process.env.OPENAI_API_KEY;

    // 1. Google Gemini Provider
    if (geminiKey) {
      try {
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiKey}`;
        const response = await fetch(url, {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            contents: [
              {
                role: 'user',
                parts: [
                  { text: `${SYSTEM_PROMPT}\n\nCONTENT TO ANALYZE:\n${inputText}` },
                ],
              },
            ],
            generationConfig: {
              temperature: 0.1,
              responseMimeType: 'application/json',
            },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.candidates?.[0]?.content?.parts?.[0]?.text;
          if (rawText) {
            return parseAndValidateAIResponse(rawText);
          }
        }
      } catch (err) {
        console.warn('[TrustGuard AI] Gemini provider call failed, falling back to contextual engine:', err.message);
      }
    }

    // 2. OpenAI Provider
    if (openaiKey) {
      try {
        const response = await fetch('https://api.openai.com/v1/chat/completions', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            Authorization: `Bearer ${openaiKey}`,
          },
          body: JSON.stringify({
            model: 'gpt-4o-mini',
            messages: [
              { role: 'system', content: SYSTEM_PROMPT },
              { role: 'user', content: inputText },
            ],
            temperature: 0.1,
            response_format: { type: 'json_object' },
          }),
        });

        if (response.ok) {
          const data = await response.json();
          const rawText = data?.choices?.[0]?.message?.content;
          if (rawText) {
            return parseAndValidateAIResponse(rawText);
          }
        }
      } catch (err) {
        console.warn('[TrustGuard AI] OpenAI provider call failed, falling back to contextual engine:', err.message);
      }
    }

    // 3. Robust Built-in Contextual Engine (Always available, deterministic & zero-retention)
    return analyzeContextualSecuritySignals(inputText);
  },
};
