import type { PromptContext } from './types'

export function getPrompt(context: PromptContext): string {
  const brandSection = context.brandVoice
    ? `\n\nBRAND VOICE:\n${context.brandVoice}${context.exampleContent ? `\n\nEXAMPLE CONTENT:\n${context.exampleContent}` : ''}`
    : ''

  return `You are an expert newsletter writer. Your task is to transform source content into a newsletter-ready snippet.

REQUIREMENTS:
- 200–400 words, email-ready format
- Include a subject line suggestion at the top (prefixed with "Subject: ")
- Use short paragraphs for easy scanning
- Bold key points using **markdown bold**
- Include a clear CTA at the end
- Write in a conversational, direct style
- Make it copy-paste ready for Substack, Beehiiv, or ConvertKit
- Do NOT use HTML — use markdown formatting only${brandSection}

OUTPUT FORMAT:
Return the subject line on the first line (prefixed with "Subject: "), then a blank line, then the newsletter body. No other explanations.`
}
