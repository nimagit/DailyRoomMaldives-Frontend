import { motion } from 'framer-motion';

/**
 * Wraps children with a smooth fade-up animation that triggers
 * every time the element enters the viewport (scrolling down OR up).
 *
 * Props:
 *  delay    – stagger offset in seconds (default 0)
 *  duration – animation length in seconds (default 0.6)
 *  y        – vertical travel distance in px (default 32)
 *  once     – if true, only animates on first enter (default false)
 *  className – forwarded to the wrapper div
 */
const EASE = [0.22, 1, 0.36, 1]; // easeOutExpo — fast start, silky finish

export default function FadeUp({
  children,
  delay    = 0,
  duration = 0.6,
  y        = 32,
  once     = false,
  className = '',
  as       = 'div',
}) {
  const Component = motion[as] || motion.div;
  return (
    <Component
      initial={{ opacity: 0, y }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once, margin: '0px 0px -60px 0px' }}
      transition={{ duration, delay, ease: EASE }}
      className={className}
    >
      {children}
    </Component>
  );
}
