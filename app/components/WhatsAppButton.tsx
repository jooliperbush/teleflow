"use client";

const WHATSAPP_NUMBER = 'PLACEHOLDER'; // replace with e.g. 447700000000

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
        background: '#25D366',
        boxShadow: '0 4px 20px rgba(37,211,102,0.45)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        transition: 'transform 0.2s, box-shadow 0.2s',
      }}
    >
      <svg width="28" height="28" viewBox="0 0 48 48" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path d="M24 4C12.954 4 4 12.954 4 24c0 3.678.99 7.13 2.717 10.1L4 44l10.167-2.668A19.916 19.916 0 0024 44c11.046 0 20-8.954 20-20S35.046 4 24 4z" fill="white"/>
        <path d="M24 7.2c-9.26 0-16.8 7.54-16.8 16.8 0 3.17.882 6.134 2.417 8.664l.38.625-1.615 5.9 6.07-1.59.605.358A16.72 16.72 0 0024 40.8c9.26 0 16.8-7.54 16.8-16.8S33.26 7.2 24 7.2z" fill="#25D366"/>
        <path d="M18.24 15.36c-.4-.88-.82-.9-1.2-.916-.31-.013-.665-.012-1.02-.012-.355 0-.932.133-1.42.665-.488.533-1.864 1.82-1.864 4.44s1.908 5.153 2.175 5.508c.266.355 3.727 5.94 9.17 8.09 4.535 1.79 5.46 1.434 6.444 1.344.983-.089 3.17-1.297 3.614-2.55.444-1.254.444-2.33.311-2.55-.133-.222-.488-.355-.843-.533-.355-.178-2.175-1.074-2.51-1.196-.333-.122-.577-.178-.822.178-.244.355-.945 1.196-1.157 1.44-.21.244-.422.274-.777.096-.355-.178-1.497-.552-2.852-1.76-1.055-.94-1.768-2.1-1.975-2.454-.208-.355-.022-.547.156-.724.16-.16.355-.417.533-.625.178-.208.237-.355.355-.592.119-.237.06-.444-.03-.622-.089-.178-.8-1.97-1.115-2.688z" fill="white"/>
      </svg>
    </a>
  );
}
