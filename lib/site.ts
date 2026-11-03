export function siteName(): string {
  return process.env.NEXT_PUBLIC_SITE_NAME?.trim() || "@FindMe";
}
