//app settings for routing and declaring which html file to invoke when a give url is entered and which controller is in charge
var app = angular.module("app",["ngRoute","ngResource"])
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

app.controller("AppointmentController",["$scope","$window", "Appointment", function ($scope,$window,Appointment){
	
	Appointment.get(function(items){
		$scope.username = items.username[0] + " " + items.username[1];
		$scope.apps = items.appointments
	})
}])

app.controller("AccountController",["$scope","$window", "Account", function ($scope,$window,Account){
	
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
	$scope.year1 = $scope.year2  = $scope.year3  = $scope.year4 = true;
	$scope.toggle1 = function() {
            $scope.year1 = $scope.year1 === false ? true: false;
        };
	$scope.toggle2 = function() {
            $scope.year2 = $scope.year2 === false ? true: false;
        };
	$scope.toggle3 = function() {
            $scope.year3 = $scope.year3 === false ? true: false;
        };
	$scope.toggle4 = function() {
            $scope.year4 = $scope.year4 === false ? true: false;
        };
	
}])
app.controller("MainController",["$scope","$window","Students", function ($scope,$window,Students) {
	
// todos get request loading all user specific data
	Students.get(function(items){
		$scope.students = items.students;
		$scope.username = items.username[0] + " " + items.username[1];
	})
}])