import Anthropic from '@anthropic-ai/sdk'

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

interface GenerateContentParams {
  transcript: string
  platform: 'linkedin' | 'twitter' | 'newsletter'
  brandVoice?: string
  exampleContent?: string
}

interface GenerateContentResult {
  content: string
  tokensUsed: number
  costUsd: number
}

export async function generateContent(
  params: GenerateContentParams
): Promise<GenerateContentResult> {
  const { transcript, platform, brandVoice, exampleContent } = params

  // Import prompts dynamically based on platform
  const { getPrompt } = await import(`./prompts/${platform}`)
  const systemPrompt = getPrompt({ brandVoice, exampleContent })

  const response = await anthropic.messages.create({
    model: 'claude-sonnet-4-6',
    max_tokens: 2048,
    system: systemPrompt,
    messages: [
      {
        role: 'user',
        content: `Here is the source content to repurpose:\n\n${transcript}`,
      },
    ],
  })

  const textContent = response.content.find((block) => block.type === 'text')
  const content = textContent && 'text' in textContent ? textContent.text : ''

  const inputTokens = response.usage.input_tokens
  const outputTokens = response.usage.output_tokens
  const totalTokens = inputTokens + outputTokens

  // Sonnet pricing: $3/1M input, $15/1M output
  const costUsd = (inputTokens * 3 + outputTokens * 15) / 1_000_000

  return {
    content,
    tokensUsed: totalTokens,
    costUsd,
  }
}
