import React, { useEffect } from 'react';
import Hero from '../components/Hero';
import HowItWorks from '../components/HowItWorks';
import Estimator from '../components/Estimator';
import Models from '../components/Models';
import FieldMap from '../components/FieldMap';
import Footer from '../components/Footer';
import { trackPageView } from '../utils/api';

export default function HomePage() {
  useEffect(() => {
    // Track page view in MongoDB
    const sessionId = sessionStorage.getItem('ryai_sid') || Math.random().toString(36).substr(2, 12);
    sessionStorage.setItem('ryai_sid', sessionId);
    trackPageView({ page: '/', referrer: document.referrer, sessionId }).catch(() => {});

    // Scroll reveal
    const observer = new IntersectionObserver(entries => {
      entries.forEach(e => { if (e.isIntersecting) e.target.classList.add('visible'); });
    }, { threshold: 0.12 });
    document.querySelectorAll('.reveal').forEach(el => observer.observe(el));
    return () => observer.disconnect();
  }, []);

  return (
    <>
      <Hero />
      <HowItWorks />
      <Estimator />
      <Models />
      <FieldMap />
      <Footer />
    </>
  );
}
