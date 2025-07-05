import { motion } from 'framer-motion';
import { ContactAndAbout } from '../components/ContactAndAbout';
import { Button } from '../components/Button';

function About() {
  return (
    <div className="min-h-screen bg-dark">
      {/* Contact & About Section */}
      <ContactAndAbout />

      {/* Mission Section - Card Style */}
      <section className="relative py-16 bg-gradient-to-b from-dark-900 to-dark flex items-center justify-center min-h-[420px] overflow-hidden">
        {/* Decorative background */}
        <div className="absolute inset-0" style={{ backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0px)', backgroundSize: '30px 30px' }} />
        <div className="absolute -right-32 -top-32 w-96 h-96 rounded-full bg-primary/10 transition-all duration-500" />
        <div className="absolute -left-32 -bottom-32 w-96 h-96 rounded-full bg-secondary/10 transition-all duration-500" />
        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          whileInView={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8 }} 
          viewport={{ once: true }} 
          className="relative z-10 w-full flex justify-center"
        >
          <div className="w-full max-w-6xl mx-auto bg-gradient-to-b from-dark-800/80 to-dark-900/80 rounded-2xl border border-white/10 shadow-xl backdrop-blur-lg px-4 md:px-12 py-12 flex flex-col md:flex-row items-center gap-10">
            {/* Left: Mission Text */}
            <div className="flex-1 flex flex-col justify-center items-center md:items-start text-center md:text-left gap-4">
              <h1 className="text-[calc(1.2*theme('fontSize.4xl'))] md:text-[calc(1.2*theme('fontSize.5xl'))] font-extrabold text-primary mb-2 leading-tight tracking-tight font-heading">Our Mission</h1>
              <p className="text-lg md:text-xl text-light/90 mb-2">
                Inspired by <span className="text-primary font-semibold">C. V. Raman</span>, who unlocked the mysteries of light, we believe in harnessing sunlight to illuminate lives and power a brighter India—starting with rooftops in Indore.
              </p>
              <p className="text-light/70 text-base md:text-lg">
                Our mission is to make clean energy <span className="text-primary font-semibold">accessible</span>, <span className="text-primary font-semibold">investable</span>, and <span className="text-primary font-semibold">intelligent</span> for everyone.
              </p>
            </div>
            {/* Right: Team Image */}
            <div className="flex-1 flex justify-center md:justify-end items-center">
              <div className="w-full h-full max-w-xs md:max-w-sm flex items-stretch">
                <img src="https://dtuoyawpebjcmfesgwwn.supabase.co/storage/v1/object/public/carousal//x.png" alt="Solar Team" className="rounded-2xl w-full aspect-square object-cover shadow-lg border border-white/10 bg-white/5 backdrop-blur-md" />
              </div>
            </div>
          </div>
        </motion.div>
      </section>


      {/* CTA Section - Visually Matched to Home Page */}
      <section className="relative py-16 bg-dark-900 overflow-hidden">
        {/* Decorative blurred circles and grid overlays */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-96 h-96 rounded-full bg-primary/10 blur-2xl opacity-60" />
          <div className="absolute -bottom-20 -left-20 w-72 h-72 rounded-full bg-primary/5 blur-2xl opacity-60" />
          <div className="absolute inset-0 opacity-5" style={{backgroundImage:'repeating-linear-gradient(0deg,transparent,transparent 40px,rgba(204,255,0,0.1) 40px,rgba(204,255,0,0.1) 41px),repeating-linear-gradient(90deg,transparent,transparent 40px,rgba(204,255,0,0.1) 40px,rgba(204,255,0,0.1) 41px)'}} />
        </div>
        <div className="container mx-auto px-6 sm:px-6 max-w-6xl relative z-10">
          <div className="w-full max-w-6xl mx-auto text-center space-y-8 p-6 md:p-8">
            <h2 className="text-[calc(1.2*1.1*1.25rem*1.2)] md:text-[calc(1.2*1.1*1.25rem*1.2)] lg:text-[calc(1.1*2.5rem*1.2)] font-bold text-light mb-4">
              We're building the future of solar.<br />
              <span className="relative inline-block">Let's build it together.</span>
            </h2>
            <p className="text-lg md:text-xl text-light/70 max-w-2xl mx-auto">
              Schedule a free consultation with our solar experts and get a customized quote for your home.
            </p>
            <div className="grid grid-cols-1 sm:flex sm:flex-wrap justify-center gap-4 mt-10 max-w-md mx-auto sm:max-w-none">
              <Button 
                to="/products" 
                variant="primary" 
                size="lg" 
                className="inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-dark hover:bg-primary/90 active:bg-primary/80 transform hover:scale-[1.02] h-14 px-8 rounded-lg w-full sm:w-auto shadow-lg shadow-dark/20 text-base"
              >
                Explore Products
              </Button>
              <Button 
                to="/contact" 
                variant="ghost" 
                size="lg" 
                className="inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 border-2 border-primary text-primary bg-transparent hover:bg-primary/10 hover:text-dark transform hover:scale-[1.02] h-14 px-8 rounded-lg w-full sm:w-auto text-base"
              >
                Join the Team
              </Button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}

export default About;