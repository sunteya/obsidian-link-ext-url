import { syntaxTree } from "@codemirror/language"
import { App, editorInfoField, MarkdownView } from 'obsidian'
import {
  RangeSetBuilder,
  Extension,
} from "@codemirror/state"
import {
  Decoration,
  DecorationSet,
  EditorView,
  WidgetType,
  PluginValue,
  ViewUpdate,
  ViewPlugin,
} from "@codemirror/view"

export class ExtLinkWidget extends WidgetType {
  url: string

  constructor(url: string) {
    super()
    this.url = url
  }

  toDOM(view: EditorView): HTMLElement {
    const link = document.createElement("a")
    link.className = "cm-link-ext-url cm-url"
    link.href = this.url
    link.innerText = this.url
    return link
  }
}

function buildDecorations(view: EditorView): DecorationSet {
  const builder = new RangeSetBuilder<Decoration>()
  const mdView = view.state.field(editorInfoField) as MarkdownView;

  let linkFrom: number
  let linkTo: number
  let isFormatting = false

  for (let { from, to } of view.visibleRanges) {
    syntaxTree(view.state).iterate({
      from,
      to,
      enter(node) {
        const names = node.type.name.split("_")

        let type = ""
        if (names.includes("hmd-internal-link")) {
          if (names.includes("link-has-alias")) {
            type = "internal-link-alias"
          } else if (names.includes("link-alias-pipe")) {
            type = "link-alias-pipe"
          } else if (names.includes("link-alias")) {
            type = "link-alias"
          } else {
            type = "internal-link"
          }
        }


        if (names.includes("formatting-link-start")) {
          linkFrom = node.to
        }

        if (["internal-link-alias", "internal-link"].includes(type)) {
          // linkFrom = node.from
          linkTo = node.to
        }

        if (names.includes("formatting-link-end")) {
          let text = view.state.doc.sliceString(linkFrom, linkTo)
          let file = app.metadataCache.getFirstLinkpathDest(text, mdView.file.basename);
          const cache = file ? app.metadataCache.getFileCache(file) : null
          if (!cache) {
            return
          }

          const tags: string[] = cache.frontmatter?.['tags'] ?? []
          const url = cache.frontmatter?.['url'] ?? null
          if (!tags.includes("link") || !url) {
            return
          }

          builder.add(
            node.to,
            node.to,
            Decoration.widget({
              widget: new ExtLinkWidget(url)
            })
          )
        }
      },
    })
  }

  return builder.finish()
}


export function buildEditorExtension(app2: App): Extension {
  class EditorPlugin implements PluginValue {
    decorations: DecorationSet

    constructor(view: EditorView) {
      this.decorations = buildDecorations(view)
    }

    update(update: ViewUpdate) {
      if (update.docChanged || update.viewportChanged) {
        this.decorations = buildDecorations(update.view)
      }
    }

    destroy() {}
  }

  const editorPlugin = ViewPlugin.fromClass(EditorPlugin,
    { decorations: (value: EditorPlugin) => value.decorations }
  )

  return editorPlugin
}
