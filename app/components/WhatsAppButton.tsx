"use client";

const WHATSAPP_NUMBER = '447367297484';

export default function WhatsAppButton() {
  return (
    <a
      href={`https://wa.me/${WHATSAPP_NUMBER}`}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat with us on WhatsApp"
      onMouseOver={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1.1)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 6px 28px rgba(37,211,102,0.6)';
      }}
      onMouseOut={e => {
        (e.currentTarget as HTMLAnchorElement).style.transform = 'scale(1)';
        (e.currentTarget as HTMLAnchorElement).style.boxShadow = '0 4px 20px rgba(37,211,102,0.45)';
      }}
      style={{
        position: 'fixed',
        bottom: '24px',
        right: '24px',
        zIndex: 9999,
        width: '56px',
        height: '56px',
        borderRadius: '50%',
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        display: 'block',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      {/* eslint-disable-next-line @next/next/no-img-element */}
      <img src="/whatsapp-icon.png" alt="WhatsApp" width={56} height={56} style={{ borderRadius: '50%', display: 'block' }} />
    </a>
  );
}
