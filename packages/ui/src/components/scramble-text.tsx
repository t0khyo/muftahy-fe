import { useEffect, useState } from 'react'
import { cn } from 'cn'

export type ScrambleDirection = 'forward' | 'reverse'

export type ScrambleTextProps = {
  children: string
  className?: string
  intervalMs?: number
  direction?: ScrambleDirection
  announce?: boolean
  srText?: string
}

export type ScrambleMaskTextProps = {
  value: string
  mask: string
  revealed: boolean
  revealIntervalMs?: number
  hideIntervalMs?: number
  hideDirection?: ScrambleDirection
  hiddenAriaText?: string
  className?: string
}

const ENCRYPTED_TEXT_CHARS = '-_~`!@#$%^&*()+=[]{}|;:,.<>?'
const MAX_REVEAL_STEPS = 48

type ScrambleMode = 'random' | 'stable'

function getTextSegments(text: string): string[] {
  if (typeof Intl !== 'undefined' && 'Segmenter' in Intl) {
    const segmenter = new Intl.Segmenter(undefined, {
      granularity: 'grapheme',
    })

    return Array.from(segmenter.segment(text), ({ segment }) => segment)
  }

  return Array.from(text)
}

function getRandomEncryptedTextChar(): string {
  return ENCRYPTED_TEXT_CHARS.charAt(
    Math.floor(Math.random() * ENCRYPTED_TEXT_CHARS.length),
  )
}

function getStableEncryptedTextChar(segment: string, index: number): string {
  let hash = index + 1

  for (const character of segment) {
    hash = (hash * 31 + (character.codePointAt(0) ?? 0)) % 2147483647
  }

  return ENCRYPTED_TEXT_CHARS.charAt(hash % ENCRYPTED_TEXT_CHARS.length)
}

function getEncryptedTextChar(
  segment: string,
  index: number,
  mode: ScrambleMode,
): string {
  return mode === 'stable'
    ? getStableEncryptedTextChar(segment, index)
    : getRandomEncryptedTextChar()
}

function shouldPreserveSegment(segment: string): boolean {
  return segment.trim() === ''
}

function scrambleSegments(
  segments: string[],
  revealedCount: number,
  mode: ScrambleMode,
  direction: ScrambleDirection = 'forward',
): string {
  const segmentCount = segments.length

  return segments
    .map((character, index) => {
      const isSettled =
        direction === 'forward'
          ? index < revealedCount
          : index >= segmentCount - revealedCount

      if (shouldPreserveSegment(character) || isSettled) {
        return character
      }

      return getEncryptedTextChar(character, index, mode)
    })
    .join('')
}

function scrambleText(
  text: string,
  revealedCount: number,
  mode: ScrambleMode,
  direction: ScrambleDirection = 'forward',
): string {
  return scrambleSegments(
    getTextSegments(text),
    revealedCount,
    mode,
    direction,
  )
}

function getRevealStep(segmentCount: number): number {
  return Math.max(1, Math.ceil(segmentCount / MAX_REVEAL_STEPS))
}

function shouldReduceMotion(): boolean {
  if (typeof window === 'undefined' || typeof window.matchMedia !== 'function') {
    return false
  }

  return window.matchMedia('(prefers-reduced-motion: reduce)').matches
}

/** Animated decryption-style text reveal that respects reduced-motion and announces text politely. */
export function ScrambleText({
  children,
  className,
  intervalMs = 32,
  direction = 'forward',
  announce = true,
  srText,
}: ScrambleTextProps) {
  const [animationState, setAnimationState] = useState(() => ({
    source: children,
    intervalMs,
    direction,
    text: scrambleText(children, 0, 'stable', direction),
  }))

  if (
    animationState.source !== children ||
    animationState.intervalMs !== intervalMs ||
    animationState.direction !== direction
  ) {
    setAnimationState({
      source: children,
      intervalMs,
      direction,
      text: scrambleText(children, 0, 'stable', direction),
    })
  }

  useEffect(() => {
    const segments = getTextSegments(children)

    if (segments.length === 0 || intervalMs <= 0 || shouldReduceMotion()) {
      return
    }

    let revealedCount = 0
    const revealStep = getRevealStep(segments.length)

    const timer = window.setInterval(() => {
      revealedCount = Math.min(segments.length, revealedCount + revealStep)
      setAnimationState({
        source: children,
        intervalMs,
        direction,
        text: scrambleSegments(segments, revealedCount, 'random', direction),
      })

      if (revealedCount >= segments.length) {
        window.clearInterval(timer)
      }
    }, intervalMs)

    return () => {
      window.clearInterval(timer)
    }
  }, [children, intervalMs, direction])

  const isStatic =
    children.length === 0 || intervalMs <= 0 || shouldReduceMotion()
  const displayText = isStatic
    ? children
    : animationState.source === children &&
        animationState.intervalMs === intervalMs &&
        animationState.direction === direction
      ? animationState.text
      : scrambleText(children, 0, 'stable', direction)
  const accessibleText = srText ?? children

  return (
    <span className={cn('inline-block', className)}>
      <span aria-hidden="true">{displayText}</span>
      {accessibleText ? (
        <span
          aria-atomic={announce ? 'true' : undefined}
          aria-live={announce ? 'polite' : undefined}
          className="sr-only select-none"
        >
          {accessibleText}
        </span>
      ) : null}
    </span>
  )
}

/** Toggles between a static initial mask, scrambled reveal, and reverse-scrambled hide transition. */
export function ScrambleMaskText({
  value,
  mask,
  revealed,
  revealIntervalMs = 32,
  hideIntervalMs = 24,
  hideDirection = 'reverse',
  hiddenAriaText,
  className,
}: ScrambleMaskTextProps) {
  const [prevRevealed, setPrevRevealed] = useState(revealed)
  const [hasToggled, setHasToggled] = useState(revealed)

  if (revealed !== prevRevealed) {
    setPrevRevealed(revealed)
    setHasToggled(true)
  }

  if (!hasToggled && !revealed) {
    return <span className={cn('inline-block', className)}>{mask}</span>
  }

  if (revealed) {
    return (
      <ScrambleText
        key="reveal"
        intervalMs={revealIntervalMs}
        className={className}
      >
        {value}
      </ScrambleText>
    )
  }

  return (
    <ScrambleText
      key="hide"
      intervalMs={hideIntervalMs}
      direction={hideDirection}
      announce={Boolean(hiddenAriaText)}
      srText={hiddenAriaText ?? ''}
      className={className}
    >
      {mask}
    </ScrambleText>
  )
}
