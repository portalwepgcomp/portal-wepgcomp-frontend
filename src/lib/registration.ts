export function isRegistrationOpen(
  value = process.env.REGISTRATION_OPEN,
): boolean {
  return value === "true";
}
