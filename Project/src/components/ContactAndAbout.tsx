import { useState } from 'react';
import { motion } from 'framer-motion';
import { Phone, Mail, MapPin, Clock, Send, CheckCircle2 } from 'lucide-react';

interface FormData {
  name: string;
  contact: string;
  message: string;
}

interface FormErrors {
  name?: string;
  contact?: string;
  message?: string;
}

export function ContactAndAbout() {
  const [formData, setFormData] = useState<FormData>({
    name: '',
    contact: '',
    message: ''
  });
  const [errors, setErrors] = useState<FormErrors>({});
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSubmitted, setIsSubmitted] = useState(false);

  const validate = (): boolean => {
    const newErrors: FormErrors = {};
    
    if (!formData.name.trim()) {
      newErrors.name = 'Name is required';
    }
    
    if (!formData.contact.trim()) {
      newErrors.contact = 'Phone or email is required';
    } else if (
      !/^[\+]?[(]?[0-9]{3}[)]?[-\s\.]?[0-9]{3}[-\s\.]?[0-9]{4,6}$/.test(formData.contact) && 
      !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.contact)
    ) {
      newErrors.contact = 'Please enter a valid phone number or email';
    }
    
    if (!formData.message.trim()) {
      newErrors.message = 'Message is required';
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    
    // Clear error when user types
    if (errors[name as keyof FormErrors]) {
      setErrors(prev => ({
        ...prev,
        [name]: undefined
      }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validate()) return;
    
    setIsSubmitting(true);
    
    // Simulate API call
    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setIsSubmitted(true);
      setFormData({ name: '', contact: '', message: '' });
    } catch (error) {
      console.error('Error submitting form:', error);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <section className="relative bg-gradient-to-b from-dark to-dark-900 py-20 overflow-hidden">
      {/* Background effects */}
      <div className="absolute inset-0 z-0 overflow-hidden pointer-events-none opacity-10">
        <div className="absolute top-0 left-0 w-full h-full" style={{background: 'radial-gradient(circle at 15% 50%, rgba(204, 255, 0, 0.5) 0%, rgba(0, 0, 0, 0) 45%)'}} />
        <div className="absolute top-0 right-0 w-full h-full" style={{background: 'radial-gradient(circle at 85% 30%, rgba(0, 225, 255, 0.5) 0%, rgba(0, 0, 0, 0) 45%)'}} />
      </div>
      
      <div className="container mx-auto px-6 max-w-6xl relative z-10 mt-[6%]">
        <div className="flex flex-col md:flex-row gap-12">
          {/* Contact Us Block (Left Column) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex flex-col"
          >
            <div className="bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden backdrop-blur-lg bg-white/5 border border-white/10 transition-all duration-300 p-6 md:p-8 h-full flex flex-col">
              <h2 className="text-3xl font-bold text-light mb-2">Contact Us</h2>
              <p className="text-light/60 text-lg mb-8">Ready to go solar? Let's talk.</p>
              
              <div className="space-y-6 mb-8">
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mt-1">
                    <Phone className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-light/80">Phone</h3>
                    <p className="text-light/60">+91 98765 43210</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mt-1">
                    <Mail className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-light/80">Email</h3>
                    <p className="text-light/60">hello@type3.energy</p>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mt-1">
                    <MapPin className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-light/80">Address</h3>
                    <p className="text-light/60">6/3 South Harsiddhi, Opp. Garden, Indore, MP</p>
                    
                    {/* Google Maps iframe (desktop only) */}
                    <div className="hidden md:block mt-4 rounded-lg overflow-hidden border border-white/10 h-[200px]">
                      <iframe 
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3680.2258240307995!2d75.8663!3d22.7196!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x3962fd0b7c2b30b9%3A0xd5c9f5da7e0a8f1d!2sSouth%20Tukoganj%2C%20Indore%2C%20Madhya%20Pradesh!5e0!3m2!1sen!2sin!4v1650000000000!5m2!1sen!2sin" 
                        width="100%" 
                        height="100%" 
                        style={{ border: 0 }} 
                        allowFullScreen={false} 
                        loading="lazy" 
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>
                </div>
                
                <div className="flex items-start gap-4">
                  <div className="flex items-center justify-center w-10 h-10 rounded-full bg-primary/10 text-primary mt-1">
                    <Clock className="h-5 w-5" />
                  </div>
                  <div>
                    <h3 className="text-lg font-medium text-light/80">Hours</h3>
                    <p className="text-light/60">Mon–Sat, 10:00 AM – 6:00 PM</p>
                  </div>
                </div>
              </div>
              
              {/* Replace form with Contact Us button */}
              <div className="flex justify-center mt-8">
                <button className="w-full bg-primary hover:bg-primary/90 text-dark font-medium rounded-lg p-4 flex items-center justify-center transition-colors">
                  Contact Us
                </button>
              </div>
            </div>
          </motion.div>
          
          {/* About Us Block (Right Column) */}
          <motion.div 
            initial={{ opacity: 0, y: 20 }}
            whileInView={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, delay: 0.2 }}
            viewport={{ once: true }}
            className="w-full md:w-1/2 flex flex-col"
          >
            <div className="bg-gradient-to-b from-dark to-dark-900 rounded-xl overflow-hidden backdrop-blur-lg bg-white/5 border border-white/10 transition-all duration-300 p-6 md:p-8 h-full flex flex-col">
              <h2 className="text-3xl font-bold text-light mb-2">About Type 3</h2>
              
              <div className="space-y-6 mt-6 flex-grow">
                <p className="text-light/80 leading-relaxed">
                  Type 3 is a rooftop solar company based in Indore, committed to making clean energy simple, accessible, and financially smart.
                </p>
                
                <p className="text-light/80 leading-relaxed">
                  We handle everything — from consultation to installation — using high-efficiency solar technology, transparent pricing, and expert execution.
                </p>
                
                <p className="text-light/80 leading-relaxed">
                  We believe solar isn't just a product, it's a step toward self-reliance.
                </p>
              </div>
              
              {/* Company Stats */}
              <div className="grid grid-cols-2 gap-4 mt-8">
                <div className="bg-dark-900/50 border border-white/10 rounded-lg p-4 text-center">
                  <div className="text-primary text-3xl font-bold font-mono mb-1">500+</div>
                  <div className="text-light/60 text-sm">Installations</div>
                </div>
                
                <div className="bg-dark-900/50 border border-white/10 rounded-lg p-4 text-center">
                  <div className="text-primary text-3xl font-bold font-mono mb-1">5MW+</div>
                  <div className="text-light/60 text-sm">Capacity Installed</div>
                </div>
                
                <div className="bg-dark-900/50 border border-white/10 rounded-lg p-4 text-center">
                  <div className="text-primary text-3xl font-bold font-mono mb-1">98%</div>
                  <div className="text-light/60 text-sm">Customer Satisfaction</div>
                </div>
                
                <div className="bg-dark-900/50 border border-white/10 rounded-lg p-4 text-center">
                  <div className="text-primary text-3xl font-bold font-mono mb-1">10yr+</div>
                  <div className="text-light/60 text-sm">Industry Experience</div>
                </div>
              </div>
              
              {/* CTA Button */}
              <div className="mt-8">
                <a 
                  href="/products" 
                  className="block w-full bg-dark-900/50 hover:bg-dark-800/50 border border-white/10 hover:border-primary/20 text-light font-medium rounded-lg p-4 text-center transition-all duration-300"
                >
                  Explore Our Solar Solutions
                </a>
              </div>
            </div>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
