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
		   "addCourse": {method: "POST"},
		   "deleteCourse": {method: "PUT"}
	   });
	}]);	
	
app.factory("Account", ["$resource", function($resource) {
	   return $resource("/account", null,{
	   "edit": {method: "PUT"}
	   });
	}]);
	
app.controller("ModalControlller", ["$scope", "$modalInstance" ,"$window", function ($scope, $modalInstance, array,$window) {
	
	if(array.array.title){
		$scope.modalTitle = array.array.title;
		$scope.modalFirst_name = array.array.first_name;
		$scope.modalSurname = array.array.surname;
		$scope.modalDepartment = array.array.department;
		$scope.modalNumber = array.array.number;
		$scope.modalDoB = array.array.DoB;
	}
	else{
		$scope.modalVenue = array.array.app.venue;
		$scope.modalDescription = array.array.app.description;
		$scope.modalngModel = array.array.app.date
	}
	
  $scope.save = function () {
	if(array.array.title){
		array = {title: $scope.modalTitle, first_name: $scope.modalFirst_name, surname: $scope.modalSurname, department: $scope.modalDepartment, number: $scope.modalNumber, DoB: $scope.modalDoB}
		$modalInstance.close(array);
	}
	else{
		if(!$scope.modalngModel) alert("Please insert date");
		else{
			array = {app: array.size, venue: $scope.modalVenue,description: $scope.modalDescription, date:$scope.modalngModel}
			$modalInstance.close(array);
		}
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
		  get();
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
	  get();
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
	
	function get(){
		Appointment.get(function(items){
		$scope.username = items.username[0] + " " + items.username[1];
		$scope.apps = items.appointments
		})
	}
	
	get();
	
	$scope.addApp = function(){
		if(!$scope.ngModel) {
			alert("Please insert date"); 
		}
		else{
			Appointment.addAppointment({date: $scope.ngModel, venue: $scope.venue, description: $scope.description, status: $scope.status},function(items){
				if(!items.success)	alert("Adding of item failed");
			})
			
			get();
			
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

app.controller("AccountController",["$scope","$window", "Account", "$modal", "$log", function ($scope,$window,Account,$modal,$log){

	$scope.open = function (title, first_name, surname, department, number, DoB) {
    var modal = $modal.open({
      templateUrl: "modal",
      controller: "ModalControlller",
      size: title,
      resolve: {
        array: function () {
          array = {title: title, first_name: first_name,surname: surname, department: department, number: number, DoB: DoB}
          return array;
		}
      }
    });
    modal.result.then(function (array) {
	  Account.edit({},{edit: "edit", title: array.title, first_name: array.first_name, surname: array.surname, department: array.department, number: array.number, DoB: array.DoB},function(items){
		if(items.success){
		} else {
			alert("Editting of personal data failed");
		}
	})
	  get();
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
	
	function get(){
		Account.get(function(items){
			$scope.username = items.username[0] + " " + items.username[1];
			$scope.title = items.user[0];
			$scope.first_name = items.user[1];
			$scope.surname = items.user[2];
			$scope.department = items.user[3];
			$scope.number = items.user[4];
			$scope.DoB = items.user[5];
		})
	}
	get();
}])

app.controller("DataController",["$scope","$window", "$location", "Data", "$modal", "$log", function ($scope,$window,$location,Data,$modal,$log){
	
	id = $location.$$path.slice(1,8);
	
	$scope.deleteRecord = function(course,year){
		Data.deleteCourse({id:id},{course: course.course},function(items){
				get();
			})
	}
	
	$scope.colleges = ["College of Arts","College of Medical, Veterinary and Life Sciences","College of Science and Engineering","College of Social Sciences"];
	
	$scope.College = function(college) {
    	$scope.college = college;
    }
	
	$scope.years = ["1","2","3","4"];
	
	$scope.Year = function(year) {
    	$scope.year = year;
    }
	
	$scope.grades = [];
	
	for(i = 1; i <= 22; i++){
		$scope.grades[i] = i;
	}
	
	$scope.Grade = function(grade) {
    	$scope.grade = grade;
    }
	
	$scope.addRecord = function (course,credits,grade,college,year) {
		Data.addCourse({id:id},{course: course, credits: credits, grade: grade, department: college, year: year},function(items){
				if(!items.success)	alert("Adding of item failed");
			})
		get();
		$scope.course = "";
		$scope.credits = "";
		$scope.grade = "";
		$scope.college = "";
		$scope.year = "";
  };

	$scope.go = function(param){
		if(param === "app") $window.location.href = "/appointments";
		else if(param === "account" ) $window.location.href = "/myaccount";
		else $window.location.href = "/";  
	};
	
	$scope.signout = function(){
		$window.location.href = "/signout";  
	};
	
	$scope.isCollapsed1 = $scope.isCollapsed2 = $scope.isCollapsed3 = $scope.isCollapsed4 = $scope.courseCollapse = true;
	function get(){
		Data.get({id:id},function(items){
			$scope.id = id;
			$scope.name = items.name[0] + " " + items.name[1];
			$scope.courses1 = items.year1;
			$scope.courses2 = items.year2;
			$scope.courses3 = items.year3;
			$scope.courses4 = items.year4;
			$scope.username = items.username[0] + " " + items.username[1];
			$scope.taken1 = items.taken1[0];
			$scope.passed1 = items.passed1[0];
			if(items.GPA1[0] != null) $scope.GPA1 = items.GPA1[0].toPrecision(3);
			$scope.taken2 = items.taken2[0];
			$scope.passed2 = items.passed2[0];
			if(items.GPA2[0] != null) $scope.GPA2 = items.GPA2[0].toPrecision(3);
			$scope.taken3 = items.taken3[0];
			$scope.passed3 = items.passed3[0];
			if(items.GPA3[0] != null) $scope.GPA3 = items.GPA3[0].toPrecision(3);
			$scope.taken4 = items.taken4[0];
			$scope.passed4 = items.passed4[0];
			if(items.GPA4[0] != null) $scope.GPA4 = items.GPA4[0].toPrecision(3);
			$scope.totalCredits = $scope.taken1 + $scope.taken2 + $scope.taken3 + $scope.taken4;
			$scope.totalCreditsPassed = $scope.passed1 + $scope.passed2 + $scope.passed3 + $scope.passed4;
			$scope.totalGPA = items.totalGPA[0].toPrecision(3);
		})
	}
	get();
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
