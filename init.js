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

      this.$Outline = this.jQuery('<ul class="Outline"></ul>');
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
      this.amplify.subscribe('active.onSave', function() {
        return _this.updateOutline();
      });
      this.amplify.subscribe('active.onClose', function() {
        return _this.$Outline.empty();
      });
      this.updateInterval = null;
      this.amplify.subscribe('active.onOpen', function() {
        //_this.updateOutline();
        /*return _this.codiad.editor.getActive().getSession().on('change', function(e) {
          clearTimeout(_this.updateInterval);
          return _this.updateInterval = setTimeout(_this.updateOutline, 1000);
        });  */
      });
      return this.amplify.subscribe('active.onClose', function() {
        return _this.disableOutline();
      });
    };
    
    Outline.prototype.updateOutline = function() {
      var content, editor, editorOutline, index, line, loc, matches;
      content = this.codiad.editor.getContent();
      loc = content.split(/\r?\n/);
      matches = [];
      editorOutline = [];
      var keywords = ['public','private','protected'];
      var regexClass = /^(\s+|())+class\s(\w+)/ 
      
      for (index = 0; index < loc.length; index++) {
        line = loc[index];
        if (line.indexOf("function") > -1) {
          var split = line.replace("\t",' ').split(' ').filter(item => item !== "");
          var FunctionType = 'public';
          var Function = null;
          for (var keyword in split) {
            if (Function==null) {
              switch (split[keyword]) {
                case 'public':
                case 'private':
                case 'protected':
                  FunctionType = split[keyword];
                  break;
                case 'function':
                  Function = parseInt(keyword);
                  break;
                default:
                  Function = -1;
                  break;
              }
            }
        }
        
        if (Function>=0) {
          split = split.slice(Function+1).join('');
          if (split.indexOf(")")>-1) split = split.substring(0,split.indexOf(")")+1);
          //console.log("Found",FunctionType,Function,split);
          matches.push('<li class="OutlineFunction ' + FunctionType + '"><a data-line="' + (index + 1) + '" title="' + split + '">' + split + '</a></li>'); 
        }
        //else console.log(FunctionType,Function,split); 
      }       
        if (line.indexOf("class") > -1 && line.match(regexClass)) {
          var KeyArray = line.match(regexClass);
          var KeyFunction = KeyArray.pop();
          matches.push('<li class="OutlineFunction class"><a data-line="' + (index + 1) + '" title="' + KeyFunction + '">' + KeyFunction + '</a></li>');
        }

      }
      if (matches.length > 0) this.$Outline.empty().append($(matches.join("")));
                         else this.$Outline.empty();

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
