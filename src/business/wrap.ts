export function inlineCode(parts: TemplateStringsArray, ...params: unknown[]) {
  const content = escapeForInlineCode(String.raw(parts, ...params));

  return '`' + content + '`';
}

export function codeBlock(parts: TemplateStringsArray, ...params: unknown[]) {
  const content = escapeForCodeBlock(String.raw(parts, ...params));

  return '```\n' + content + '\n```';
}

function escapeForInlineCode(text: string): string {
  return text.replaceAll(/`/g, '\`');
}

function escapeForCodeBlock(text: string): string {
  return text.replaceAll(/```/g, '``\u200B`'); // inserts a no-break space.
}
