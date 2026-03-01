import DOMPurify from "dompurify";
import parse from "html-react-parser";

function decodeHtmlEntities(html: string) {
  const txt = document.createElement("textarea");
  txt.innerHTML = html;
  return txt.value;
}

export const renderSafeHtml = (html: string) => {
  if (typeof window === undefined) return null;

  const decodedHtml = decodeHtmlEntities(html);
  const cleanHtml = DOMPurify.sanitize(decodedHtml, {
    USE_PROFILES: { html: true },
  });
  return parse(cleanHtml);
};
