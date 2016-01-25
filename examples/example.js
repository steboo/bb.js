(function() {
  function bind() {
    var buttons = document.getElementsByTagName('button');
    buttons[0].addEventListener('click', test, false);
  }

  function test() {
    var p = document.getElementsByTagName('p'),
      // p is a live collection, so we need to make it static to avoid any
      // surprises.
      arr = [].slice.call(p);

    for (var i = 0; i < arr.length; i++) {
      bb.parse(arr[i]);
    }
  }

  bind();
})();