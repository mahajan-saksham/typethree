import React, { useEffect, useRef } from 'react';
import { motion, useScroll, useTransform, useInView } from 'framer-motion';
import { TypeAnimation } from 'react-type-animation';
import gsap from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { Button } from '../components/Button';
import { Card } from '../components/Card';
import { ContactAndAbout } from '../components/ContactAndAbout';
import { 
  Rocket, 
  Globe2, 
  Sun, 
  MapPin,
  Mail,
  ArrowRight
} from 'lucide-react';

gsap.registerPlugin(ScrollTrigger);

function About() {
  const { scrollYProgress } = useScroll();
  const heroRef = useRef<HTMLDivElement>(null);
  const storyRef = useRef<HTMLDivElement>(null);

  // Parallax effect for hero section
  const y = useTransform(scrollYProgress, [0, 1], ['0%', '50%']);
  const opacity = useTransform(scrollYProgress, [0, 0.3], [1, 0]);

  useEffect(() => {
    // Animate mission keywords
    const keywords = gsap.utils.toArray('.mission-keyword');
    keywords.forEach((keyword) => {
      gsap.to(keyword, {
        opacity: 1,
        y: 0,
        duration: 1,
        scrollTrigger: {
          trigger: keyword,
          start: 'top center+=100',
          toggleActions: 'play none none reverse'
        }
      });
    });

    // Make founder cards visible immediately
    const cards = gsap.utils.toArray('.founder-card');
    cards.forEach((card) => {
      gsap.set(card, {
        opacity: 1,
        x: 0
      });
    });
  }, []);

  return (
    <div className="min-h-screen bg-dark">
      {/* Contact & About Section (now first) */}
      <ContactAndAbout />
      {/* Unified About Section */}
      <section ref={heroRef} className="relative py-16 bg-dark-100 flex items-center justify-center min-h-[420px]">
        {/* Radial grid background */}
        <div className="absolute inset-0" style={{backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0px)', backgroundSize: '30px 30px'}} />
        <div className="relative z-10 w-full flex justify-center">
  <div className="w-full max-w-4xl bg-dark-800/80 rounded-2xl border border-white/10 shadow-xl backdrop-blur-lg px-4 md:px-12 py-12 flex flex-col md:flex-row items-center gap-10">
    {/* Left: Mission Text */}
    <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4">
      <h1 className="text-3xl md:text-5xl font-extrabold text-light mb-2 leading-tight">Our Mission</h1>
      <p className="text-lg md:text-xl text-light/80">
        Inspired by <span className="text-primary font-semibold">C. V. Raman</span>, who unlocked the mysteries of light, we believe in harnessing sunlight to illuminate lives and power a brighter India—starting with rooftops in Indore.
      </p>
      <p className="text-light/60 text-base md:text-lg">
        Our mission is to make clean energy <span className="text-primary font-semibold">accessible</span>, <span className="text-primary font-semibold">investable</span>, and <span className="text-primary font-semibold">intelligent</span> for everyone.
      </p>
    </div>
    {/* Right: Images Row */}
    <div className="flex-1 flex justify-center md:justify-end items-center">
  <div className="w-full h-full max-w-xs md:max-w-sm flex items-stretch">
    <img src="https://images.unsplash.com/photo-1464983953574-0892a716854b?auto=format&fit=crop&w=400&q=80" alt="Solar Team" className="rounded-2xl w-full aspect-square object-cover shadow-lg border border-white/10 bg-white/5 backdrop-blur-md" />
  </div>
</div>
  </div>
</div>


      </section>



      {/* Founders */}
      

      {/* CTA Section */}
      <section className="py-24 bg-primary">
        <div className="container mx-auto px-6 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-dark mb-12">
            We're building the future of solar.<br />
            Let's build it together.
          </h2>
          <div className="flex flex-col sm:flex-row gap-6 justify-center">
            <a className="inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-dark text-light hover:bg-dark/90 active:bg-dark/80 transform hover:scale-[1.02] h-14 px-8 text-lg rounded-lg" href="/products">
              Explore Products
            </a>
            <a className="inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-light text-light hover:bg-light hover:text-dark transform hover:scale-[1.02] h-14 px-8 text-lg rounded-lg !border-dark !text-dark hover:!bg-dark hover:!text-light" href="/contact">
              Join the Team
            </a>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;