import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Sun, ArrowRight, Loader2, AlertCircle, Check, Eye, EyeOff } from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../components/Card';
import { supabase } from '../lib/supabaseClient';

function Auth() {
  // Facebook SDK integration
  React.useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      window.fbAsyncInit = function() {
        window.FB && window.FB.init({
          appId      : '{your-app-id}', // TODO: Replace with your Facebook App ID
          cookie     : true,
          xfbml      : true,
          version    : '{api-version}' // TODO: Replace with your API version, e.g., 'v19.0'
        });
        window.FB && window.FB.AppEvents && window.FB.AppEvents.logPageView();
      };
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  }, []);

  // Google Auth handler
  const [googleLoading, setGoogleLoading] = React.useState(false);
  const handleGoogleSignIn = async () => {
    setGoogleLoading(true);
    try {
      await supabase.auth.signInWithOAuth({ provider: 'google' });
    } catch (err) {
      // Optionally handle error
      setGoogleLoading(false);
    }
  };

  // Facebook SDK integration
  React.useEffect(() => {
    // Only run on client
    if (typeof window !== 'undefined') {
      window.fbAsyncInit = function() {
        window.FB && window.FB.init({
          appId      : '{your-app-id}', // TODO: Replace with your Facebook App ID
          cookie     : true,
          xfbml      : true,
          version    : '{api-version}' // TODO: Replace with your API version, e.g., 'v19.0'
        });
        window.FB && window.FB.AppEvents && window.FB.AppEvents.logPageView();
      };
      (function(d, s, id){
        var js, fjs = d.getElementsByTagName(s)[0];
        if (d.getElementById(id)) {return;}
        js = d.createElement(s); js.id = id;
        js.src = "https://connect.facebook.net/en_US/sdk.js";
        fjs.parentNode.insertBefore(js, fjs);
      }(document, 'script', 'facebook-jssdk'));
    }
  }, []);

  const navigate = useNavigate();
  const [isLogin, setIsLogin] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    fullName: '',
    role: 'user'
  });

  // Password strength indicators
  const getPasswordStrength = (password: string) => {
    const hasLength = password.length >= 8;
    const hasUpperCase = /[A-Z]/.test(password);
    const hasLowerCase = /[a-z]/.test(password);
    const hasNumbers = /\d/.test(password);
    const hasSpecialChar = /[!@#$%^&*(),.?":{}|<>]/.test(password);

    const strength = [hasLength, hasUpperCase, hasLowerCase, hasNumbers, hasSpecialChar]
      .filter(Boolean).length;

    return {
      score: strength,
      isStrong: strength >= 4
    };
  };

  const passwordStrength = getPasswordStrength(formData.password);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError('');
    setSuccess(false);

    try {
      if (isLogin) {
        console.log('Logging in with:', formData.email);
        
        const { data, error } = await supabase.auth.signInWithPassword({
          email: formData.email,
          password: formData.password
        });

        if (error) {
          console.error('Login error:', error);
          throw error;
        }

        if (!data?.user) {
          throw new Error('Failed to log in');
        }

        console.log('Login successful');
        
        // Check user role and redirect
        const { data: profile, error: profileError } = await supabase
          .from('user_profiles')
          .select('role')
          .eq('user_id', data.user.id)
          .single();
        
        if (profileError) {
          console.error('Failed to fetch user profile:', profileError);
          // Still allow login even if profile fetch fails
        }

        navigate(profile?.role === 'admin' ? '/admin' : '/dashboard');
      } else {
        console.log('Signing up with:', formData.email);
        
        const { data: authData, error: authError } = await supabase.auth.signUp({
          email: formData.email,
          password: formData.password,
          options: {
            data: {
              full_name: formData.fullName,
              role: formData.role
            }
          }
        });

        if (authError) {
          console.error('Signup error:', authError);
          throw authError;
        }

        if (!authData?.user) {
          throw new Error('Failed to create user account');
        }
        
        console.log('Auth user created:', authData.user.id);
        
        // Check if profile already exists before creating one
        const { data: existingProfile } = await supabase
          .from('user_profiles')
          .select('id')
          .eq('user_id', authData.user.id)
          .single();
          
        // Only create profile if it doesn't already exist
        if (!existingProfile) {
          try {
            const { error: profileError } = await supabase.from('user_profiles').insert([{
              user_id: authData.user.id,
              full_name: formData.fullName,
              role: formData.role
            }]);

            if (profileError) {
              console.error('Profile creation error:', profileError);
              console.warn('Continuing with signup despite profile error');
            } else {
              console.log('User profile created manually');
            }
          } catch (profileErr) {
            console.error('Profile creation exception:', profileErr);
            console.warn('Continuing with signup despite profile error');
          }
        } else {
          console.log('User profile already exists (created by trigger)');
        }
        
        // Check if email confirmation is required
        if (authData.session) {
          // User is signed in - no email confirmation required
          console.log('Session exists, redirecting to dashboard');
          navigate('/dashboard');
        } else {
          // Email confirmation is likely required
          console.log('Email verification required');
          setSuccess(true);
        }
      }
    } catch (error: any) {
      console.error('Auth error:', error);
      setError(error.message || 'An unexpected error occurred');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-dark flex items-center justify-center relative overflow-hidden pt-16">
      {/* Enhanced Animated Background - Home Style */}
      <div className="absolute inset-0 z-0 overflow-hidden">
        {/* Radial gradients for color accents */}
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at 30% 50%, rgba(204, 255, 0, 0.16) 0%, rgba(0, 0, 0, 0) 60%)',
            animation: 'pulse 8s ease-in-out infinite'
          }}
        />
        <div 
          className="absolute inset-0 pointer-events-none" 
          style={{
            background: 'radial-gradient(circle at 70% 30%, rgba(0, 225, 255, 0.10) 0%, rgba(0, 0, 0, 0) 60%)',
            animation: 'pulse 8s ease-in-out infinite alternate'
          }}
        />
        {/* Subtle glass border overlay */}
        <div className="absolute inset-0 border-t border-white/10 bg-[#0A0A0A]/80" />
        {/* Animated glowing circles */}
        <motion.div
          animate={{ opacity: [0.3, 0.5, 0.3], y: [0, -15, 0] }}
          transition={{ duration: 10, repeat: Infinity, ease: "easeInOut" }}
          className="absolute top-1/3 -right-20 w-80 h-80 rounded-full border border-primary/20 opacity-20"
        />
        <motion.div
          animate={{ opacity: [0.2, 0.4, 0.2], y: [0, 20, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "easeInOut", delay: 2 }}
          className="absolute bottom-1/4 -left-40 w-96 h-96 rounded-full border border-secondary/20 opacity-20"
        />
        {/* Grid pattern overlay for texture */}
        <div className="absolute inset-0 z-10 pointer-events-none" style={{
          backgroundImage: 'radial-gradient(circle at 1px 1px, rgba(255,255,255,0.04) 1px, transparent 0)',
          backgroundSize: '30px 30px'
        }} />
        {/* Existing animated blurred circle */}
        <motion.div
          animate={{
            scale: [1, 1.2, 1],
            opacity: [0.3, 0.6, 0.3]
          }}
          transition={{
            duration: 8,
            repeat: Infinity,
            ease: "easeInOut"
          }}
          className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[800px] rounded-full bg-primary/20 blur-3xl"
        />
      </div>

      {/* Auth Card */}
      <Card 
        variant="glass" 
        padding="xl"
        className="relative z-10 max-w-md w-full mx-4 backdrop-blur-xl"
      >
        {/* Google Auth Button */}
        <button
          type="button"
          onClick={handleGoogleSignIn}
          className="w-full flex items-center justify-center gap-2 py-3 px-4 rounded-lg bg-white text-dark font-semibold border border-white/20 hover:border-primary/20 shadow transition-all duration-300 mb-6 disabled:opacity-60 disabled:pointer-events-none"
          disabled={googleLoading}
        >
          {/* Google SVG icon - official multicolor G */}
          <svg className="h-5 w-5" viewBox="0 0 48 48" aria-hidden="true" focusable="false" role="img">
            <g>
              <path fill="#4285F4" d="M43.611 20.083h-1.861V20H24v8h11.303c-1.622 4.355-5.789 7.5-11.303 7.5-6.351 0-11.5-5.149-11.5-11.5s5.149-11.5 11.5-11.5c2.525 0 4.847.832 6.728 2.462l6.364-6.364C34.064 5.34 29.337 3.5 24 3.5 12.954 3.5 4 12.454 4 23.5S12.954 43.5 24 43.5c11.045 0 20-8.955 20-20 0-1.341-.138-2.651-.389-3.917z"/>
              <path fill="#34A853" d="M6.306 14.691l6.571 4.819C14.655 16.037 18.961 13.5 24 13.5c2.525 0 4.847.832 6.728 2.462l6.364-6.364C34.064 5.34 29.337 3.5 24 3.5c-7.798 0-14.483 4.45-17.694 11.191z"/>
              <path fill="#FBBC05" d="M24 43.5c5.289 0 10.059-1.813 13.795-4.927l-6.364-5.217C29.7 35.126 26.98 36 24 36c-5.5 0-10.166-3.707-11.824-8.715l-6.526 5.034C8.97 39.044 15.886 43.5 24 43.5z"/>
              <path fill="#EA4335" d="M43.611 20.083h-1.861V20H24v8h11.303c-.697 1.872-2.048 3.619-4.072 4.856l.001-.001 6.364 5.217C39.978 39.044 44 32.5 44 23.5c0-1.341-.138-2.651-.389-3.917z"/>
            </g>
          </svg>
          {googleLoading ? (
            <span className="ml-2 flex items-center gap-1"><Loader2 className="h-4 w-4 animate-spin" /> Signing in...</span>
          ) : (
            <span className="ml-2">Continue with Google</span>
          )}
        </button>
        {/* Divider */}
        <div className="flex items-center gap-2 mb-6">
          <span className="flex-1 h-px bg-white/10" />
          <span className="text-xs text-light/60">or</span>
          <span className="flex-1 h-px bg-white/10" />
        </div>

        {/* Mode Toggle */}
        {!success && (
          <div className="flex p-1 bg-dark-200 rounded-lg mb-6">
            <button
              onClick={() => setIsLogin(true)}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                isLogin ? 'bg-primary text-dark' : 'text-light/60 hover:text-light'
              }`}
            >
              Log In
            </button>
            <button
              onClick={() => setIsLogin(false)}
              className={`flex-1 py-2 px-4 rounded-md transition-colors ${
                !isLogin ? 'bg-primary text-dark' : 'text-light/60 hover:text-light'
              }`}
            >
              Sign Up
            </button>
          </div>
        )}

        {success ? (
          <div className="space-y-6 text-center">
            <div className="p-4 bg-primary/10 border border-primary/20 rounded-lg flex flex-col items-center gap-3 text-light">
              <div className="bg-primary/20 p-3 rounded-full">
                <Check className="h-8 w-8 text-primary" />
              </div>
              <h3 className="text-xl font-bold">Verification Email Sent</h3>
              <p className="text-light/60">
                Please check your email ({formData.email}) and click the verification link to complete your registration.
              </p>
            </div>
            <button
              onClick={() => setIsLogin(true)}
              className="inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-dark hover:bg-primary-hover active:bg-primary-active transform hover:scale-[1.02] h-14 px-8 text-lg rounded-lg w-full"
            >
              Go to Login
              <ArrowRight className="h-5 w-5 ml-2" />
            </button>
          </div>
        ) : (
          <form onSubmit={handleSubmit} className="space-y-6">
            <AnimatePresence>
              {error && (
                <motion.div
                  initial={{ opacity: 0, y: -10 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -10 }}
                  className="p-4 bg-error/10 border border-error/20 rounded-lg flex items-center gap-3 text-error"
                >
                  <AlertCircle className="h-5 w-5 flex-shrink-0" />
                  <p className="text-sm">{error}</p>
                </motion.div>
              )}
            </AnimatePresence>

            <div className="space-y-4">
              <AnimatePresence mode="wait">
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-1">
                      <label htmlFor="fullName" className="block text-sm font-medium text-light/80">
                        Full Name
                      </label>
                      <input
                        id="fullName"
                        name="fullName"
                        type="text"
                        value={formData.fullName}
                        onChange={handleChange}
                        className="w-full h-11 rounded-lg border border-light/20 bg-dark-200 text-light px-3"
                        required={!isLogin}
                      />
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <div className="space-y-1">
                <label htmlFor="email" className="block text-sm font-medium text-light/80">
                  Email Address
                </label>
                <input
                  id="email"
                  name="email"
                  type="email"
                  value={formData.email}
                  onChange={handleChange}
                  className="w-full h-11 rounded-lg border border-light/20 bg-dark-200 text-light px-3"
                  required
                />
              </div>

              <div className="space-y-1">
                <label htmlFor="password" className="block text-sm font-medium text-light/80">
                  Password
                </label>
                <div className="relative">
                  <input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    value={formData.password}
                    onChange={handleChange}
                    className="w-full h-11 rounded-lg border border-light/20 bg-dark-200 text-light px-3 pr-10"
                    required
                  />
                  <button
                    type="button"
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute inset-y-0 right-0 px-3 flex items-center text-light/60 hover:text-light"
                  >
                    {showPassword ? <EyeOff className="h-5 w-5" /> : <Eye className="h-5 w-5" />}
                  </button>
                </div>
              </div>
              
              <AnimatePresence>
                {!isLogin && formData.password && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    className="space-y-2"
                  >
                    <div className="flex gap-1 mt-2">
                      {[...Array(5)].map((_, i) => (
                        <div
                          key={i}
                          className={`h-1 flex-1 rounded-full transition-colors duration-300 ${
                            i < passwordStrength.score ? 'bg-primary' : 'bg-light/20'
                          }`}
                        />
                      ))}
                    </div>
                    <div className="space-y-1">
                      <div className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 ${formData.password.length >= 8 ? 'text-primary' : 'text-light/40'}`} />
                        <span className={formData.password.length >= 8 ? 'text-light' : 'text-light/40'}>
                          At least 8 characters
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 ${/[A-Z]/.test(formData.password) ? 'text-primary' : 'text-light/40'}`} />
                        <span className={/[A-Z]/.test(formData.password) ? 'text-light' : 'text-light/40'}>
                          One uppercase letter
                        </span>
                      </div>
                      <div className="flex items-center gap-2 text-sm">
                        <Check className={`h-4 w-4 ${/\d/.test(formData.password) ? 'text-primary' : 'text-light/40'}`} />
                        <span className={/\d/.test(formData.password) ? 'text-light' : 'text-light/40'}>
                          One number
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>

              <AnimatePresence>
                {!isLogin && (
                  <motion.div
                    initial={{ opacity: 0, height: 0 }}
                    animate={{ opacity: 1, height: 'auto' }}
                    exit={{ opacity: 0, height: 0 }}
                    transition={{ duration: 0.2 }}
                  >
                    <div className="space-y-1">
                      <label htmlFor="role" className="block text-sm font-medium text-light/80">
                        I am a...
                      </label>
                      <select
                        id="role"
                        name="role"
                        value={formData.role}
                        onChange={handleChange}
                        className="w-full h-11 rounded-lg border border-light/20 bg-dark-200 text-light px-3"
                        required
                      >
                        <option value="user">Rooftop Owner</option>
                        <option value="investor">Investor</option>
                        <option value="other">Other</option>
                      </select>
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </div>

            <button
              type="submit"
              className="inline-flex items-center justify-center font-medium transition-all duration-300 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:pointer-events-none disabled:opacity-50 bg-primary text-dark hover:bg-primary-hover active:bg-primary-active transform hover:scale-[1.02] h-14 px-8 text-lg rounded-lg w-full"
              disabled={isLoading || (!isLogin && !passwordStrength.isStrong)}
            >
              {isLoading ? (
                <>
                  <Loader2 className="h-5 w-5 animate-spin" />
                  {isLogin ? 'Logging in...' : 'Creating Account...'}
                </>
              ) : (
                <>
                  {isLogin ? 'Log In' : 'Create Account'}
                  <ArrowRight className="h-5 w-5 ml-2" />
                </>
              )}
            </button>

            <div className="text-center">
              <p className="text-light/60">
                {isLogin ? 'Don\'t have an account? ' : 'Already have an account? '}
                <button
                  type="button"
                  onClick={() => setIsLogin(!isLogin)}
                  className="text-primary hover:text-primary-hover"
                >
                  {isLogin ? 'Sign up' : 'Log in'}
                </button>
              </p>
            </div>
          </form>
        )}
      </Card>
    </div>
  );
}

export default Auth;
