// Phone numbers for the lead form: a short list of the countries clients usually write from,
// each with its exact number length and grouping, plus "other" for any international number.

export type PhoneCountry = {
  iso: string;
  dial: string;
  // Digit groups for display; they add up to the longest allowed number.
  groups: number[];
  minDigits: number;
  // Domestic prefix people often type before the number, like the Armenian "0".
  trunk?: string;
};

export const PHONE_COUNTRIES: PhoneCountry[] = [
  { iso: "AM", dial: "+374", groups: [2, 2, 2, 2], minDigits: 8, trunk: "0" },
  { iso: "RU", dial: "+7", groups: [3, 3, 2, 2], minDigits: 10, trunk: "8" },
  { iso: "US", dial: "+1", groups: [3, 3, 4], minDigits: 10, trunk: "1" },
  { iso: "FR", dial: "+33", groups: [1, 2, 2, 2, 2], minDigits: 9, trunk: "0" },
  { iso: "GE", dial: "+995", groups: [3, 2, 2, 2], minDigits: 9, trunk: "0" },
  { iso: "UA", dial: "+380", groups: [2, 3, 2, 2], minDigits: 9, trunk: "0" },
  { iso: "DE", dial: "+49", groups: [3, 4, 4], minDigits: 7, trunk: "0" },
  { iso: "GB", dial: "+44", groups: [4, 6], minDigits: 10, trunk: "0" },
  { iso: "CA", dial: "+1", groups: [3, 3, 4], minDigits: 10, trunk: "1" },
  { iso: "KZ", dial: "+7", groups: [3, 3, 2, 2], minDigits: 10, trunk: "8" },
  { iso: "BY", dial: "+375", groups: [2, 3, 2, 2], minDigits: 9 },
  { iso: "ES", dial: "+34", groups: [3, 2, 2, 2], minDigits: 9 },
  { iso: "IT", dial: "+39", groups: [3, 3, 4], minDigits: 9 },
  { iso: "GR", dial: "+30", groups: [3, 3, 4], minDigits: 10 },
  { iso: "AE", dial: "+971", groups: [2, 3, 4], minDigits: 9, trunk: "0" },
  { iso: "IR", dial: "+98", groups: [3, 3, 4], minDigits: 10, trunk: "0" },
  { iso: "LB", dial: "+961", groups: [2, 3, 3], minDigits: 7, trunk: "0" },
];

export const DEFAULT_PHONE_COUNTRY = "AM";

// Any other country: the visitor types the country code and number; E.164 caps a number at 15 digits.
export const OTHER_PHONE_COUNTRY = "other";
const OTHER_MIN_DIGITS = 8;
const OTHER_MAX_DIGITS = 15;

const maxDigits = (country: PhoneCountry) => country.groups.reduce((sum, size) => sum + size, 0);

function findCountry(iso: string): PhoneCountry | undefined {
  return PHONE_COUNTRIES.find((country) => country.iso === iso);
}

export function isPhoneCountry(iso: string): boolean {
  return iso === OTHER_PHONE_COUNTRY || findCountry(iso) !== undefined;
}

// The number's digits without the country code, typed or pasted in any common form:
// "91 23 45 67", "+374 91 234567", "37491234567" or the domestic "091 234 567".
export function phoneDigits(iso: string, input: string): string {
  let digits = input.replace(/\D/g, "");
  const country = findCountry(iso);
  if (!country) return digits.slice(0, OTHER_MAX_DIGITS);

  const max = maxDigits(country);
  const dial = country.dial.slice(1);
  if (digits.length > max && digits.startsWith(dial)) digits = digits.slice(dial.length);
  if (digits.length > max && country.trunk && digits.startsWith(country.trunk))
    digits = digits.slice(country.trunk.length);
  return digits.slice(0, max);
}

// Groups the digits the way the country writes them, as far as they go: "912" -> "91 2".
export function formatPhoneDigits(iso: string, input: string): string {
  const digits = phoneDigits(iso, input);
  const country = findCountry(iso);
  if (!country) return digits;

  const parts: string[] = [];
  let rest = digits;
  for (const size of country.groups) {
    if (!rest) break;
    parts.push(rest.slice(0, size));
    rest = rest.slice(size);
  }
  return parts.join(" ");
}

export function isValidPhone(iso: string, input: string): boolean {
  const length = phoneDigits(iso, input).length;
  const country = findCountry(iso);
  if (!country) return iso === OTHER_PHONE_COUNTRY && length >= OTHER_MIN_DIGITS;
  return length >= country.minDigits;
}

// The full number in the format we store and show: "+374 91 23 45 67".
export function formatFullPhone(iso: string, input: string): string {
  const country = findCountry(iso);
  return country ? `${country.dial} ${formatPhoneDigits(iso, input)}` : `+${phoneDigits(iso, input)}`;
}

export function phoneDialPrefix(iso: string): string {
  return findCountry(iso)?.dial ?? "+";
}

// An example number in the country's own grouping, for the placeholder.
export function phonePlaceholder(iso: string): string {
  const country = findCountry(iso);
  if (!country) return "";
  const sample = "912345678901".slice(0, maxDigits(country));
  return formatPhoneDigits(iso, sample);
}

// 🇦🇲 from "AM".
export function flagEmoji(iso: string): string {
  if (!findCountry(iso)) return "🌐";
  return iso.replace(/./g, (letter) => String.fromCodePoint(127397 + letter.charCodeAt(0)));
}
