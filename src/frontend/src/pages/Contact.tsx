import { Mail, MapPin, MessageCircle, Phone } from "lucide-react";
import { SiWhatsapp } from "react-icons/si";

export default function Contact() {
  const phoneNumber = "9137202881";
  const email = "ashokgold664@gmail.com";
  const whatsappUrl = `https://wa.me/91${phoneNumber}`;
  const mailtoUrl = `mailto:${email}`;

  return (
    <main
      className="min-h-screen"
      style={{ backgroundColor: "oklch(0.98 0.025 85)" }}
    >
      {/* Hero Banner */}
      <section
        className="relative py-16 text-center"
        style={{
          backgroundColor: "oklch(0.88 0.16 82)",
          borderBottom: "2px solid oklch(0.65 0.13 72 / 0.35)",
        }}
      >
        <div className="container mx-auto px-4 md:px-6">
          <p className="font-display text-xs tracking-widest uppercase text-black font-bold mb-3">
            Get In Touch
          </p>
          <h1 className="font-display text-4xl md:text-5xl font-bold text-black mb-4">
            Contact Us
          </h1>
          <p className="text-black/70 font-body text-lg max-w-xl mx-auto">
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
            data-ocid="contact.whatsapp.button"
            className="group flex flex-col items-center text-center gap-5 p-8 rounded-2xl border-2 border-black/20 bg-white hover:border-black hover:shadow-xl transition-all duration-300"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black/15 group-hover:border-black/30 transition-colors"
              style={{ backgroundColor: "oklch(0.88 0.16 82)" }}
            >
              <SiWhatsapp className="h-8 w-8 text-black" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-black mb-1">
                WhatsApp Us
              </h2>
              <p className="text-sm text-black/65 font-body mb-3">
                Chat with us directly on WhatsApp for quick responses.
              </p>
              <span className="inline-flex items-center gap-2 font-display text-lg font-bold text-black group-hover:text-black/70 transition-colors">
                <Phone className="h-4 w-4" />
                +91 {phoneNumber}
              </span>
            </div>
            <span
              className="mt-auto inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-display font-bold tracking-wide text-black group-hover:text-white transition-colors"
              style={{ backgroundColor: "oklch(0.88 0.16 82)" }}
            >
              <MessageCircle className="h-4 w-4" />
              Open WhatsApp
            </span>
          </a>

          {/* Email Card */}
          <a
            href={mailtoUrl}
            data-ocid="contact.email.button"
            className="group flex flex-col items-center text-center gap-5 p-8 rounded-2xl border-2 border-black/20 bg-white hover:border-black hover:shadow-xl transition-all duration-300"
          >
            <div
              className="flex h-16 w-16 items-center justify-center rounded-full border-2 border-black/15 group-hover:border-black/30 transition-colors"
              style={{ backgroundColor: "oklch(0.88 0.16 82)" }}
            >
              <Mail className="h-8 w-8 text-black" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold text-black mb-1">
                Email Us
              </h2>
              <p className="text-sm text-black/65 font-body mb-3">
                Send us an email and we'll respond within 24 hours.
              </p>
              <span className="inline-flex items-center gap-2 font-display text-base font-bold text-black group-hover:text-black/70 transition-colors break-all">
                <Mail className="h-4 w-4 shrink-0" />
                {email}
              </span>
            </div>
            <span
              className="mt-auto inline-flex items-center gap-2 rounded-full px-6 py-2.5 text-sm font-display font-bold tracking-wide text-black group-hover:text-white transition-colors"
              style={{ backgroundColor: "oklch(0.88 0.16 82)" }}
            >
              <Mail className="h-4 w-4" />
              Send Email
            </span>
          </a>
        </div>

        {/* Additional Info */}
        <div
          className="max-w-3xl mx-auto mt-12 p-8 rounded-2xl border-2 border-black/15 text-center"
          style={{ backgroundColor: "oklch(0.93 0.08 84)" }}
        >
          <MapPin className="h-6 w-6 text-black mx-auto mb-3" />
          <h3 className="font-display text-lg font-bold text-black mb-2">
            Bessie's Ashok Gold
          </h3>
          <p className="text-black/70 font-body text-sm leading-relaxed">
            We are available Monday – Saturday, 10:00 AM – 7:00 PM IST.
            <br />
            For urgent inquiries, WhatsApp is the fastest way to reach us.
          </p>
        </div>
      </section>
    </main>
  );
}
