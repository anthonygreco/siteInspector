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
// init
$('body').siteInspector();
// check if inspection is enabled; returns true|false
$('body').siteInspector('isEnabled');
```

## Options
* debug (true|false:default)
* showTags (true|false:default)

## Todo
* Warn if css is missing.


## License
[MIT License](http://en.wikipedia.org/wiki/MIT_License)