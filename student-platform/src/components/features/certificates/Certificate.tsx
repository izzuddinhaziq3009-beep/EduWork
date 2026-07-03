// Adaptive font sizes so long names/titles stay inside the border
function nameFontSize(name: string): number {
  if (name.length <= 24) return 26
  if (name.length <= 36) return 19
  return 15
}
function titleFontSize(title: string): number {
  if (title.length <= 30) return 22
  if (title.length <= 46) return 16
  return 12
}

interface Props {
  studentName:     string
  moduleTitle:     string
  issuedDate:      string
  certificateCode: string
  id?:             string
}

export function Certificate({ studentName, moduleTitle, issuedDate, certificateCode, id }: Props) {
  return (
    <svg
      id={id}
      width="100%"
      viewBox="0 0 680 470"
      role="img"
      xmlns="http://www.w3.org/2000/svg"
    >
      {/* Outer border */}
      <rect x="16" y="16" width="648" height="438" rx="6" fill="#FFFFFF" stroke="#4F46E5" strokeWidth="2" />
      {/* Inner hairline */}
      <rect x="28" y="28" width="624" height="414" rx="3" fill="none" stroke="#C7D2FE" strokeWidth="1" />

      {/* Corner triangles */}
      <polygon points="16,16 52,16 16,52"   fill="#4F46E5" />
      <polygon points="664,16 628,16 664,52" fill="#14B8A6" />
      <polygon points="16,454 52,454 16,418" fill="#14B8A6" />
      <polygon points="664,454 628,454 664,418" fill="#4F46E5" />

      {/* Logo mark */}
      <g transform="translate(323,44) scale(1.06)">
        <rect x="2" y="2" width="28" height="28" rx="7" fill="#4F46E5" />
        <path d="M9 20.5L16 9l7 11.5H17.5L16 18l-1.5 2.5H9z" fill="#FFFFFF" />
        <circle cx="16" cy="22.5" r="1.5" fill="#FFFFFF" />
      </g>

      {/* Brand name + tagline */}
      <text x="340" y="102" textAnchor="middle" fontSize="21" fontWeight="500" fill="#4F46E5">
        Eduwork
      </text>
      <text x="340" y="120" textAnchor="middle" fontSize="11" fill="#64748B">
        Learning and Experience Platform
      </text>

      {/* Title */}
      <text x="340" y="168" textAnchor="middle" fontFamily="serif" fontSize="30" fontWeight="500" fill="#1E293B">
        Certificate of Completion
      </text>
      <rect x="290" y="182" width="100" height="3" rx="1.5" fill="#14B8A6" />

      {/* Preamble */}
      <text x="340" y="216" textAnchor="middle" fontSize="13" fill="#64748B">
        This is to certify that
      </text>

      {/* Student name */}
      <text
        x="340" y="252"
        textAnchor="middle"
        fontFamily="serif"
        fontSize={nameFontSize(studentName)}
        fontWeight="500"
        fill="#1E293B"
      >
        {studentName}
      </text>
      <rect x="150" y="262" width="380" height="1" fill="#CBD5E1" />

      {/* Completion text */}
      <text x="340" y="292" textAnchor="middle" fontSize="13" fill="#64748B">
        has successfully completed the learning module
      </text>

      {/* Module title */}
      <text
        x="340" y="326"
        textAnchor="middle"
        fontSize={titleFontSize(moduleTitle)}
        fontWeight="500"
        fill="#14B8A6"
      >
        {moduleTitle}
      </text>

      {/* Footer — left: issue date */}
      <rect x="72" y="404" width="140" height="1" fill="#CBD5E1" />
      <text x="72" y="392" fontSize="11" fontWeight="500" fill="#94A3B8">
        Issue date
      </text>
      <text x="72" y="424" fontSize="14" fill="#1E293B">
        {issuedDate}
      </text>

      {/* Footer — right: certificate id */}
      <rect x="468" y="404" width="140" height="1" fill="#CBD5E1" />
      <text x="608" y="392" textAnchor="end" fontSize="11" fontWeight="500" fill="#94A3B8">
        Certificate ID
      </text>
      <text x="608" y="424" textAnchor="end" fontSize="14" fill="#1E293B">
        {certificateCode}
      </text>

      {/* Disclaimer */}
      <text x="340" y="442" textAnchor="middle" fontSize="11" fill="#94A3B8">
        This certificate verifies completion of an EduWork learning module and is not an accredited qualification.
      </text>
    </svg>
  )
}
