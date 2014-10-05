$(function() {
<<<<<<< HEAD
  $('body').siteInspector({
    debug: true,
    showTags: true
=======
  $('*').on({
    click: function(event) {
      event.stopPropagation();
      var uniqueSelector = $(event.target).uniqueSelector();
      $(uniqueSelector).fadeOut('fast', function() {
        $(uniqueSelector).fadeIn('fast');
      });
    }
>>>>>>> f0c9b4dd6d6d895a9a14c6aadc68718fcdd50f21
  });
});