//app settings for routing and declaring which html file to invoke when a give url is entered and which controller is in charge
var app = angular.module("app",["ngRoute","ngResource","ui.bootstrap"])
.config(["$routeProvider","$locationProvider", function($routeProvider,$locationProvider) {
    $routeProvider
        .when("/", {
            templateUrl: "/main.html",
            controller: "MainController"
        })
        .when("/appointments", {
            templateUrl: "/appointments.html",
            controller: "AppointmentController"
        })
		
		.when("/myaccount", {
            templateUrl: "/account.html",
            controller: "AccountController"
        })
		
		.when("/:id", {
            templateUrl: "/studentdata.html",
            controller: "DataController"
        })
        $locationProvider.html5Mode(true);
}])

app.factory("Appointment", ["$resource", function($resource) {
	   return $resource("/appointment", null,{
			"addAppointment": {method: "POST"},
			"deleteSingle": {method: "PUT"},
			"edit": {method: "PUT"},
			"confirm": {method: "PUT"},
			"deleteAll": {method: "DELETE"}
	   });
	}]);
	
app.factory("Students", ["$resource", function($resource) {
	   return $resource("/students", null,{
	   });
	}]);
	
app.factory("Data", ["$resource", function($resource) {
	   return $resource("/:id", null,{
	   });
	}]);	
	
app.factory("Account", ["$resource", function($resource) {
	   return $resource("/account", null,{
	   });
	}]);
	
app.controller("ModalControlller", ["$scope", "$modalInstance" ,"$window", function ($scope, $modalInstance, array,$window) {

  $scope.save = function () {
	if(!$scope.modalngModel) alert("Please insert date");
	else{
		array = {app: array.size, venue: $scope.modalVenue,description: $scope.modalDescription, date:$scope.modalngModel}
		$modalInstance.close(array);
	}
  };

  $scope.cancel = function () {
    $modalInstance.dismiss("cancel");
  };
}]);

app.controller("ConfirmModalControlller", ["$scope", "$modalInstance" ,"$window", function ($scope, $modalInstance, array,$window) {

  $scope.save = function () {
	$modalInstance.close();
  };

  $scope.cancel = function () {
    $modalInstance.dismiss("cancel");
  };
}]);


app.controller("AppointmentController",["$scope","$window", "Appointment", "$modal", "$log", function ($scope,$window,Appointment,$modal, $log){

	$scope.confirmAppointment = function(date,venue,description){
		Appointment.confirm({},{edit: "confirm",date: date, venue: venue, description: description},function(items){
			if(items.success){
			} else {
				alert("Confirming appointment failed");
			}
		})
		  Appointment.get(function(items){
			$scope.username = items.username[0] + " " + items.username[1];
			$scope.apps = items.appointments
		})
	}
	$scope.statuses = ["pending","confirmed"];
	
	$scope.Status = function(status) {
    	$scope.status = status;
    }

	$scope.open = function (size) {
    var modal = $modal.open({
      templateUrl: "modal",
      controller: "ModalControlller",
      size: size,
      resolve: {
        array: function () {
          array = {app: size, venue: $scope.modalVenue,description: $scope.modalDescription,date:$scope.modalngModel}
          return array;
		}
      }
    });
    modal.result.then(function (array) {
	  Appointment.edit({},{edit: "one",oldDate: size.date, oldVenue: size.venue,oldDescription: size.description,venue: array.venue, description: array.description,date: array.date, status: size.status},function(items){
		if(items.success){
		} else {
			alert("Editting of appointment failed");
		}
	})
	  Appointment.get(function(items){
		$scope.username = items.username[0] + " " + items.username[1];
		$scope.apps = items.appointments
	})
    });
  };

  $scope.confirm = function (size) {
    var modal = $modal.open({
      templateUrl: "confirm",
      controller: "ConfirmModalControlller",
      size: size,
    });
    modal.result.then(function () {
		Appointment.deleteAll({},function(items){
			if(items.success) $scope.apps = [];
		})
    });
  };
  
	$scope.go = function(param){
		if(param === "app") $window.location.href = "/appointments";
		else if(param === "account" ) $window.location.href = "/myaccount";
		else $window.location.href = "/";  
	};
	
	$scope.signout = function(){
		$window.location.href = "/signout";  
	};
	
        $scope.dateOptions = {
            minDate: 0,
            maxDate: "+12M"
        };
	
	Appointment.get(function(items){
		$scope.username = items.username[0] + " " + items.username[1];
		$scope.apps = items.appointments
	})
	
	$scope.addApp = function(){
		if(!$scope.ngModel) {
			alert("Please insert date"); 
		}
		else{
			Appointment.addAppointment({date: $scope.ngModel, venue: $scope.venue, description: $scope.description, status: $scope.status},function(items){
				if(!items.success)	alert("Adding of item failed");
			})
			
			Appointment.get(function(items){
				$scope.username = items.username[0] + " " + items.username[1];
				$scope.apps = items.appointments
			})
			
			$scope.ngModel = "";
			$scope.venue = "";
			$scope.description = "";
			$scope.status = "";
		}
	}
	
	$scope.deleteApp = function(app,date,venue,description,status){
		Appointment.deleteSingle({},{edit: "deleteOne",date: date, venue: venue, description: description,status: status},function(items){
			if(items.success) 
			  $scope.apps.splice($scope.apps.indexOf(app), 1);
			else 
			  alert("Error in deleting");
		})
	};
	
}])

