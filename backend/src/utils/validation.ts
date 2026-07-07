/**
 * Validation utilities for CRM records and CSV data.
 */

/**
 * Check if a record has at least an email or mobile number.
 */
export function hasContactInfo(record: Record<string, string>): boolean {
  const values = Object.values(record).map((v) => v.toLowerCase().trim());
  const keys = Object.keys(record).map((k) => k.toLowerCase().trim());

  // Check if any field that looks like email has a value with @
  const hasEmail = values.some((v) => v.includes("@") && v.includes("."));

  // Check if any field that looks like phone has digits
  const phoneKeywords = ["phone", "mobile", "contact", "cell", "tel", "number"];
  const hasPhone = keys.some((key, idx) => {
    if (phoneKeywords.some((kw) => key.includes(kw))) {
      return values[idx].replace(/[^0-9]/g, "").length >= 7;
    }
    return false;
  });

  // Also check if any value looks like a phone number (7+ digits)
  const hasPhoneValue = values.some(
    (v) => v.replace(/[^0-9]/g, "").length >= 7 && !v.includes("@")
  );

  return hasEmail || hasPhone || hasPhoneValue;
}

/**
 * Validate that the file is a CSV.
 */
export function isValidCSVFile(
  mimetype: string,
  originalname: string
): boolean {
  const validMimes = [
    "text/csv",
    "application/vnd.ms-excel",
    "text/plain",
    "application/csv",
  ];
  const hasValidMime = validMimes.includes(mimetype);
  const hasCSVExtension = originalname.toLowerCase().endsWith(".csv");

  return hasValidMime || hasCSVExtension;
}
