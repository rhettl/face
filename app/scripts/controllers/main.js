'use strict';

function elementDimentions(el) {
    var dim = angular.extend({}, el[0].getBoundingClientRect());
//    dim.top = dim.offset.top;
//    dim.left = dim.offset.left;
    dim.height = el.outerHeight();
    dim.width = el.outerWidth();
    dim.right = dim.left + dim.width;
    dim.bottom = dim.top + dim.height;

    dim.center = {
        x: dim.left + (dim.width / 2),
        y: dim.top + (dim.height / 2)
    };
    return dim;
}

angular.module('faceApp')
    .service('$mouse', function () {
        var mouse = {
            pos: {
                x: 0,
                y: 0
            },
            down: false,
            up: false,
            setX: function (newX) {
                this.pos.x = newX;
                return this.pos.x;
            },
            setY: function (newY) {
                this.pos.y = newY;
                return this.pos.y;
            },
            set: function (newX, newY) {
                this.setX(newX);
                this.setY(newY);
            }
        };

        return mouse;
    }).service('$face', ['$mouse', function ($mouse) {

        var face = function(elem){
            var self = this;
            this.element = elem;
            this.ngElement = angular.element(this.element);
            this.dim = {};

            this.features = {
                mouth: 'flat',
                eyes: 'closed'
            };

            this.element.onload = function(){
                self.updateDom.call(self);
            };
            this.ngElement.on('dragstart', function (event) {
                event.preventDefault();
            });
            this.updateDom();
        }
        face.prototype.updateDom = function(){
            this.dim = elementDimentions(this.ngElement);
        };
        face.prototype.updateEyes = function (x, y) {
            var dir;

            if (x < this.dim.left) {
                dir = 'left';
            } else if (x > this.dim.right) {
                dir = 'right';
            } else {
                dir = 'chevron';
            }

            this.set('eyes', dir);
            return dir;
        };
        face.prototype.set = function(key, value){
            if (key == 'eyes' || key == 'mouth'){
                this.features[key] = value;
            } else {
                this.dim[key] = value;
            }
        }

        return new face(document.getElementById('face'));
    }])
    .controller('MouseCtrl', function ($scope, $mouse) {
        //$scope.mouse = $mouse.pos;
        var body = elementDimentions(angular.element(document.getElementsByTagName('body')));
        $scope.callMouseLoc = function (e) {
            $mouse.set(e.clientX + body.left, e.clientY);
        };
        $scope.callMouseDown = function () {
            $mouse.down = true;
            $mouse.up = false;
        };
        $scope.callMouseUp = function () {
            $mouse.down = false;
            $mouse.up = true;
        };

    })
    .controller('faceCtrl', ['$scope', '$mouse', '$face', function ($scope, $mouse, $face) {

        $scope.mouse = $mouse;
        $scope.face = $face;

        $scope.$watch('mouse.pos.x', function (newX) {
            if ($mouse.down) {
                return;
            }
            $face.updateEyes($mouse.pos.x, $mouse.pos.y);
        });
        $scope.$watch('mouse.down', function () {
            if ($mouse.down) {
                $face.set('eyes', 'blink');
            } else {
                $face.updateEyes($mouse.pos.x, $mouse.pos.y);
            }
        });
    }])
    .controller('MainCtrl', ['$scope', function($scope){

    }]);




















