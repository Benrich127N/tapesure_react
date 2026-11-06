export default function CustomerFields({ value, onChange, disabled, prefix }) {
  const fields = [
    { key: "name", label: "Customer name", type: "text", autoComplete: "name", placeholder: "e.g. Amina Yusuf", required: true },
    { key: "phone", label: "Phone number", type: "tel", autoComplete: "tel", placeholder: "e.g. +234 801 234 5678", required: true },
    { key: "email", label: "Email", type: "email", autoComplete: "email", placeholder: "e.g. amina@example.com", required: false },
  ];
  return <fieldset disabled={disabled} className="min-w-0 space-y-4">
    <legend className="sr-only">Customer contact information</legend>
    {fields.map((field) => <div key={field.key}>
      <label htmlFor={`${prefix}-${field.key}`} className="mb-2 block text-sm font-medium text-gray-200">{field.label} <span className="text-xs text-gray-400">{field.required ? "(required)" : "(optional)"}</span></label>
      <input id={`${prefix}-${field.key}`} name={field.key} type={field.type} autoComplete={field.autoComplete} required={field.required} value={value[field.key]} onChange={(event) => onChange({ ...value, [field.key]: event.target.value })} placeholder={field.placeholder} className="min-h-11 w-full rounded-lg border border-gray-600 bg-gray-950 px-3 py-2 text-base text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-400 disabled:opacity-60" />
    </div>)}
  </fieldset>;
}
