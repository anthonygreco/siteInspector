'use strict';
$(function() {
  $('#foo').on({
    mouseenter: function() {
      console.log('#foo mouseenter');
    },
    mouseleave: function() {
      console.log('#foo mouseleave');
    },
    click: function() {
      console.log('#foo click');
    }
  });
  $('body').siteInspector({
    debug: true,
    showTags: true
  });
});