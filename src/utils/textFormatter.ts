
export const formatAIText = (text: string): string => {
  if (!text) return '';

  // Convert **text** to <strong>text</strong>
  let formattedText = text.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>');

  // Convert \n\n to line breaks
  formattedText = formattedText.replace(/\n\n/g, '<br><br>');

  // Convert literal \n to line breaks (handle escaped newlines from JSON)
  formattedText = formattedText.replace(/\\n/g, '<br>');

  // Convert real \n to line breaks
  formattedText = formattedText.replace(/\n/g, '<br>');

  return formattedText;
};
