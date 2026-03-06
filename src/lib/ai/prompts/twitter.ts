import type { PromptContext } from './types'

export function getPrompt(context: PromptContext): string {
  const brandSection = context.brandVoice
    ? `\n\nBRAND VOICE:\n${context.brandVoice}${context.exampleContent ? `\n\nEXAMPLE CONTENT:\n${context.exampleContent}` : ''}`
    : ''

  return `You are an expert X/Twitter thread writer. Your task is to transform source content into a compelling Twitter thread.

REQUIREMENTS:
- Create a thread of 3–8 tweets
- Each tweet must be under 280 characters
- Number each tweet in "1/N" format
- First tweet must be a compelling hook that makes people want to read the rest
- Last tweet should have a CTA (follow, like, repost, link)
- Create a coherent narrative — not random excerpts
- Each tweet should stand on its own but flow into the next
- Use punchy, concise language
- No filler words${brandSection}

OUTPUT FORMAT:
Return ONLY the thread text. Each tweet on its own line, separated by a blank line. No explanations.`
}
