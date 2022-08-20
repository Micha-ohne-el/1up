export function inlineCode(content: string) {
  return '`' + escapeForInlineCode(content) + '`';
}

export function codeBlock(content: string) {
  return '```\n' + escapeForCodeBlock(content) + '\n```';
}

function escapeForInlineCode(text: string): string {
  return text.replaceAll(/`/g, '\`');
}

function escapeForCodeBlock(text: string): string {
  return text.replaceAll(/```/g, '``\u200B`'); // inserts a no-break space.
}
