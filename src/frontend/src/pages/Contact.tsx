import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function Contact() {
  const phoneNumber = "9137202881";
  const email = "ashokgold664@gmail.com";
  const whatsappUrl = `https://wa.me/91${phoneNumber}`;
  const mailtoUrl = `mailto:${email}`;

  return (
    <main className="min-h-screen bg-background">
      {/* Hero Banner */}
      <section className="relative bg-secondary border-b border-gold/20 py-16 text-center">
        <div className="container mx-auto px-4 md:px-6">
          <p className="font-display text-xs tracking-widest uppercase text-gold mb-3">
            Get In Touch
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-foreground mb-4">
            Contact Us
          </h1>
          <p className="text-muted-foreground font-body text-lg max-w-xl mx-auto">
            We'd love to hear from you. Reach out via WhatsApp or email and
            we'll get back to you as soon as possible.
          </p>
        </div>
      </section>

      {/* Contact Cards */}
      <section className="container mx-auto px-4 md:px-6 py-16">
        <div className="max-w-3xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-8">
          {/* WhatsApp Card */}
          <a
            href={whatsappUrl}
            target="_blank"
            rel="noopener noreferrer"
            className="group flex flex-col items-center text-center gap-5 p-8 rounded-2xl border-2 border-gold/30 bg-card hover:border-gold hover:shadow-gold transition-all duration-300"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 group-hover:bg-gold/20 transition-colors">
              <SiWhatsapp className="h-8 w-8 text-gold" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                WhatsApp Us
              </h2>
              <p className="text-sm text-muted-foreground font-body mb-3">
                Chat with us directly on WhatsApp for quick responses.
              </p>
              <span className="inline-flex items-center gap-2 font-display text-lg font-semibold text-gold group-hover:text-gold-light transition-colors">
                <Phone className="h-4 w-4" />
                +91 {phoneNumber}
              </span>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-display font-semibold tracking-wide text-white group-hover:bg-gold-light transition-colors">
              <MessageCircle className="h-4 w-4" />
              Open WhatsApp
            </span>
          </a>

          {/* Email Card */}
          <a
            href={mailtoUrl}
            className="group flex flex-col items-center text-center gap-5 p-8 rounded-2xl border-2 border-gold/30 bg-card hover:border-gold hover:shadow-gold transition-all duration-300"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gold/10 border border-gold/30 group-hover:bg-gold/20 transition-colors">
              <Mail className="h-8 w-8 text-gold" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-foreground mb-1">
                Email Us
              </h2>
              <p className="text-sm text-muted-foreground font-body mb-3">
                Send us an email and we'll respond within 24 hours.
              </p>
              <span className="inline-flex items-center gap-2 font-display text-base font-semibold text-gold group-hover:text-gold-light transition-colors break-all">
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </span>
            </div>
            <span className="mt-auto inline-flex items-center gap-2 rounded-full bg-gold px-6 py-2.5 text-sm font-display font-semibold tracking-wide text-white group-hover:bg-gold-light transition-colors">
              <Mail className="h-4 w-4" />
              Send Email
            </span>
          </a>
        </div>

        {/* Additional Info */}
        <div className="max-w-3xl mx-auto mt-12 p-8 rounded-2xl border border-gold/20 bg-secondary text-center">
          <MapPin className="h-6 w-6 text-gold mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-foreground mb-2">
            Bessie's Ashok Gold
          </h3>
          <p className="text-muted-foreground font-body text-sm leading-relaxed">
            We are available Monday – Saturday, 10:00 AM – 7:00 PM IST.
            <br />
            For urgent inquiries, WhatsApp is the fastest way to reach us.
          </p>
        </div>
      </section>
    </main>
  );
}
