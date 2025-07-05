import React from 'react';

export default function Install() {
  return (
    <div className="container mx-auto px-6 py-16 max-w-4xl text-center">
      <h1 className="text-4xl md:text-5xl font-bold text-primary mb-6">Solar Installation Process</h1>
      <p className="text-lg text-light/80 mb-10">
        Learn how our seamless installation process brings clean solar energy to your home or business with minimal hassle and maximum efficiency.
      </p>
      <div className="grid md:grid-cols-3 gap-8">
        <div className="bg-dark-900/80 rounded-xl p-6 shadow-lg border border-white/10">
          <h2 className="text-xl font-semibold text-primary mb-2">1. Site Assessment</h2>
          <p className="text-light/70">Our experts visit your location to evaluate roof space, sunlight exposure, and energy needs.</p>
        </div>
        <div className="bg-dark-900/80 rounded-xl p-6 shadow-lg border border-white/10">
          <h2 className="text-xl font-semibold text-primary mb-2">2. System Design</h2>
          <p className="text-light/70">We design a custom solar solution, select components, and share a detailed proposal for your approval.</p>
        </div>
        <div className="bg-dark-900/80 rounded-xl p-6 shadow-lg border border-white/10">
          <h2 className="text-xl font-semibold text-primary mb-2">3. Installation & Activation</h2>
          <p className="text-light/70">Certified installers set up your system safely and efficiently, followed by activation and monitoring setup.</p>
        </div>
      </div>
      <div className="mt-12">
        <p className="text-light/60">Ready to go solar? <a href="/" className="text-primary underline">Book a free consultation</a> today!</p>
      </div>
    </div>
  );
}
