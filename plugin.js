// global: tinymce
//
// This plugin implement the handling of font icon elements based on the HTML element "i"
// Similar to the "TinyMCE/anchor" plugin and based on the idea of the former plugin "claviska/tinymce-iconfonts"
//
// With additional features for easy editing:
// - Menu and Toolbar button for add new icons
// - Predefine a list of available icons (by array or based on link_class_list)
// - Select existing icon for delete or edit
// - Edit existing with double click or by Menu/Toolbar button
//
// Additional information see: https://github.com/thornch/tinymce-iconfonts
//
(function () {
  'use strict';

  var tmPluginManager = tinymce.util.Tools.resolve('tinymce.PluginManager');

  var tmRangeUtils = tinymce.util.Tools.resolve('tinymce.dom.RangeUtils');

  var tmTools = tinymce.util.Tools.resolve('tinymce.util.Tools');

  tmPluginManager.add('iconfonts', function (editor) {

    // #region Configs initialization
      const defaultSelector = [
          '.fa', // Font Awesome 4
          '.fab', '.fal', '.far', '.fas', // Font Awesome 5
          '.glyphicon', // Glyphicons
          '.icon', // Glyphicons
      ].join(',');
      const defaultPredefinedCssclass = [
          {
              text: 'None',
              value: '',
          },
          {
              text: 'Home',
              value: 'icon icon-home',
          },
      ];

      const selector = editor.getParam('iconfonts_selector', defaultSelector);
      const predefinedCssclass = editor.getParam('iconfonts_predefined_cssclass', defaultSelector);

      const fontIconSelectorArray = selector.split(',');
    const fontIconFormatterName = 'iconFonts';
    const fontIconMenuButtonName = 'iconfonts';
    const fontIconBaseElement = 'i';
    const fontIconCommandName = 'mceIconFonts';

    var isEmptyString = function (str) {
      return !str;
    };

        // see: https://www.tiny.cloud/docs/ui-components/dialogcomponents/#listbox
    var translateFromLinkClassList = function (values) {
      let items = [];
      tmTools.isArray(values) && values.forEach(function (val) {
          if (typeof(val.menu) != 'undefined') {
              items.push({
                  text: val.title,
                  items: translateFromLinkClassList(val.menu),
              });
          } else {
              items.push({
                  text: val.title,
                  value: val.value,
              });
          }
      });
      return items;
    };

    const fontIconSelector = fontIconBaseElement + fontIconSelectorArray.join(',' + fontIconBaseElement);
    const fontIconPredefinedCssclass = tmTools.isArray(predefinedCssclass)
    ? predefinedCssclass
    : !isEmptyString(predefinedCssclass) && predefinedCssclass == 'link_class_list'
        ? translateFromLinkClassList(editor.getParam('link_class_list', []))
        : defaultPredefinedCssclass;
    // #endregion

    // #region Register element
    editor.on('PreInit', function () {
      editor.schema.addValidElements('i[class|contenteditable]');

      editor.parser.addNodeFilter(fontIconBaseElement, setContentEditable('false'));
      editor.serializer.addNodeFilter(fontIconBaseElement, setContentEditable(null));

      editor.formatter.register(fontIconFormatterName, {
        inline: fontIconBaseElement,
        selector: fontIconSelector,
        remove: 'all',
        split: true,
        deep: true,
        attributes: { class: '%value' },
        onmatch: function (node, _fmt, _itemName) {
          return isFontIconNode(node);
        },
      });
    });

    var setContentEditable = function (state) {
      return function (nodes) {
        for (var i = 0; i < nodes.length; i++) {
          var node = nodes[i];
          if (isEmptyFontIconNode(node)) {
            node.attr('contenteditable', state);
          }
        }
      };
    };

    var isEmptyFontIconNode = function (node) {
      return isFontIconNode(node) && !node.firstChild;
    };

    var isFontIconNode = function (node) {
      console.log('isFontIconNode', node);
      return node && !isEmptyString(node.attr('class')) && isValidCssClass(node.attr('class'));
    };

    var isValidCssClass = function (cssclass) {
      let bFound = false;
      cssclass.split(' ').forEach(function (value) {
        bFound = bFound || fontIconSelectorArray.indexOf('.' + value) != -1;
      });
      return bFound;
    };
    // #endregion

    // #region Register command for popup editor to edit font icon class
    editor.addCommand(fontIconCommandName, function () {
      open(editor);
    });

    var open = function (editor) {
      var currentClass = getClass(editor);
      editor.windowManager.open({
        title: 'Font Icon',
        size: 'normal',
        body: {
          type: 'panel',
          items: [{
              name: 'cssclass',
              type: 'input',
              label: 'Class',
              placeholder: 'icon icon-home',
            }, {
              type: 'listbox',
              name: 'predefinedCssclass',
              label: 'Select predefined value',
              items: fontIconPredefinedCssclass,
            }],
        },
        buttons: [
          {
            type: 'cancel',
            name: 'cancel',
            text: 'Cancel',
          },
          {
            type: 'submit',
            name: 'save',
            text: 'Save',
            primary: true,
          },
        ],
        initialData: { cssclass: currentClass, predefinedCssclass: '' },
        onSubmit: function (api) {
          if (insertFontIcon(editor, api.getData().cssclass)) {
            api.close();
          }
        },
        onChange: function (api) {
          console.log('dialog.onChange', [api, api.getData()]);
          const data = api.getData();
          if (!isEmptyString(data.predefinedCssclass)) {
              data.cssclass = data.predefinedCssclass;
              api.setData(data);
          }
        },
      });
    };

    var getClass = function (editor) {
      var fontIcon = getFontIcon(editor);
      if (fontIcon) {
        return getClassFromFontIcon(fontIcon);
      } else {
        return '';
      }
    };

    var getFontIcon = function (editor) {
      return editor.dom.getParent(editor.selection.getStart(), fontIconSelector);
    };

    var getClassFromFontIcon = function (elm) {
      var cssclass = elm.getAttribute('class');
      return cssclass || '';
    };

    var insertFontIcon = function (editor, cssclass) {
      if (!isValidCssClass(cssclass)) {
        editor.windowManager.alert('Id should start with a letter, followed only by letters, numbers, dashes, dots, colons or underscores.');
        return false;
      } else {
        insert(editor, cssclass);
        return true;
      }
    };

    var insert = function (editor, cssclass) {
      var fontIcon = getFontIcon(editor);
      if (fontIcon) {
        updateFontIcon(editor, cssclass, fontIcon);
      } else {
        createFontIcon(editor, cssclass);
      }
      editor.focus();
    };

    var updateFontIcon = function (editor, cssclass, fontIconElement) {
      fontIconElement.removeAttribute('class');
      fontIconElement.setAttribute('class', cssclass);
      editor.addVisual();
      editor.undoManager.add();
    };

    var createFontIcon = function (editor, cssclass) {
      editor.undoManager.transact(function () {
        if (!allowHtmlInFontIcon(editor)) {
          editor.selection.collapse(true);
        }
        if (editor.selection.isCollapsed()) {
          editor.insertContent(editor.dom.createHTML(fontIconBaseElement, { class: cssclass }));
        } else {
          removeEmptyFontIconsInSelection(editor);
          editor.formatter.remove(fontIconFormatterName, null, null, true);
          editor.formatter.apply(fontIconFormatterName, { value: cssclass });
          editor.addVisual();
        }
      });
    };

    var allowHtmlInFontIcon = function (editor) {
      return editor.getParam('allow_html_in_font_icon', false, 'boolean');
    };

    var removeEmptyFontIconsInSelection = function (editor) {
      var dom = editor.dom;
      tmRangeUtils(dom).walk(editor.selection.getRng(), function (nodes) {
        tmTools.each(nodes, function (node) {
          if (isEmptyFontIconNode(node)) {
            dom.remove(node, false);
          }
        });
      });
    };
    // #endregion

    // #region Register buttons
    editor.ui.registry.addToggleButton(fontIconMenuButtonName, {
      icon: 'brightness',
      tooltip: 'Font Icon',
      onAction: function () {
        return editor.execCommand(fontIconCommandName);
      },
      onSetup: function (buttonApi) {
        return editor.selection.selectorChangedWithUnbind(fontIconSelector, buttonApi.setActive).unbind;
      },
    });

    editor.ui.registry.addMenuItem(fontIconMenuButtonName, {
      icon: 'brightness',
      text: 'Font Icon...',
      onAction: function () {
        return editor.execCommand(fontIconCommandName);
      },
    });
    editor.getParam('iconfonts_selector', defaultSelector);


    editor.ui.registry.addContextMenu(fontIconMenuButtonName, {
      update: function (element) {
          console.log('iconfont.addContextMenu.update', [element, isFontIconNode(element)]);
          return isFontIconNode(element) ? [fontIconMenuButtonName] : [];
      },
    });
    editor.on('dblclick', event => {
      const node = editor.$(event.target);
      console.log('iconfont.dblclick', [event, event.target, node]);
      if (isFontIconNode(node)) {
          event.stopPropagation();
          //editor.selection.selectorChangedWithUnbind(fontIconSelector, buttonApi.setActive).unbind;
          editor.execCommand(fontIconCommandName);
      }
  });
      // #endregion

    // #region Register plugin info
    return {
      getMetadata: () => {
        return  {
          name: 'Icon Fonts',
          url: 'https://github.com/thornch/tinymce-iconfonts',
        };
      },
    };
    // #endregion

  });

})();
