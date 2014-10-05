# Site Inspector

*A jQuery plugin to inspect a site's markup.*

## Build
```sh
npm install
bower install
grunt
```


## Usage
```javascript
// init
$('body').siteInspector();
// check if inspection is enabled; returns true|false
$('body').data('siteInspector').isEnabled()
```

## Todo
* Fix public/private scope.
* Warn if css is missing.


## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)