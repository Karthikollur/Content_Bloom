import Link from 'next/link'
import { ArrowRight, Mic, FileText, Zap } from 'lucide-react'

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Nav */}
      <nav className="border-b border-border px-6 py-4">
        <div className="max-w-6xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-lg bg-accent flex items-center justify-center">
              <span className="text-background font-bold text-sm">CB</span>
            </div>
            <span className="text-text-primary font-semibold text-lg">ContentBloom</span>
          </div>
          <div className="flex items-center gap-4">
            <Link
              href="/login"
              className="text-text-secondary hover:text-text-primary transition-colors px-3 py-1.5"
            >
              Log in
            </Link>
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-hover text-background font-medium px-4 py-2 rounded-lg transition-colors"
            >
              Get Started
            </Link>
          </div>
        </div>
      </nav>

      {/* Hero */}
      <main className="max-w-6xl mx-auto px-6">
        <section className="py-24 text-center">
          <div className="inline-flex items-center gap-2 bg-accent-soft text-accent text-sm px-3 py-1 rounded-full mb-6">
            <Zap size={14} />
            <span>AI-Powered Content Repurposing</span>
          </div>
          <h1 className="text-5xl md:text-6xl font-bold text-text-primary mb-6 leading-tight">
            One piece of content.
            <br />
            <span className="text-accent">Every platform.</span>
          </h1>
          <p className="text-text-secondary text-lg md:text-xl max-w-2xl mx-auto mb-10">
            Upload a podcast, video, or blog post and get publish-ready content for LinkedIn,
            X/Twitter, and newsletters — all matching your brand voice.
          </p>
          <div className="flex items-center justify-center gap-4">
            <Link
              href="/signup"
              className="bg-accent hover:bg-accent-hover text-background font-medium px-6 py-3 rounded-lg transition-colors flex items-center gap-2"
            >
              Start for Free
              <ArrowRight size={18} />
            </Link>
          </div>
        </section>

        {/* Features */}
        <section className="py-16 grid md:grid-cols-3 gap-6">
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <Mic className="text-accent" size={20} />
            </div>
            <h3 className="text-text-primary font-semibold mb-2">Multi-Format Input</h3>
            <p className="text-text-secondary text-sm">
              Upload audio, video, or paste text. We handle MP3, WAV, MP4, MOV, YouTube URLs, and
              blog links.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <Zap className="text-accent" size={20} />
            </div>
            <h3 className="text-text-primary font-semibold mb-2">AI-Powered Generation</h3>
            <p className="text-text-secondary text-sm">
              Claude and Deepgram work together to transcribe and transform your content into
              platform-optimized posts.
            </p>
          </div>
          <div className="bg-surface border border-border rounded-lg p-6">
            <div className="w-10 h-10 rounded-lg bg-accent-soft flex items-center justify-center mb-4">
              <FileText className="text-accent" size={20} />
            </div>
            <h3 className="text-text-primary font-semibold mb-2">Your Brand Voice</h3>
            <p className="text-text-secondary text-sm">
              Define your writing style once. Every output reflects your unique tone, vocabulary, and
              personality.
            </p>
          </div>
        </section>
      </main>

      {/* Footer */}
      <footer className="border-t border-border px-6 py-8 mt-16">
        <div className="max-w-6xl mx-auto text-center text-text-tertiary text-sm">
          &copy; {new Date().getFullYear()} ContentBloom. All rights reserved.
        </div>
      </footer>
    </div>
  )
}
