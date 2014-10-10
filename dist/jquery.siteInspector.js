/*
 *  Site Inspector - v0.1.0
 *  A jQuery plugin to inspect a site's markup.
 *  https://github.com/anthonygreco/siteInspector
 *
 *  Made by Anthony Greco
 *  Under MIT License
 */
'use strict';
jQuery.fn.extend({
  uniqueSelector: function(selector) {
    selector = (typeof selector === 'undefined')? '' : selector;
    if(this.is('html')) {
      return 'html' + selector;
    }
    var current = this.get(0).nodeName.toLowerCase();
    current += (this.index() > -1)? ':nth-child(' + (this.index() + 1) + ')' : '';
    return this.parent().uniqueSelector(' > ' + current + selector);
  }
});

'use strict';
(function($, window, document, undefined) {
  var Inspector = {
    init: function(options, element) {
      var self = this;
      self.options = $.extend({}, $.fn.siteInspector.options, options);
      if(self.options.debug) {
        console.time('init');
      }
      self.data = {
        element: element,
        inspectionEnabled: false,
        isFrozen: false,
        inspectionTarget: undefined
      };
      self._buildUI();
      if(self.options.debug) {
        console.timeEnd('init');
      }
    },
    _buildUI: function() {
      var self = this,
      $cover = $('<div />', { class: 'cover ui' }),
      $overlay = $('<div />', { id: 'overlay', class: 'ui' }).append([$cover.clone(), $cover.clone(), $cover.clone(), $cover.clone()]),
      $inspectButton = $('<div />', { id: 'inspect', class: 'ui' }).on(self._bindInspection()).append($('<i />', { class: 'fa fa-search ui' })),
      $uiBox = $('<div />', { id: 'uiWrapper', class: 'ui' }).append($inspectButton);
      $('body').append([$uiBox, $overlay]);
      self._bindWindowEvents();
    },
    _bindWindowEvents: function() {
      var self = this;
      $(window).on({
        scroll: function() {
          self._refreshDisplay();
        },
        resize: function() {
          self._refreshDisplay();
        }
      });
    },
    _unbindWindowEvents: function() {
      $(window).off('scroll resize');
    },
    _bindInspection: function() {
      var self = this;
      return {
        click: function() {
          self._toggleInspection();
        },
        mouseenter: function() {
          if(!self.data.inspectionEnabled) {
            $(this).find('i').addClass('active');
          }
        },
        mouseleave: function() {
          if(!self.data.inspectionEnabled) {
            $(this).find('i').removeClass('active');
          }
        }
      };
    },
    _toggleInspection: function() {
      var self = this;
      self.data.inspectionEnabled = !self.data.inspectionEnabled;
      if(self.data.inspectionEnabled) {
        $(self.data.element).css('cursor', 'cell');
        $('#uiWrapper #inspect i').addClass('active');
        $(self.data.element).find('*:not(.ui)').on({
          mouseenter: function(e) {
            self.data.inspectionTarget = e.currentTarget;
            self._highlightElement();
          }
        });
      } else {
        if(self.data.isFrozen) {
          self.toggleFrozen();
        }
        $(self.data.element).css('cursor', 'default');
        $(self.data.element).find('*:not(.ui)').off();
        self.data.inspectionTarget = undefined;
        $('.cover').css({ width: 0, height: 0 });
        if(self.options.showTags) {
          $('.tag').remove();
        }
      }
    },
    _refreshDisplay: function() {
      var self = this;
      if(self.data.inspectionEnabled) {
        self._highlightElement();
      }
    },
    _showTags: function() {
      var self = this,
      elementInfo = {
        offset: $(self.data.inspectionTarget).offset(),
        height: $(self.data.inspectionTarget).outerHeight()
      };
      if($('.tag').length) {
        if($('.tag').data('selector') === $(self.data.inspectionTarget).uniqueSelector()) {
          return false;
        }
        $('.tag').remove();
      }
      var $tag = $('<div />', { class: 'tag ui' }).data('selector', $(self.data.inspectionTarget).uniqueSelector()).html(self._formatInfo()).appendTo(self.data.element);
      $tag.css({
        top: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.top + elementInfo.height,
        left: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 20 : elementInfo.offset.left,
        position: (elementInfo.offset.top + elementInfo.height + $tag.height() >= $(document).height())? 'fixed' : 'absolute'
      }).show();
    },
    _formatInfo: function() {
      var self = this,
      nodeName = '<span class="ui node">' + self.data.inspectionTarget.nodeName.toLowerCase() + '</span>',
      id = ($(self.data.inspectionTarget).attr('id') !== undefined)? '<span class="ui id">#' + $(self.data.inspectionTarget).attr('id') + '</span>' : '',
      className = (self.data.inspectionTarget.className !== '')? '<span class="ui className">.' + self.data.inspectionTarget.className.split(' ').join('.') + '</span>' : '';
      return nodeName + id + className + ' <span class="ui dimensions">' + $(self.data.inspectionTarget).outerWidth() + 'px <i class="ui fa fa-times" /> ' + $(self.data.inspectionTarget).outerHeight() + 'px</span>';
    },
    _highlightElement: function() {
      var self = this,
      $element = $(self.data.inspectionTarget);
      if($element.offset() !== undefined) {
        if(self.options.showTags) {
          self._showTags();
        }
        var trbl = {
          top: $element.offset().top - $(window).scrollTop(),
          left: $element.offset().left,
          bottom: ($element.offset().top - $(window).scrollTop()) + $element.height(),
          right: $element.offset().left + $element.width()
        },
        covers = [
          {// top
            top: 0,
            left: 0,
            width: (trbl.left === 0)? 0 : '100%',
            height: (trbl.top === 0)? 0 : trbl.top
          },
          {// left
            top: trbl.top,
            left: 0,
            width: trbl.left,
            height: $(window).height() - trbl.top
          },
          {// bottom
            top: trbl.top + $element.outerHeight(),
            left: trbl.left,
            width: $(window).width() - trbl.left,
            height: $(window).height() - trbl.bottom
          },
          {// right
            top: trbl.top,
            left: trbl.left + $element.outerWidth(),
            width: $(window).width() - (trbl.left + $element.outerWidth()),
            height: $element.outerHeight()
          }
        ];
        $('.cover').each(function(index) {
          $(this).css(covers[index]);
        });
      }
    },
    isEnabled: function() {
      var self = this;
      return self.data.inspectionEnabled;
    },
    toggleFrozen: function() {
      var self = this;
      self.data.isFrozen = !self.data.isFrozen;
      if(self.data.isFrozen) {
        $(self.data.element).css('cursor', 'default');
        $(self.data.element).find('*:not(.ui)').off();
      } else {
        $(self.data.element).css('cursor', 'cell');
        $(self.data.element).find('*:not(.ui)').on({
          mouseenter: function(e) {
            self.data.inspectionTarget = e.currentTarget;
            self._highlightElement();
          }
        });
      }
    }
  };
  $.fn.siteInspector = function(options) {
    return this.each(function() {
      var siteInspector = Object.create(Inspector);
      siteInspector.init(options, this);
      $.data(this, 'siteInspector', siteInspector);
    });
  };
  $.fn.siteInspector.options = {
    debug: false
  };
})(jQuery, window, document);