app.controller("AccountController",["$scope","$window", "Account", function ($scope,$window,Account){
	
	$scope.go = function(param){
		if(param === "app") $window.location.href = "/appointments";
		else if(param === "account" ) $window.location.href = "/myaccount";
		else $window.location.href = "/";  
	};
	
	$scope.signout = function(){
		$window.location.href = "/signout";  
	};
	
	Account.get(function(items){
		$scope.username = items.username[0] + " " + items.username[1];
		$scope.title = items.user[0];
		$scope.first_name = items.user[1];
		$scope.surname = items.user[2];
		$scope.department = items.user[3];
		$scope.number = items.user[4];
		$scope.DoB = items.user[5];
	})
}])

app.controller("DataController",["$scope","$window", "$location", "Data", function ($scope,$window,$location,Data){

	$scope.go = function(param){
		if(param === "app") $window.location.href = "/appointments";
		else if(param === "account" ) $window.location.href = "/myaccount";
		else $window.location.href = "/";  
	};
	
	$scope.signout = function(){
		$window.location.href = "/signout";  
	};
	
	$scope.isCollapsed1 = $scope.isCollapsed2 = $scope.isCollapsed3 = $scope.isCollapsed4 = true;
	id = $location.$$path.slice(1,8);
	Data.get({id:id},function(items){
		$scope.id = id;
		$scope.name = items.name[0] + items.name[1];
		$scope.courses1 = items.year1;
		$scope.courses2 = items.year2;
		$scope.courses3 = items.year3;
		$scope.courses4 = items.year4;
		$scope.username = items.username[0] + " " + items.username[1];
	})
}])
app.controller("MainController",["$scope","$window","Students", function ($scope,$window,Students) {

	$scope.go = function(param){
		if(param === "app") $window.location.href = "/appointments";
		else if(param === "account" ) $window.location.href = "/myaccount";
		else if (param === "home" ) $window.location.href = "/";
		else $window.location.href = "/" + param;
	};
	
	$scope.signout = function(){
		$window.location.href = "/signout";  
	};
	
	$scope.header = {name: "header.html", url: "header.html"};
	Students.get(function(items){
		$scope.students = items.students;
		$scope.username = items.username[0] + " " + items.username[1];
	})
}])

var datepicker = angular.module("app1",["app","ui.date"])
datepicker.directive("customDatepicker",function($compile){
    return {
        replace:true,
        templateUrl:"datepicker.html",
        scope: {
            ngModel: "=",
            dateOptions: "="
        },
        link: function($scope, $element, $attrs, $controller){
            var $button = $element.find("button");
            var $input = $element.find("input");
            $button.on("click",function(){
                if($input.is(":focus")){
                    $input.trigger("blur");
                } else {
                    $input.trigger("focus");
                }
            });
        }    
    };
})
	
angular.module("ui.date", [])

.constant("uiDateConfig", {})

.directive("uiDate", ["uiDateConfig", "$timeout", function (uiDateConfig, $timeout) {
	var options;
    options = {};
    angular.extend(options, uiDateConfig);
    return {
		require:"?ngModel",
		link:function (scope, element, attrs, controller) {
		var getOptions = function () {
			return angular.extend({}, uiDateConfig, scope.$eval(attrs.uiDate));
		};
		var initDateWidget = function () {
			var showing = false;
			var opts = getOptions();
		if (controller) {
			var _onSelect = opts.onSelect || angular.noop;
			opts.onSelect = function (value, picker) {
				scope.$apply(function() {
				showing = true;
				controller.$setViewValue(element.datepicker("getDate"));
				_onSelect(value, picker);
				element.blur();
				});
			};
			opts.beforeShow = function() {
				showing = true;
			};
			opts.onClose = function(value, picker) {
				showing = false;
			};
			element.on("blur", function() {
				if ( !showing ) {
					scope.$apply(function() {
					element.datepicker("setDate", element.datepicker("getDate"));
					controller.$setViewValue(element.datepicker("getDate"));
					});
				}
			});
			controller.$render = function () {
				var date = controller.$viewValue;
				if ( angular.isDefined(date) && date !== null && !angular.isDate(date) ) {
				throw new Error("ng-Model must be a Date now ' + typeof date + ' - use ui-date-format to convert it from a string");
				}
				element.datepicker("setDate", date);
			};
		}
        element.datepicker("destroy");
        element.datepicker(opts);
        if ( controller ) {
			controller.$render();
        }
      };
		scope.$watch(getOptions, initDateWidget, true);
    }
  };
}
])

.constant("uiDateFormatConfig", "")
.directive("uiDateFormat", ["uiDateFormatConfig", function(uiDateFormatConfig) {
	var directive = {
		require:"ngModel",
		link: function(scope, element, attrs, modelCtrl) {
		var dateFormat = attrs.uiDateFormat || uiDateFormatConfig;
		if ( dateFormat ) {
			modelCtrl.$formatters.push(function(value) {
			if (angular.isString(value) ) {
				return jQuery.datepicker.parseDate(dateFormat, value);
			}
			return null;
        });
        modelCtrl.$parsers.push(function(value){
			if (value) {
				return jQuery.datepicker.formatDate(dateFormat, value);
			}
			return null;
        });
		} else {
        modelCtrl.$formatters.push(function(value) {
			if (angular.isString(value) ) {
				return new Date(value);
			}
			return null;
        });
        modelCtrl.$parsers.push(function(value){
			if (value) {
				return value.toISOString();
			}
			return null;
        });
      }
    }
  };
	return directive;
}]);
