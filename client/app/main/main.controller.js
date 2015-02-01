'use strict';

angular.module('firstAppApp').controller('MainCtrl', function ($scope, $http, $modal, socket) {
    $scope.awesomeThings = [];

    $http.get('/api/things').success(function (awesomeThings) {
        $scope.awesomeThings = awesomeThings;
        socket.syncUpdates('thing', $scope.awesomeThings);
    });

    $scope.addThing = function () {
        if ($scope.newThing === '') {
            return;
        }
        $http.post('/api/things', { name: $scope.newThing });
        $scope.newThing = '';
    };

    $scope.deleteThing = function (thing) {
        $http.delete('/api/things/' + thing._id);
    };

    $scope.$on('$destroy', function () {
        socket.unsyncUpdates('thing');
    });

    $scope.signupModal = function () {
        var modalInstance = $modal.open({
                                            templateUrl: "/components/modal/modal.signup.html",
                                            size: "md",
                                            controller: SignupModalCtrl
                                        });
        modalInstance.result.then(function (ctrl) {
            if (ctrl) {
                var data = new FormData();
                data.append("userfilename", ctrl.firstname);
                data.append("userlastname", ctrl.lastname);
                data.append("email", ctrl.email);
                data.append("password", ctrl.password);
                data.append("confirmpassword", ctrl.confirmpassword);
                data.append("phonenumber", ctrl.phonenumber);
                data.append("userprofilepicture", $("#UploadPhoto")[0].files[0]);
                $.ajax({
                           url: "/api/users",
                           data: data,
                           cache: false,
                           contentType: false,
                           processData: false,
                           type: "POST",
                           success: function (data) {
                               console.log(data);

                           }
                       });
            }
        });
    }
    var SignupModalCtrl = function ($scope, $modalInstance) {
        $scope.signup = function () {
            $modalInstance.close({
                                     firstname: $scope.FirstName,
                                     lastname: $scope.LastName,
                                     email: $scope.Email,
                                     password: $scope.Password,
                                     confirmpassword: $scope.ConfirmPassword,
                                     phonenumber: $scope.PhoneNumber
                                 });
        };
        $scope.cancel = function () {
            $modalInstance.close(false);
        };
    };

    $scope.loginModal = function () {
        var modalInstance = $modal.open({
                                            templateUrl: "/components/modal/modal.login.html",
                                            size: "md",
                                            controller: LoginModalCtrl
                                        });
        modalInstance.result.then(function (ctrl) {
            if (ctrl) {
                var data = new FormData();
                data.append("userfilename", ctrl.firstname);
                data.append("userlastname", ctrl.lastname);
                data.append("email", ctrl.email);
                data.append("password", ctrl.password);
                data.append("confirmpassword", ctrl.confirmpassword);
                data.append("phonenumber", ctrl.phonenumber);
                data.append("userprofilepicture", $("#UploadPhoto")[0].files[0]);
                $.ajax({
                           url: "/api/users",
                           data: data,
                           cache: false,
                           contentType: false,
                           processData: false,
                           type: "POST",
                           success: function (data) {
                               console.log(data);

                           }
                       });
            }
        });
    }
    var LoginModalCtrl = function ($scope, $modalInstance) {
        $scope.signup = function () {
            $modalInstance.close({
                                     firstname: $scope.FirstName,
                                     lastname: $scope.LastName,
                                     email: $scope.Email,
                                     password: $scope.Password,
                                     confirmpassword: $scope.ConfirmPassword,
                                     phonenumber: $scope.PhoneNumber
                                 });
        };
        $scope.cancel = function () {
            $modalInstance.close(false);
        };
    };

});

$(document).ready(function () {
    $(document).on("click", "#CMTechTab1", function () {
        $(".cmtech-tabs").css({
                                  "margin-top": "15px",
                                  "height": "700px",
                                  "width": "100%",
                                  "background": "url('/assets/images/tab1.png')",
                                  "background-size": "100% 100%",
                                  "background-repeat": "no-repeat"

                              });
    });

    $(document).on("click", "#CMTechTab2", function () {
        $(".cmtech-tabs").css({
                                  "margin-top": "15px",
                                  "height": "700px",
                                  "width": "100%",
                                  "background": "url('/assets/images/tab2.png')",
                                  "background-size": "100% 100%",
                                  "background-repeat": "no-repeat"
                              });
    });

});
