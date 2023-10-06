# tinymce-iconfonts
TinyMCE plugin implement the handling of font icon elements based on the HTML element "i" used by font awesome or similar icon font sets.

Based on the idea of the former plugin "claviska/tinymce-iconfonts" and adapted from the "TinyMCE/anchor" plugin (v5.10.2)

## Features
- Menu and Toolbar button for add new icons
- Predefine a list of available icons (by array or based on link_class_list)
- Select existing icon for delete or edit
- Edit existing with double click or by Menu/Toolbar button

**Target Version: TinyMCE 5.10.2** (It may work with other versions - won't work in version 6 as some basic functions has been removed)

See **plugin.js** for details or your own implementation

## Installation
**tinymce** must be present before the plugin gets loaded - tinymce try to load the plugin from subfolder plugins automatically - for further assistance consult the official documentation

Classic:
~~~
<script src="plugin.min.js"></script>
~~~
or TypeScript:
~~~
require('plugin.min.js');
~~~
or webpack.config.js (for load on demand):
~~~
module.exports = (config, _, options) => {
    config.plugins.push(new plugins.CopyPlugin({
        patterns: [
            { from: './custom/tinymce-iconfonts', to: 'dependencies/tinymce/plugins/iconfonts' },
...
~~~
or whatever fits your type of implementation

## Configuration
Define the settings in the options at initialization

### Font icon selector
By default the icon set from Font Awesome (.fa, .fab, .fal, .far, .fas), Glyphicon (.glyphicon) and custom icon fonts (.icon) are already defined as default.

If you need to define another class for your icon set, define your base classes in the config **iconfonts_selector** (see default settings for example).

### Predefined Icons
When insert or edit an icon, the editor offers a dropdown menu for select the icon from a list. Initially the list is filled with an empty and one demo entry.

You can define your own list in the config **iconfonts_predefined_cssclass** according to the field definition of the dialog's listbox (see: https://www.tiny.cloud/docs/ui-components/dialogcomponents/#listbox especially for submenus)

If you working with icons in links and use the config **link_class_list** you can define the string "link_class_list" instead of an array, the plugin will overtake and map the definitions from link_class_list.
~~~
iconfonts_predefined_cssclass: 'link_class_list'
~~~

### Default settings
~~~
tinymce.init({
  ...
  iconfonts_selector: '.fa,.fab,.fal,.far,.fas,.glyphicon,.icon',
  iconfonts_predefined_cssclass: [
    {
      text: 'None',
      value: '',
    },
    {
      text: 'Home',
      value: 'icon icon-home',
    },
  ]
});
~~~

### Plugin + Menu configuration
~~~
tinymce.init({
  ...

  plugins: '... iconfonts',

  menu: {
    ...
    insert: { ... items: '... iconfonts' },
    ...
  },

  toolbar: '... iconfonts',

});
~~~

# Contribution

Let me know if you have improvements or some issues and i will try to help.

Currently there exists already a plugin with the same name but the source is no longer maintained (and it's not working anymore in version 5.10) - i need more investigation if i should upload this to npm, help is appreciated.
