import { useEffect, useId, useRef } from 'react'
import './Companion.css'

export type CompanionMood = 'idle' | 'curious' | 'happy' | 'thinking' | 'talking' | 'walking' | 'dancing'
type CompanionSize = 'launcher' | 'header' | 'message'

interface CompanionProps {
  mood?: CompanionMood
  size?: CompanionSize
}

const clamp = (value: number, min: number, max: number) =>
  Math.min(max, Math.max(min, value))

export default function Companion({ mood = 'idle', size = 'header' }: CompanionProps) {
  const rootRef = useRef<HTMLSpanElement>(null)
  const id = useId().replace(/:/g, '')

  useEffect(() => {
    const rootRefValue = rootRef.current
    if (!rootRefValue || size === 'message' || window.matchMedia('(hover: none)').matches) return
    const root = rootRefValue as HTMLSpanElement

    let frame = 0

    function resetLook() {
      cancelAnimationFrame(frame)
      root.style.setProperty('--gaze-x', '0px')
      root.style.setProperty('--gaze-y', '0px')
      root.style.setProperty('--tilt', '0deg')
      root.dataset.attention = 'false'
    }

    function lookAtPointer(event: PointerEvent) {
      if (event.pointerType === 'touch') return

      cancelAnimationFrame(frame)
      frame = requestAnimationFrame(() => {
        const bounds = root.getBoundingClientRect()
        if (!bounds.width || !bounds.height) return

        const dx = event.clientX - (bounds.left + bounds.width / 2)
        const dy = event.clientY - (bounds.top + bounds.height / 2)
        const distance = Math.hypot(dx, dy)
        root.style.setProperty('--gaze-x', `${clamp(dx / (bounds.width * 0.62), -1, 1) * 2.5}px`)
        root.style.setProperty('--gaze-y', `${clamp(dy / (bounds.height * 0.62), -1, 1) * 2}px`)
        root.style.setProperty('--tilt', `${clamp(dx / 30, -1, 1) * 4}deg`)
        root.dataset.attention = String(distance < Math.max(145, bounds.width * 2.2))
      })
    }

    function leavePage(event: PointerEvent) {
      if (!event.relatedTarget) resetLook()
    }

    window.addEventListener('pointermove', lookAtPointer, { passive: true })
    document.addEventListener('pointerout', leavePage, true)
    return () => {
      window.removeEventListener('pointermove', lookAtPointer)
      document.removeEventListener('pointerout', leavePage, true)
      cancelAnimationFrame(frame)
    }
  }, [size])

  return (
    <span
      ref={rootRef}
      className="companion"
      data-mood={mood}
      data-size={size}
      data-attention="false"
      aria-hidden="true"
    >
      <svg className="companion__art" viewBox="0 0 100 100" fill="none">
        <defs>
          <linearGradient id={`forest-fur-${id}`} x1="23" y1="18" x2="72" y2="84" gradientUnits="userSpaceOnUse">
            <stop stopColor="#f3f3d9" />
            <stop offset=".42" stopColor="#d4e3b4" />
            <stop offset="1" stopColor="#91ad70" />
          </linearGradient>
          <linearGradient id={`forest-ear-${id}`} x1="20" y1="10" x2="35" y2="36" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9dc17d" />
            <stop offset="1" stopColor="#55744b" />
          </linearGradient>
          <linearGradient id={`forest-tail-${id}`} x1="66" y1="55" x2="90" y2="79" gradientUnits="userSpaceOnUse">
            <stop stopColor="#9fc27c" />
            <stop offset="1" stopColor="#52734c" />
          </linearGradient>
          <radialGradient id={`forest-glow-${id}`} cx="0" cy="0" r="1" gradientTransform="matrix(0 45 -45 0 50 51)" gradientUnits="userSpaceOnUse">
            <stop stopColor="#bad58d" stopOpacity=".32" />
            <stop offset="1" stopColor="#bad58d" stopOpacity="0" />
          </radialGradient>
          <filter id={`forest-shadow-${id}`} x="17" y="12" width="75" height="90" colorInterpolationFilters="sRGB" filterUnits="userSpaceOnUse">
            <feGaussianBlur stdDeviation="2.5" />
          </filter>
        </defs>

        <circle cx="50" cy="51" r="46" fill={`url(#forest-glow-${id})`} />
        <ellipse cx="50" cy="91" rx="20" ry="3.3" fill="#7e9d62" opacity=".25" filter={`url(#forest-shadow-${id})`} />

        <g className="companion__body">
          <path className="companion__tail" d="M67 69c10 2 18-2 19-10 1-6-4-10-9-8-5 2-5 7-2 9-5 4-10 4-14 0" fill={`url(#forest-tail-${id})`} stroke="#e2efc8" strokeWidth="1.6" />
          <path className="companion__tail-leaf" d="M77 53c4-7 11-8 14-7-1 6-5 11-12 12" fill="#b9cf83" stroke="#e4efc2" strokeWidth="1.2" />
          <path d="M80 51c3-1 6-3 9-5" stroke="#6f8d55" strokeWidth="1.2" strokeLinecap="round" />

          <path d="M35 34c-11-2-19-12-17-24 10 2 19 8 23 19" fill={`url(#forest-ear-${id})`} stroke="#e5efce" strokeWidth="1.4" />
          <path d="M28 29c-4-4-6-8-6-13 6 3 10 7 13 12" fill="#d99591" opacity=".82" />
          <path d="M64 29c4-11 13-18 24-19 2 12-6 23-18 25" fill={`url(#forest-ear-${id})`} stroke="#e5efce" strokeWidth="1.4" />
          <path d="M71 28c4-6 8-9 13-11 0 6-3 11-8 15" fill="#d99591" opacity=".82" />

          <path className="companion__leaf" d="M49 22c-6-6-5-12 0-17 6 5 7 11 0 17Z" fill="#789b5a" stroke="#e5efce" strokeWidth="1.2" />
          <path d="M49 20V9" stroke="#dce9b9" strokeWidth="1.1" strokeLinecap="round" />

          <path d="M50 24c-17 0-28 11-29 28l-1 8c-1 16 10 24 30 24s31-8 30-24l-1-8c-1-17-12-28-29-28Z" fill="#536b49" opacity=".28" transform="translate(0 2)" />
          <path d="M50 22c-17 0-28 11-29 28l-1 8c-1 16 10 24 30 24s31-8 30-24l-1-8c-1-17-12-28-29-28Z" fill={`url(#forest-fur-${id})`} stroke="#f4f3dd" strokeWidth="1.5" />
          <path d="M30 34c5-6 12-9 20-9" stroke="white" strokeOpacity=".55" strokeWidth="2" strokeLinecap="round" />

          <g className="companion__eye">
            <ellipse cx="39" cy="48" rx="5.8" ry="7" fill="#fff9e9" />
            <g className="companion__pupil-track">
              <ellipse cx="40" cy="48.5" rx="3.1" ry="4.5" fill="#54734a" />
              <ellipse cx="40.5" cy="48.5" rx="1.65" ry="2.9" fill="#1c2920" />
              <circle cx="41.3" cy="46.9" r=".9" fill="white" />
            </g>
          </g>
          <g className="companion__eye">
            <ellipse cx="61" cy="48" rx="5.8" ry="7" fill="#fff9e9" />
            <g className="companion__pupil-track">
              <ellipse cx="62" cy="48.5" rx="3.1" ry="4.5" fill="#54734a" />
              <ellipse cx="62.5" cy="48.5" rx="1.65" ry="2.9" fill="#1c2920" />
              <circle cx="63.3" cy="46.9" r=".9" fill="white" />
            </g>
          </g>

          <ellipse cx="50" cy="59" rx="13" ry="9" fill="#f4f0d9" />
          <path d="M47 56.5c0-1.9 1.3-3.1 3-3.1s3 1.2 3 3.1c0 2-3 3.8-3 3.8s-3-1.8-3-3.8Z" fill="#63483e" />
          <path className="companion__mouth" d="M46 63c2.1 2.3 5.9 2.3 8 0" stroke="#75564a" strokeWidth="1.8" strokeLinecap="round" />
          <ellipse className="companion__talk-mouth" cx="50" cy="63" rx="2.6" ry="2.3" fill="#855c4e" />
          <circle cx="31" cy="58" r="2" fill="#d58f86" opacity=".72" />
          <circle cx="69" cy="58" r="2" fill="#d58f86" opacity=".72" />

          <path className="companion__leg companion__leg--left" d="M38 81v6c0 2 2 3 5 3" stroke="#708b53" strokeWidth="4" strokeLinecap="round" />
          <path className="companion__leg companion__leg--right" d="M62 81v6c0 2-2 3-5 3" stroke="#708b53" strokeWidth="4" strokeLinecap="round" />
        </g>
      </svg>
    </span>
  )
}
