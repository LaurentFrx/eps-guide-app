export const hasCrossReference = (value: string): boolean => {
  const text = value.toLowerCase();
  return text.includes("idem") && text.includes("exercice");
};

export const isBlank = (value: string): boolean => value.trim().length === 0;
