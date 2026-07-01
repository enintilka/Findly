export interface PasswordValidationResult {
  valid: boolean;
  errors: string[];
}

const PASSWORD_RULES = [
  {
    test: (value: string) => value.length >= 8,
    message: "At least 8 characters",
  },
  {
    test: (value: string) => /[A-Z]/.test(value),
    message: "At least one uppercase letter",
  },
  {
    test: (value: string) => /[a-z]/.test(value),
    message: "At least one lowercase letter",
  },
  {
    test: (value: string) => /[0-9]/.test(value),
    message: "At least one number",
  },
  {
    test: (value: string) => /[^A-Za-z0-9]/.test(value),
    message: "At least one special character",
  },
] as const;

export function validatePassword(password: string): PasswordValidationResult {
  const errors = PASSWORD_RULES.filter((rule) => !rule.test(password)).map(
    (rule) => rule.message,
  );

  return { valid: errors.length === 0, errors };
}

export function getPasswordRuleChecks(password: string) {
  return PASSWORD_RULES.map((rule) => ({
    message: rule.message,
    passed: rule.test(password),
  }));
}

export function validateRequiredFields(
  fields: Record<string, string>,
  labels: Record<string, string>,
): string[] {
  return Object.entries(fields)
    .filter(([, value]) => !value.trim())
    .map(([key]) => `${labels[key]} is required.`);
}

export function readFileAsDataUrl(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(String(reader.result));
    reader.onerror = () => reject(new Error("Failed to read file."));
    reader.readAsDataURL(file);
  });
}
