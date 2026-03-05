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
      <svg width="30" height="30" viewBox="0 0 32 32" fill="none" xmlns="http://www.w3.org/2000/svg">
        <path fillRule="evenodd" clipRule="evenodd" d="M16 2C8.268 2 2 8.268 2 16c0 2.47.67 4.785 1.838 6.77L2 30l7.43-1.82A13.94 13.94 0 0016 30c7.732 0 14-6.268 14-14S23.732 2 16 2zm0 25.6a11.56 11.56 0 01-5.895-1.616l-.422-.252-4.41 1.08 1.114-4.3-.275-.44A11.6 11.6 0 014.4 16C4.4 9.59 9.59 4.4 16 4.4c6.41 0 11.6 5.19 11.6 11.6 0 6.41-5.19 11.6-11.6 11.6z" fill="white"/>
        <path d="M22.003 19.37c-.33-.165-1.952-.963-2.255-1.073-.303-.11-.523-.165-.744.165-.22.33-.854 1.073-1.047 1.293-.193.22-.386.247-.716.082-.33-.165-1.394-.514-2.656-1.638-.981-.875-1.643-1.956-1.836-2.286-.193-.33-.02-.508.145-.672.149-.148.33-.385.496-.578.165-.193.22-.33.33-.55.11-.22.055-.413-.028-.578-.082-.165-.744-1.793-.018-2.453.6-.55 1.54-.083 1.54-.083s.275.028.413.275c.138.248.578 1.32.633 1.43.055.11.082.247.028.385-.055.138-.11.22-.22.33-.11.11-.22.247-.303.33-.083.082-.165.193-.082.413.082.22.358.77.77 1.25.55.633 1.02.853 1.237.936.22.083.358.055.496-.083.138-.138.578-.688.716-.936.138-.248.275-.193.468-.11.193.083 1.238.578 1.458.688.22.11.358.165.413.247.055.083.055.495-.275.826-.33.33-1.237 1.155-2.78.578z" fill="white"/>
      </svg>
    </a>
  );
}
