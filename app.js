'use strict';

var app = angular.module("HttpAdmin", ['ngRoute', 'ngSanitize', 'ui.bootstrap', 'xeditable'])

app.run(function(editableOptions) {
  editableOptions.theme = 'bs3'; // bootstrap3 theme. Can be also 'bs2', 'bs3', 'default'
});

app.controller("NavBarCtrl", ['$scope', '$location', function($scope, $location) {
    $scope.isActive = function(id) {
        return $location.path().indexOf('/' + id) == 0;
    };
}]);

app.controller("JSDemoCtrl", ['$scope', '$http', function($scope, $http) {
    $scope.js_hello_output = null;
    $scope.js_hello_source = null;
    $scope.js_hello_hl = null;
    $scope.js_i2c_source = null;

    $scope.run_hello = function() {
        $scope.js_hello_output = "bzz";
    };

    $scope.save_hello = function(data) {
		$scope.js_hello_hl = hljs.highlightAuto(data).value;
    };

    $scope.update = function() {
        $http.get('cgi-bin/cat_file.py?path=hello.js').then(function (r) {
			$scope.js_hello_source = r.data;
			let hlcode = hljs.highlightAuto($scope.js_hello_source).value;
			//document.getElementById("js_hello_wrapper").innerHTML = hlcode;
			$scope.js_hello_hl = hlcode;
        });

        $http.get('cgi-bin/cat_file.py?path=i2c.js').then(function (r) {
			$scope.js_i2c_source = r.data;
			let hlcode = hljs.highlightAuto($scope.js_i2c_source).value;
    		document.getElementById("js_i2c_wrapper").innerHTML = hlcode;
        });
    };

	$scope.update();
}]);

app.controller("SystemCtrl", ['$scope', '$http', function($scope, $http) {
    $scope.version = null;

    $scope.update = function() {
        $scope.version = "Version 0.1";
    };

    $scope.update();
}]);

app.config(['$routeProvider', function($routeProvider) {
    $routeProvider.
    when('/jsdemo', {
        templateUrl: 'partials/jsdemo.html',
    }).
    when('/system', {
        templateUrl: 'partials/system.html',
    }).
    otherwise({
        redirectTo: '/interfaces'
    });
}]);

// vim: sw=4 sts=4 expandtab
