import { animateMini } from 'motion';

export function animatePress(target: Element): void {
  animateMini(target, { transform: ['scale(1)', 'scale(0.92)', 'scale(1)'] }, { duration: 0.22, ease: 'easeOut' });
}

export function animateFadeScale(target: Element): void {
  animateMini(target, { opacity: ['0.5', '1'], transform: ['scale(0.96)', 'scale(1)'] }, { duration: 0.26, ease: 'easeOut' });
}

export function animatePageIn(containerSelector: string): void {
  const nodes = document.querySelectorAll(`${containerSelector} .reveal`);
  nodes.forEach((node, index) => {
    animateMini(
      node,
      { opacity: ['0', '1'], transform: ['translateY(20px)', 'translateY(0px)'] },
      { duration: 0.4, delay: index * 0.05, ease: 'easeOut' }
    );
  });
}
