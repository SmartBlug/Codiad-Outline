/*
	Copyright (c) 2015, SmartBlug
*/


(function() {
  var __bind = function(fn, me){ return function(){ return fn.apply(me, arguments); }; };

  codiad.Outline = (function() {

    function Outline(global, jQuery) {
      this.disableOutline = __bind(this.disableOutline, this);
      this.updateOutline = __bind(this.updateOutline, this);
      this.initOutlineListContainer = __bind(this.initOutlineListContainer, this);
      this.init = __bind(this.init, this);
      var _this = this;
      this.codiad = global.codiad;
      this.amplify = global.amplify;
      this.jQuery = jQuery;
      this.scripts = document.getElementsByTagName('script');
      this.path = this.scripts[this.scripts.length - 1].src.split('?')[0];
      this.curpath = this.path.split('/').slice(0, -1).join('/') + '/';
      this.jQuery(function() {
        return _this.init();
      });
    }

    Outline.prototype.init = function() {
      return this.initOutlineListContainer();
    };

    Outline.prototype.initOutlineListContainer = function() {
      var OutlineButton, OutlineMenu,
        _this = this;
      OutlineButton = '<div class="divider"></div><a id="OutlineButton">Outline</a>';
      OutlineMenu = '<ul id="OutlineMenu" class="options-menu"></ul>';
      this.jQuery('#editor-bottom-bar').append(OutlineButton);
      this.$OutlineButton = this.jQuery('#OutlineButton');
      this.$OutlineMenu = this.jQuery(OutlineMenu);
      
      this.codiad.editor.initMenuHandler(this.$OutlineButton, this.$OutlineMenu);

      this.$Outline = this.jQuery('<ul class="outline">outline</ul>');
      $('.sb-right-content hr:first').before('<hr>');
      $('.sb-right-content hr:first').after(this.$Outline);

      this.$OutlineButton.click(function(e){
        Menu = _this.jQuery('#OutlineMenu');
        Menu.css({overflow:'auto','max-height':$('#root-editor-wrapper').height()});
      });
      
      
      this.$OutlineMenu.on('click', 'li a', function(element) {
        var line;
        line = _this.jQuery(element.currentTarget).data('line');
        if (line) {
          _this.codiad.active.gotoLine(line);
          return _this.codiad.active.focus();
        }
      });
 
      this.$Outline.on('click', 'li a', function(element) {
        var line;
        line = _this.jQuery(element.currentTarget).data('line');
        if (line) {
          _this.codiad.active.gotoLine(line);
          return _this.codiad.active.focus();
        }
      });
 
      this.amplify.subscribe('active.onFocus', function() {
        return _this.updateOutline();
      });
      this.updateInterval = null;
      this.amplify.subscribe('active.onOpen', function() {
        _this.updateOutline();
        return _this.codiad.editor.getActive().getSession().on('change', function(e) {
          clearTimeout(_this.updateInterval);
          return _this.updateInterval = setTimeout(_this.updateOutline, 1000);
        });
      });
      return this.amplify.subscribe('active.onClose', function() {
        return _this.disableOutline();
      });
    };

    Outline.prototype.updateOutline = function() {
      var content, editor, editorOutline, index, line, loc, matches, _i, _len;
      content = this.codiad.editor.getContent();
      loc = content.split(/\r?\n/);
      matches = [];
      editorOutline = [];
      for (index = _i = 0, _len = loc.length; _i < _len; index = ++_i) {
        line = loc[index];
        if (line.indexOf("function") > -1 && line.match(/function\s(\w+\(.*\))/)) {
          matches.push('<li class="OutlineFunction"><a data-line="' + (index + 1) + '">' + line.match(/function\s(\w+\(.*\))/)[1] + '</a></li>');
          editorOutline.push({
            row: index,
            column: 1,
            text: line.match(/function\s(\w+\(.*\))/)[1],
            type: "info"
          });
        }
        
        if (line.indexOf("class") > -1 && line.match(/class\s(\w+)/)) {
          matches.push('<li class="OutlineClass"><a data-line="' + (index + 1) + '">' + line.match(/class\s(\w+)/)[1] + '</a></li>');
          editorOutline.push({
            row: index,
            column: 1,
            text: line.match(/class\s(\w+)/)[1],
            type: "info"
          });
        }

      }
      if (matches.length > 0) {
        this.$Outline.empty().append($(matches.join("")));
      }
      if (matches.length > 0) {
        this.$OutlineMenu.empty().append($(matches.join("")));
        editor = this.codiad.editor.getActive().getSession();
        editor.setAnnotations(editorOutline.concat(editor.getAnnotations()));
        return this.$OutlineButton;
      } else {
        return this.disableOutline();
      } 
    };

    Outline.prototype.disableOutline = function() {
      this.$OutlineMenu.empty().append("<li><a>Nothing</a></li>");
      return this.$OutlineButton;
    };

    return Outline;

  })();

  new codiad.Outline(this, jQuery);

}).call(this);
