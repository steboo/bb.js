/* exported bb */
var bb = (function() {
  var allowURLs = false;

  function isColor(color) {
    return color.match(/^(?:[a-z]+|#[0-9a-f]{3}|#[0-9a-f]{6})$/i);
  }

  function convertTag(tag) {
    // todo: ignore non-sensical tags by leaving them as text
    // todo: handle additional tags
    //  list/*
    //  table/tr/td
    // todo: handle alternate syntax of some tags:
    //  url
    //  img
    var el,
      tokens = tag.split(/[ =]/),
      tagName = tokens[0].toLowerCase(),
      spanTagNames = ['color', 'style', 'b', 'i', 'u', 's'];

    if (tagName == 'code') {
      el = document.createElement('code'); // some implementations might use pre
    } else if (tagName == 'quote') {
      el = document.createElement('blockquote');
    } else if (allowURLs && tagName == 'img') {
      el = document.createElement('img');

      if (tokens[1] == 'src') {
        el.setAttribute('src', tokens[2]);
      } else {
        el.setAttribute('src', tokens[1]);
      }

      el.setAttribute('alt', '');  
    } else if (allowURLs && tagName == 'url') {
      el = document.createElement('a');
      el.setAttribute('href', tokens[1]);
    } else if (spanTagNames.indexOf(tagName) != -1) {
      el = document.createElement('span');

      if ((tagName == 'color' && isColor(tokens[1])) ||
        (tagName == 'style' && tokens[1] == 'color' && isColor(tokens[2]))) {
        el.setAttribute('style', 'color: ' + (tokens[2] || tokens[1]) + ';');
      } else if (tagName == 'u') {
        el.setAttribute('style', 'text-decoration: underline;');
      } else if (tagName == 'b') {
        el.setAttribute('style', 'font-weight: bold;');
      } else if (tagName == 'i') {
        el.setAttribute('style', 'font-style: italic;');
      } else if (tagName == 's') {
        el.setAttribute('style', 'text-decoration: line-through;');
      }
    } else {
      // todo: temporary
      el = document.createElement('span');
    }

    return el;
  }

  function parseTextNode(textNode, tagStack) {
    var inTag = false,
      isOpen = false,
      newNodes = [],
      writeText = '',
      openTagName = '',
      canSlash = false,
      c, cn, tagNode, writeTextNode;

    for (var i = 0; i < textNode.nodeValue.length; i++) {
      c = textNode.nodeValue.charAt(i);

      if (i + 1 < textNode.nodeValue.length) {
        cn = textNode.nodeValue.charAt(i + 1);
      } else {
        cn = null;
      }

      if (!inTag && c == '[') {
        inTag = true;
        isOpen = cn != '/'; // look ahead to see if this is an open tag or a close tag
        canSlash = true;

        if (writeText) {
          writeTextNode = document.createTextNode(writeText);
        }

        if (tagStack.length > 0) {
          if (isOpen) {
            tagNode = tagStack[tagStack.length - 1]; // peek
          } else {
            tagNode = tagStack.pop();
          }

          if (writeText) {
            tagNode.appendChild(writeTextNode);
          }

          if (!isOpen) {
            if (tagStack.length > 0) {
              tagStack[tagStack.length - 1].appendChild(tagNode);
            } else {
              newNodes.push(tagNode);
            }
          }
        } else if (writeText) {
          newNodes.push(writeTextNode);
        }

        writeText = c;
      } else if (canSlash && c == '/') {
        isOpen = false;
        writeText += c;
      } else if (inTag && c == ']') {
        inTag = false;
        canSlash = false;
        writeText += c;

        if (isOpen) {          
          tagNode = convertTag(openTagName);
          tagStack.push(tagNode);
        }

        openTagName = '';
        writeText = '';
      } else if (inTag) {
        canSlash = false;
        openTagName += c;
        writeText += c;
      } else {
        writeText += c;
      }
    }

    if (writeText) {
      newNodes.push(document.createTextNode(writeText));
    }

    return newNodes;
  }

  function rparse(el, tagStack) {
    var liveChildren = el.childNodes,
      children = [].slice.call(liveChildren),
      replacementNodes = [],
      newEl;

    for (var i = 0; i < children.length; i++) {
      if (children[i].nodeType == Node.TEXT_NODE) { // 3
        replacementNodes.push.apply(replacementNodes, parseTextNode(children[i], tagStack));
      } else {
        newEl = rparse(children[i], tagStack);

        if (tagStack.length > 0) {
          tagStack[tagStack.length - 1].appendChild(newEl);
        } else {
          replacementNodes.push(newEl);
        }
      }
    }

    // Update DOM. Replace children with new children.
    while (el.firstChild) {
      el.removeChild(el.firstChild);
    }

    replacementNodes.forEach(function (n) {
      el.appendChild(n);
    });

    return el;
  }

  function parse(el, options) {
    if (options) {
      allowURLs = options.allowURLs === true;
    }

    rparse(el, []);
  }

  return {
    parse: parse
  };
})();