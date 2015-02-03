'use strict';

angular.module('firstAppApp')
  .controller('SignupCtrl', function ($scope, Auth, $location, $upload,fileReader) {
    $scope.user = {};
    $scope.errors = {};
    
    $scope.getFile = function () {
        $scope.progress = 0;
        fileReader.readAsDataUrl($scope.file, $scope)
        .then(function(result) {
            $scope.imageSrc = result;
        });
    };
    $scope.test = function() {
      $upload.upload({
        url : '/api/users/test',
        file : $scope.files,
        data : {
          email : "test@test.com"
        }
      }).success(function(data){
        console.log(data)
      });

    };
    $scope.click = function(){
      filepicker.setKey("Ash9bU3IkR1Cf41AiwTAjz");

      filepicker.pick(
        {
          mimetypes: ['image/*', 'text/plain'],
          container: 'modal',
          services:['COMPUTER'],
        },
        function(Blob){
          $scope.blob = Blob;
          filepicker.read(
              Blob,
              {base64encode: true},
              function(imgdata){
                //$('#up').attr('src','data:image/png;base64,'+imgdata);
                $scope.imageSrc = 'data:image/png;base64,'+imgdata;
                $scope.$apply();
                
                console.log("Read successful");
              },
              function(fperror) {
                console.log(fperror.toString());
              }
            );
        },
        function(FPError){
          console.log(FPError.toString());
        }
      );
    };
    $scope.register = function(form) {
         $scope.submitted = true;

         if(form.$valid) {
          filepicker.store(
            $scope.blob,
            {filename: 'myCoolFile.txt'},
            function(new_blob){
              Auth.createUser({
                last_name: $scope.user.last_name,
                first_name: $scope.user.first_name,
                email: $scope.user.email,
                password: $scope.user.password,
                profile_url: new_blob.url
              })
              .then( function() {
                // Account created, redirect to home
                $location.path('/');
              })
              .catch( function(err) {
                err = err.data;
                $scope.errors = {};

                // Update validity of form fields that match the mongoose errors
                angular.forEach(err.errors, function(error, field) {
                  form[field].$setValidity('mongoose', false);
                  $scope.errors[field] = error.message;
                });
              });
              console.log(JSON.stringify(new_blob));
            }
          );
         }
    };

  }).directive("ngFileSelect",function(){    
  return {
    link: function($scope,el){          
      el.bind("change", function(e){          
        $scope.file = (e.srcElement || e.target).files[0];
        $scope.getFile();
      });          
    }        
  };
})


