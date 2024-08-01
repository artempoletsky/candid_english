// "use server";

import type { GlobalScope } from "@artempoletsky/kurgandb";

const pluginDef = {
  npm: [],
  install({ _ }: GlobalScope) {
    const postLinksRegEx = /&gt;&gt;\d+/g;
    const opLinksRegEx = /&gt;&gt;OP+/g;
    const breakRegEx = /[\n]/g;
    const multiBreakRegEx = /[\n]{3,}/g;

    return {
      prepareComment(text: string): string {
        text = text.trim();
        text = text.replaceAll("\r", "").replaceAll(multiBreakRegEx, "\n\n");

        text = _.escape(text);
        let lines = text.split(breakRegEx);

        lines = lines.map(text => {
          return text.replaceAll(
            postLinksRegEx,
            sub => `<span class="pl" data-comment="${sub.slice(8)}">${sub}</span>`
          );
        });

        lines = lines.map(text => {
          return text.replaceAll(opLinksRegEx, `<span class="pl_op"">&gt;&gt;OP</span>`);
        });

        lines = lines.map(text => {
          if (text.startsWith("&gt;")) {
            return `<span class="q">${text}</span>`;
          }
          return text;
        });

        return lines.join("<br/>");
      }
    }
  }
};


export default pluginDef;