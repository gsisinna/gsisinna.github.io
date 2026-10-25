---
title: "{{title}}"
excerpt: "One or two sentences that sell the post. Shown in lists, search results, and link previews."
date: {{date}}
# updated: {{date}}          # uncomment when you meaningfully revise a published post
tags: [{{tags}}]
# image: "/images/cover.jpg"  # cover image (16:9 works best); also used for social previews
# imageAlt: "What the cover shows"   # for screen readers; defaults to the title
# imageFit: "contain"          # "cover" (default, photos) or "contain" (diagrams, screenshots, logos)
# imagePosition: "center"      # focal point for "cover", e.g. "left", "50% 30%"
# readingTime: "8 min read"   # optional: computed automatically from the text
draft: true                   # drafts show only in `npm run dev`; set to false to publish
---

Open with the problem or the moment that made you write this. One short paragraph is enough: why should
someone keep reading?

## Context

What were you working on, what constraints did you have, and what did "good" look like?

## What I did

Walk through the approach. Use short sections with `##` headings: posts with three or more of them get an
automatic "On this page" table of contents.

<aside class="callout callout-note">
  <p class="callout-title">Key idea</p>
  <p>Use a callout for the one idea a reader should remember. Variants: <code>callout-note</code>,
  <code>callout-tip</code>, <code>callout-warn</code>.</p>
</aside>

### Code

Name the language after the opening fence to get syntax highlighting. Add `title="file.ext"` for a file
label and `showLineNumbers` for line numbers:

```cpp title="tick_publisher.cpp" showLineNumbers
#include <rclcpp/rclcpp.hpp>

int main(int argc, char** argv) {
  rclcpp::init(argc, argv);
  auto node = rclcpp::Node::make_shared("tick_publisher");
  rclcpp::spin(node);
  return 0;
}
```

Highlight lines with `{2,4-5}` after the language, or with a `[!code highlight]` comment:

```python {2}
def clamp(value, low, high):
    return max(low, min(value, high))
```

Show changes with `[!code ++]` and `[!code --]` comments:

```ts
const timeoutMs = 500; // [!code --]
const timeoutMs = 2000; // [!code ++]
```

Plain terminal output works without a language:

```
$ colcon build --symlink-install
Summary: 4 packages finished [12.3s]
```

### Images

<figure>
  <img src="/og-default.png" alt="Describe what the image shows" loading="lazy" decoding="async" />
  <figcaption>Caption: what to notice, plus the image source if it is not yours. Put your own images in
  <code>public/images/</code> and reference them as <code>/images/name.jpg</code>. Readers can click
  any article image to view it full size.</figcaption>
</figure>

### Tables

| Option | Pros | Cons |
| --- | --- | --- |
| A | Simple | Slower |
| B | Fast | More moving parts |

<details class="callout">
  <summary>Optional deep dive</summary>
  <p>Put details most readers can skip inside a collapsible block.</p>
</details>

## What I learned

The takeaways, the trade-offs, and what you would do differently next time.

## Final thought

Close with one or two sentences. Optionally link to the repo or a related note.
