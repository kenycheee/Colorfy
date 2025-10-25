'use client';

import { useEffect } from 'react';

export default function ClientEffects() {
  useEffect(() => {
    // Smooth scrolling untuk anchor di page ini
    const anchors = document.querySelectorAll('a[href^="#"]');
    const onClick = (e: Event) => {
      const a = e.currentTarget as HTMLAnchorElement;
      const target = document.querySelector(a.getAttribute('href') || '');
      if (target) {
        e.preventDefault();
        target.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    };
    anchors.forEach(a => a.addEventListener('click', onClick));

    // Intersection Observer
    const observer = new IntersectionObserver(
      entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) {
            (entry.target as HTMLElement).style.animation = 'fadeInUp 0.8s ease-out forwards';
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.1, rootMargin: '0px 0px -100px 0px' }
    );
    document.querySelectorAll('.feature-card, .step').forEach(el => {
      (el as HTMLElement).style.opacity = '0';
      observer.observe(el);
    });

    // Button click particles
    const buttons = document.querySelectorAll('.btn-primary, .btn-secondary, .btn-white, .cta-button');
    const onButtonClick = (e: Event) => {
      const ev = e as MouseEvent;
      for (let i = 0; i < 5; i++) createParticle(ev.clientX, ev.clientY);
    };
    buttons.forEach(b => b.addEventListener('click', onButtonClick));

    // Color swatches ripple + copy
    const swatches = document.querySelectorAll('.color-swatch');
    const onSwatchClick = function (this: HTMLElement) {
      const ripple = document.createElement('div');
      Object.assign(ripple.style, {
        position: 'absolute',
        width: '10px',
        height: '10px',
        background: 'rgba(255,255,255,0.5)',
        borderRadius: '50%',
        transform: 'scale(0)',
        animation: 'ripple 0.6s ease-out',
        top: '50%',
        left: '50%',
        marginLeft: '-5px',
        marginTop: '-5px'
      } as CSSStyleDeclaration);
      this.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);

      const code = this.querySelector('.color-code')?.textContent;
      if (code && code !== 'Gradient') {
        navigator.clipboard.writeText(code).then(() => showNotification(`Copied ${code} to clipboard!`));
      }
    };
    swatches.forEach(s => s.addEventListener('click', onSwatchClick as any));

    // Inject keyframes for notification/ripple (sama seperti script lama)
    const style = document.createElement('style');
    style.textContent = `
      @keyframes slideInRight { from { transform: translateX(100%); opacity: 0; } to { transform: translateX(0); opacity: 1; } }
      @keyframes slideOutRight { from { transform: translateX(0); opacity: 1; } to { transform: translateX(100%); opacity: 0; } }
      @keyframes ripple { to { transform: scale(20); opacity: 0; } }
    `;
    document.head.appendChild(style);

    return () => {
      anchors.forEach(a => a.removeEventListener('click', onClick));
      buttons.forEach(b => b.removeEventListener('click', onButtonClick));
      swatches.forEach(s => s.removeEventListener('click', onSwatchClick as any));
      style.remove();
      observer.disconnect();
    };
  }, []);

  return null;
}

function createParticle(x: number, y: number) {
  const particle = document.createElement('div');
  Object.assign(particle.style, {
    position: 'fixed',
    width: '8px',
    height: '8px',
    background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
    borderRadius: '50%',
    pointerEvents: 'none',
    left: `${x}px`,
    top: `${y}px`,
    zIndex: '9999'
  } as CSSStyleDeclaration);

  const angle = Math.random() * Math.PI * 2;
  const distance = 50 + Math.random() * 50;
  const endX = x + Math.cos(angle) * distance;
  const endY = y + Math.sin(angle) * distance;

  document.body.appendChild(particle);
  particle.animate(
    [
      { transform: 'translate(0, 0) scale(1)', opacity: 1 },
      { transform: `translate(${endX - x}px, ${endY - y}px) scale(0)`, opacity: 0 }
    ],
    { duration: 800, easing: 'cubic-bezier(0, .9, .57, 1)' }
  ).onfinish = () => particle.remove();
}

export function showNotification(message: string) {
  const n = document.createElement('div');
  n.textContent = message;
  Object.assign(n.style, {
    position: 'fixed',
    bottom: '20px',
    right: '20px',
    background: 'linear-gradient(135deg, #06B6D4, #8B5CF6)',
    color: '#fff',
    padding: '1rem 2rem',
    borderRadius: '10px',
    boxShadow: '0 10px 30px rgba(6,182,212,0.3)',
    zIndex: '10000',
    animation: 'slideInRight 0.3s ease-out'
  } as CSSStyleDeclaration);
  document.body.appendChild(n);
  setTimeout(() => {
    n.style.animation = 'slideOutRight 0.3s ease-out';
    setTimeout(() => n.remove(), 300);
  }, 2000);
}
