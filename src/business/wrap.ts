export function inlineCode(parts: TemplateStringsArray, ...params: unknown[]) {
  const content = escapeForInlineCode(String.raw(parts, ...params));

  return '`' + content + '`';
}

function escapeForInlineCode(text: string): string {
  return text.replaceAll(/`/g, '\`');
}
