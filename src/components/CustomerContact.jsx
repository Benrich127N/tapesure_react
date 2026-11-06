import { Mail, Phone } from "lucide-react";
import { phoneHref } from "../utils/customers";

export default function CustomerContact({ customer }) {
  const telephone = phoneHref(customer.phone);
  return <div className="min-w-0 text-sm text-gray-200">
    {telephone ? <a href={telephone} aria-label={`Call ${customer.name || "customer"} at ${customer.phone}`} className="flex min-h-11 items-center gap-2 rounded hover:text-indigo-200"><Phone aria-hidden="true" size={16} className="shrink-0 text-gray-400" /><span className="min-w-0 break-words">{customer.phone}</span></a> : <p className="flex min-h-11 items-center gap-2 text-gray-400"><Phone aria-hidden="true" size={16} className="shrink-0" />No phone number</p>}
    {customer.email && <a href={`mailto:${encodeURIComponent(customer.email.trim())}`} aria-label={`Email ${customer.name || "customer"} at ${customer.email}`} className="flex min-h-11 items-center gap-2 rounded hover:text-indigo-200"><Mail aria-hidden="true" size={16} className="shrink-0 text-gray-400" /><span className="min-w-0 break-all">{customer.email}</span></a>}
  </div>;
}
