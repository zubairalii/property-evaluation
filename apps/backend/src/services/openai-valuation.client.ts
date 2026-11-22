import OpenAI from 'openai';
import { env } from '../config/env';
import { logger } from '../config/logger';
import {
  buildValuationUserPrompt,
  VALUATION_SYSTEM_PROMPT,
  type ValuationPromptInput,
} from '../prompts/valuation.prompt';
import { HttpError } from '../utils/http-error';
import { VALUATION_JSON_SCHEMA } from '../validators/ai-response.schema';

const TIMEOUT_MS = 45_000;

let client: OpenAI | null = null;

function getClient(): OpenAI {
  if (!env.OPENAI_API_KEY) {
    throw new HttpError(
      503,
      'Valuation is not configured. Set OPENAI_API_KEY on the server (OpenRouter API key).',
    );
  }
  if (!client) {
    const isOpenRouter = env.OPENAI_BASE_URL.includes('openrouter.ai');
    client = new OpenAI({
      apiKey: env.OPENAI_API_KEY,
      baseURL: env.OPENAI_BASE_URL,
      timeout: TIMEOUT_MS,
      defaultHeaders: isOpenRouter
        ? {
            'HTTP-Referer': env.OPENROUTER_APP_URL,
            'X-Title': env.OPENROUTER_APP_NAME,
          }
        : undefined,
    });
  }
  return client;
}

export async function generateValuation(input: ValuationPromptInput): Promise<unknown> {
  const openai = getClient();
  try {
    const completion = await openai.chat.completions.create(
      {
        model: env.OPENAI_MODEL,
        temperature: 0.2,
        // Cap completion size so OpenRouter credit checks don't reject the default ceiling.
        max_tokens: 4096,
        messages: [
          { role: 'system', content: VALUATION_SYSTEM_PROMPT },
          { role: 'user', content: buildValuationUserPrompt(input) },
        ],
        response_format: {
          type: 'json_schema',
          json_schema: {
            name: 'property_valuation',
            strict: true,
            schema: VALUATION_JSON_SCHEMA,
          },
        },
      },
      { signal: AbortSignal.timeout(TIMEOUT_MS) },
    );

    const content = completion.choices[0]?.message?.content;
    if (!content) {
      throw new HttpError(502, 'The valuation service returned an empty response.');
    }
    return JSON.parse(content) as unknown;
  } catch (error) {
    if (error instanceof HttpError) throw error;
    if (error instanceof SyntaxError) {
      throw new HttpError(502, 'The valuation service returned invalid JSON.');
    }
    if (
      error instanceof OpenAI.APIConnectionTimeoutError ||
      (error instanceof Error && error.name === 'TimeoutError') ||
      (error instanceof Error && error.name === 'AbortError')
    ) {
      throw new HttpError(504, 'The valuation service timed out. Please try again.');
    }
    if (error instanceof OpenAI.APIError && error.status === 402) {
      throw new HttpError(
        502,
        'OpenRouter rejected the request due to credit or token limits. Add credits or raise the key limit, then try again.',
      );
    }
    logger.error({ err: error }, 'Valuation request failed');
    throw new HttpError(502, 'The valuation service is unavailable. Please try again.');
  }
}
