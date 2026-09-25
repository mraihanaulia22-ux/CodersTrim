/**
 * Weight mapping to sort classes according to official Tailwind recommendations.
 */
function getClassCategoryWeight(cls: string): number {
  // Modifiers (hover:, dark:, etc.) come last
  if (cls.includes(':')) {
    return 100;
  }

  // 1. Layout & Positioning
  if (/^(relative|absolute|fixed|sticky|static|inset|top|bottom|left|right|z-)/.test(cls)) {
    return 10;
  }

  // 2. Display & Flex/Grid Box Model
  if (/^(block|inline|flex|grid|hidden|items-|justify-|content-|self-|place-|col-|row-|gap-)/.test(cls)) {
    return 20;
  }

  // 3. Sizing
  if (/^(w-|min-w-|max-w-|h-|min-h-|max-h-)/.test(cls)) {
    return 30;
  }

  // 4. Spacing (Padding & Margin)
  if (/^(p-|px-|py-|pt-|pb-|pl-|pr-|m-|mx-|my-|mt-|mb-|ml-|mr-)/.test(cls)) {
    return 40;
  }

  // 5. Typography
  if (/^(text-|font-|leading-|tracking-|italic|uppercase|lowercase|capitalize)/.test(cls)) {
    return 50;
  }

  // 6. Visuals (Backgrounds, Borders, Effects)
  if (/^(bg-|border|rounded|shadow|opacity|backdrop-|overflow-)/.test(cls)) {
    return 60;
  }

  // 7. Transitions & Animation
  if (/^(transition|duration|ease-|animate-|cursor-|select-)/.test(cls)) {
    return 70;
  }

  return 80;
}

/**
 * Sorts a string of space-separated Tailwind classes into standardized order.
 */
export function sortTailwindClasses(classString: string): string {
  const tokens = classString.trim().split(/\s+/).filter(Boolean);
  if (tokens.length <= 1) return classString;

  const sorted = [...tokens].sort((a, b) => {
    const weightA = getClassCategoryWeight(a);
    const weightB = getClassCategoryWeight(b);

    if (weightA !== weightB) {
      return weightA - weightB;
    }

    return a.localeCompare(b);
  });

  return sorted.join(' ');
}
