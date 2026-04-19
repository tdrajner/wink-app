// src/components/CategoryIllustration.jsx

const illustrations = {
  ciclismo: () => (
    <svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <rect width="360" height="160" fill="#1a1135"/>
      <circle cx="300" cy="28" r="18" fill="#3C3489"/>
      <path d="M0 100 Q60 82 120 100 Q180 118 240 97 Q300 76 360 100 L360 160 L0 160Z" fill="#26215C"/>
      <circle cx="80" cy="120" r="17" fill="none" stroke="#7F77DD" strokeWidth="3"/>
      <circle cx="240" cy="122" r="17" fill="none" stroke="#7F77DD" strokeWidth="3"/>
      <path d="M97 112 L160 108 L220 112" stroke="#5F5E5A" strokeWidth="2" fill="none"/>
      <circle cx="160" cy="50" r="2" fill="#FAC775" opacity=".9"/>
      <circle cx="200" cy="35" r="1.5" fill="#FAC775" opacity=".7"/>
      <circle cx="130" cy="30" r="1.5" fill="#FAC775"/>
      <circle cx="260" cy="42" r="1.5" fill="#FAC775" opacity=".6"/>
      <circle cx="330" cy="60" r="1" fill="#FAC775" opacity=".5"/>
    </svg>
  ),

  cenas: () => (
    <svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <rect width="360" height="160" fill="#712B13"/>
      <circle cx="360" cy="0" r="80" fill="#993C1D"/>
      <circle cx="0" cy="160" r="60" fill="#993C1D" opacity=".5"/>
      <rect x="45" y="45" width="46" height="74" rx="4" fill="#D85A30" opacity=".9"/>
      <rect x="101" y="32" width="46" height="87" rx="4" fill="#D85A30"/>
      <rect x="157" y="50" width="46" height="69" rx="4" fill="#D85A30" opacity=".85"/>
      <rect x="213" y="38" width="46" height="81" rx="4" fill="#D85A30" opacity=".9"/>
      <rect x="269" y="55" width="46" height="64" rx="4" fill="#D85A30" opacity=".75"/>
      <rect x="30" y="117" width="310" height="5" rx="2" fill="#4A1B0C"/>
      <circle cx="195" cy="18" r="11" fill="#EF9F27" opacity=".85"/>
      <circle cx="175" cy="20" r="7" fill="#EF9F27" opacity=".6"/>
    </svg>
  ),

  museos: () => (
    <svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <rect width="360" height="160" fill="#042C53"/>
      <rect x="0" y="120" width="360" height="40" fill="#0C447C"/>
      <path d="M60 120 L60 55 L98 55 L98 120Z" fill="#185FA5"/>
      <path d="M79 44 L50 55 L108 55Z" fill="#378ADD"/>
      <path d="M158 120 L158 50 L196 50 L196 120Z" fill="#185FA5"/>
      <path d="M177 39 L147 50 L207 50Z" fill="#378ADD"/>
      <path d="M256 120 L256 55 L294 55 L294 120Z" fill="#185FA5"/>
      <path d="M275 44 L246 55 L304 55Z" fill="#378ADD"/>
      <rect x="30" y="120" width="310" height="7" rx="2" fill="#0C447C"/>
      <rect x="67" y="65" width="6" height="47" rx="1" fill="#85B7EB" opacity=".5"/>
      <rect x="83" y="65" width="6" height="47" rx="1" fill="#85B7EB" opacity=".5"/>
    </svg>
  ),

  montaña: () => (
    <svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <rect width="360" height="160" fill="#085041"/>
      <ellipse cx="180" cy="160" rx="220" ry="80" fill="#0F6E56"/>
      <path d="M0 90 Q40 60 80 80 Q120 100 160 70 Q200 40 240 65 Q280 90 320 60 Q350 40 360 55 L360 160 L0 160Z" fill="#1D9E75" opacity=".7"/>
      <path d="M60 90 L90 30 L120 90Z" fill="#5DCAA5" opacity=".5"/>
      <path d="M160 96 L200 24 L240 96Z" fill="#5DCAA5" opacity=".45"/>
      <path d="M270 93 L295 40 L320 93Z" fill="#5DCAA5" opacity=".5"/>
      <circle cx="290" cy="24" r="16" fill="#9FE1CB" opacity=".25"/>
    </svg>
  ),

  conciertos: () => (
    <svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <rect width="360" height="160" fill="#26215C"/>
      <ellipse cx="180" cy="130" rx="160" ry="50" fill="#3C3489" opacity=".6"/>
      <rect x="140" y="50" width="80" height="80" rx="4" fill="#534AB7" opacity=".5"/>
      <circle cx="180" cy="90" r="30" fill="none" stroke="#7F77DD" strokeWidth="2"/>
      <circle cx="180" cy="90" r="10" fill="#AFA9EC"/>
      <line x1="180" y1="60" x2="180" y2="35" stroke="#7F77DD" strokeWidth="2"/>
      <circle cx="60" cy="120" r="2" fill="#FAC775"/><circle cx="100" cy="110" r="1.5" fill="#FAC775" opacity=".8"/>
      <circle cx="280" cy="115" r="2" fill="#FAC775"/><circle cx="310" cy="100" r="1.5" fill="#FAC775" opacity=".7"/>
      <line x1="0" y1="140" x2="360" y2="140" stroke="#7F77DD" strokeWidth="1" opacity=".3"/>
      <rect x="30" y="100" width="4" height="40" fill="#7F77DD" opacity=".3"/>
      <rect x="326" y="100" width="4" height="40" fill="#7F77DD" opacity=".3"/>
    </svg>
  ),

  default: () => (
    <svg viewBox="0 0 360 160" xmlns="http://www.w3.org/2000/svg" style={{width:'100%',height:'100%',display:'block'}}>
      <rect width="360" height="160" fill="#D85A30"/>
      <circle cx="320" cy="30" r="60" fill="#F0997B" opacity=".4"/>
      <circle cx="40" cy="140" r="50" fill="#993C1D" opacity=".4"/>
      <circle cx="180" cy="80" r="40" fill="#F5C4B3" opacity=".2"/>
    </svg>
  ),
}

export default function CategoryIllustration({ category, subcategory }) {
  const key = subcategory || category || 'default'
  const Illustration = illustrations[key] || illustrations[category] || illustrations.default
  return <Illustration />
}
