# Site Inspector

*A jQuery plugin to inspect a site's markup.*

## Development
```sh
npm install
bower install
grunt # runs watch command (compass & jshint)
grunt build # minify js to /dist
```

## Usage
```javascript
// init defaults
$('body').siteInspector();
// init with options
$('body').siteInspector({
  debug: true,
  showTags: true,
  cssFile: '../css/myCustomSiteInspector.css'
});
// check if inspection is enabled; returns true|false
$('body').siteInspector('isEnabled');
```

## Options
* debug ```true|false``` : default ```false```
* showTags ```true|false``` : default ```false``` - Enable display of element selector and dimensions (i.e. div.container 1024px x 800px)
* cssFile ```'../css/jquery-siteInspector.min.css'|false``` : default ```false``` - Overwrite the default css with your own (Note: CSS path is relative to the plugin file location)
* onInit: ```function() {}``` - Hook for a method to be triggered after initialization
* onDestroy: ```function() {}``` - Hook for a method to be triggered after destruction

## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)