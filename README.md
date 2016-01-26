#bb.js

bb.js converts BBCode tags in the DOM into formatted HTML.

##What does it do?

It takes a snippet of the DOM:

```html
<p>This is a [color=green]test[/color].</p>
```

and converts all the BBCode tags to HTML:

```html
<p>This is a <span style="color: green;">test</span>.</p>
```

##Usage

```js
bb.parse(element);
```

```js
bb.parse(element, {
  allowURLs: false
});
```

##Options

`allowURLs` defaults to false. When set to true, `allowURLs` enables [url][/url] and [img][/img] tags. This option should only be enabled in trusted environments.
