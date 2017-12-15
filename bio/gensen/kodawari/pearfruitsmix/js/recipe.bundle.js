(function e(t,n,r){function s(o,u){if(!n[o]){if(!t[o]){var a=typeof require=="function"&&require;if(!u&&a)return a(o,!0);if(i)return i(o,!0);var f=new Error("Cannot find module '"+o+"'");throw f.code="MODULE_NOT_FOUND",f}var l=n[o]={exports:{}};t[o][0].call(l.exports,function(e){var n=t[o][1][e];return s(n?n:e)},l,l.exports,e,t,n,r)}return n[o].exports}var i=typeof require=="function"&&require;for(var o=0;o<r.length;o++)s(r[o]);return s})({1:[function(require,module,exports){
'use strict';
var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var clickCount = 0;
// ==================================================
var ClickAttention = (function () {
    function ClickAttention(el) {
        this.isReplayTime = false;
        this.isHover = false;
        this.el = el;
        $(this.el).parent().on('mouseenter', this.mouseEnter.bind(this));
        $(this.el).parent().on('mouseleave', this.mouseOut.bind(this));
        var line_tx = 54;
        var line_ty = 15;
        this.tlFrame = anime.timeline({ autoplay: false, complete: this.playComplete.bind(this) });
        this.tlFrame
            .add({
            targets: $(this.el).find('.click_frame')[0],
            translateY: [4, 0],
            scale: [0, 1],
            opacity: [0, 1],
            delay: 100,
            duration: 200,
            easing: 'easeOutSine'
        });
        this.tlText = anime.timeline({ autoplay: false, complete: this.playComplete.bind(this) });
        this.tlText
            .add({
            targets: $(this.el).find('.click_text')[0],
            scale: [0, 1],
            opacity: [0, 1],
            delay: 400,
            duration: 350,
            easing: 'easeOutBack'
        });
        setTimeout(function () {
            this.play();
        }.bind(this), 1000);
    }
    ClickAttention.prototype.mouseEnter = function () {
        // console.info("hover");
        this.isHover = true;
    };
    ClickAttention.prototype.mouseOut = function () {
        // console.info("out");
        this.isHover = false;
        if (this.isReplayTime) {
            this.fadeOut();
        }
    };
    ClickAttention.prototype.play = function () {
        // console.info("play");
        this.isReplayTime = false;
        this.completeCount = 0;
        this.tlFrame.restart();
        this.tlText.restart();
    };
    ClickAttention.prototype.playComplete = function () {
        this.completeCount++;
        if (this.completeCount === 2) {
            setTimeout(this.replay.bind(this), 2500);
        }
    };
    ClickAttention.prototype.replay = function () {
        if (this.isHover) {
            this.isReplayTime = true;
        }
        else {
            this.fadeOut();
        }
    };
    ClickAttention.prototype.fadeOut = function () {
        anime({
            targets: this.el,
            opacity: [1, 0],
            duration: 100,
            easing: 'easeInOutQuad',
            complete: this.fadeOutComplete.bind(this)
        });
    };
    ClickAttention.prototype.fadeOutComplete = function () {
        // console.info("* fadeOutComplete");
        setTimeout(function () {
            $(this.el).css({ opacity: 1 });
            this.play();
        }.bind(this), 300);
    };
    return ClickAttention;
}());
// ==================================================
var Taste = (function () {
    function Taste() {
        this.enabled = true;
        this.sy = 0;
    }
    Taste.prototype.init = function (positions) {
        this.el = $('.' + this.name);
        this.showInfo = [];
        for (var i = 0; i < positions.length; i++) {
            this.showInfo[i] = { y: positions[i], time: -1, show: false };
        }
    };
    Taste.prototype.getManifest = function () {
        var m = jQuery.extend(true, [], this.manifest);
        m.forEach(function (v) {
            v.id = this.name + '_' + v.id;
            v.src = 'img/' + this.name + '-' + v.src;
        }.bind(this));
        return m;
    };
    Taste.prototype.create = function (queue) {
        this.queue = queue;
        this.manifest.forEach(function (v) {
            switch (v.id) {
                case 'bg':
                case 'flag1':
                case 'flag2':
                    this.el.find('.tasteInner').append('<div class="' + v.id + '"></div>');
                    this.el.find('.tasteInner .' + v.id).append(this.getResult(v.id));
                    break;
                case 'title':
                    this.el.find('.tasteContent').append('<div class="' + v.id + '"></div>');
                    this.el.find('.tasteContent .' + v.id).append(this.getResult(v.id).firstChild);
                    break;
                default:
                    this.el.find('.tasteContent').append('<div class="' + v.id + '"></div>');
                    this.el.find('.tasteContent .' + v.id).append(this.getResult(v.id));
            }
            if (this.enabled === false) {
                this.el.find('.' + v.id).css({
                    opacity: 1
                });
            }
        }.bind(this));
        if (this.enabled) {
            $(document).on('scroll.' + this.name, this.scrollCheck.bind(this));
        }
    };
    Taste.prototype.kodawari = function () {
        if (0 < this.el.find('.chefkodawari').length) {
            this.el.find('.chefkodawari a').modaal();
            $.each(this.el.find('.chefkodawari'), function (index, kodawaribtn) {
                var click = this.queue.getResult('kodawaribtn_click').firstChild.cloneNode(true);
                $(kodawaribtn).append(click);
                if (clickCount % 2 === 0) {
                    $(click).addClass('l');
                }
                else {
                    $(click).addClass('r');
                }
                clickCount++;
                new ClickAttention(click);
            }.bind(this));
        }
    };
    Taste.prototype.showTitle = function () {
        anime({
            targets: '.' + this.name + ' .title-circle1',
            strokeDasharray: [300, 300],
            strokeDashoffset: [300, 0],
            duration: 800,
            easing: 'easeInQuad'
        });
        anime({
            targets: '.' + this.name + ' .title-circle2',
            strokeDasharray: [300, 300],
            strokeDashoffset: [300, 0],
            delay: 100,
            duration: 800,
            easing: 'easeInQuad'
        });
        anime({
            targets: '.' + this.name + ' .title-text',
            scale: [1.6, 1.0],
            opacity: [0, 1],
            delay: 700,
            duration: 300,
            easing: 'easeInQuad'
        });
        anime({
            targets: '.' + this.name + ' .point',
            translateX: [5, 0],
            opacity: [0, 1],
            delay: 800,
            duration: 350,
            easing: 'easeOutQuad'
        });
        setTimeout(function () {
            this.el.find('.title').addClass('appear');
        }.bind(this), 10);
    };
    Taste.prototype.reset = function () {
        this.manifest.forEach(function (v) {
            this.el.find('.' + v.id).removeAttr('style');
        }.bind(this));
        this.el.find('.title').removeClass('appear');
        this.showInfo.forEach(function (v) {
            v.time = -1;
            v.show = false;
        });
    };
    Taste.prototype.getY = function () {
        var y = $(document).scrollTop() + $(window).height() - $(this.el).offset().top;
        if (viewMode === 'pc') {
            if (viewSize === 2) {
                y *= (1 / 0.85);
            }
        }
        return y;
    };
    Taste.prototype.getResult = function (id) {
        return this.queue.getResult(this.name + '_' + id);
    };
    Taste.prototype.scrollCheck = function (evt) {
        var y = this.getY();
        for (var i = 0; i < this.showInfo.length; i++) {
            if (this.showInfo[i].y < y && this.showInfo[i].show === false) {
                this.showInfo[i].show = true;
                this.showInfo[i].time = new Date().getTime();
                var showDelay = this.show(i);
                this.showInfo[i].time += showDelay;
                break;
            }
        }
    };
    Taste.prototype.show = function (index) {
        return 0;
    };
    return Taste;
}());
// ==================================================
var Taste1 = (function (_super) {
    __extends(Taste1, _super);
    function Taste1() {
        var _this = _super.call(this) || this;
        _this.name = 'taste1';
        if (viewMode === 'pc') {
            _this.init([150, 520]);
        }
        else {
            _this.init([100, 260, 480]);
        }
        if (viewMode === 'pc') {
            _this.manifest = [
                { id: 'bg', src: 'bg.jpg' },
                { id: 'title', src: 'title.svg' },
                { id: 'point', src: 'point.png' },
                { id: 'pear', src: 'pear.png' },
                { id: 'circle1', src: 'circle1.png' },
                { id: 'circle2', src: 'circle2.png' },
                { id: 'effect', src: 'effect.png' },
                { id: 'copy1', src: 'copy1.png' },
                { id: 'copy2', src: 'copy2.png' },
                { id: 'copy3', src: 'copy3.png' },
                { id: 'copy4', src: 'copy4.png' }
            ];
        }
        else {
            _this.manifest = [
                { id: 'title', src: 'title.svg' },
                { id: 'point', src: 'point.png' },
                { id: 'pear', src: 'pear.png' },
                { id: 'circle1', src: 'circle1@sp.png' },
                { id: 'circle2', src: 'circle2@sp.png' },
                { id: 'effect', src: 'effect@sp.png' },
                { id: 'copy1', src: 'copy1@sp.png' },
                { id: 'copy2', src: 'copy2@sp.png' },
                { id: 'copy3', src: 'copy3.png' },
                { id: 'copy4', src: 'copy4@sp.png' }
            ];
            $(_this.el).prepend('<div class="bg"><div class="bg-white1"></div><div class="bg-white2"></div></div>');
        }
        return _this;
    }
    Taste1.prototype.create = function (queue) {
        _super.prototype.create.call(this, queue);
        this.el.find('.tasteContent .copy1').before('<div class="chefkodawari"><a href="#modal4"><img alt="" src="../img/kodawaribtn.svg"></a></div>');
    };
    Taste1.prototype.show = function (index) {
        var spendTime = (index === 0) ? 0 : this.showInfo[index].time - this.showInfo[index - 1].time;
        var delay = 0;
        if (viewMode === 'pc') {
            switch (index) {
                case 0:
                    this.el.find('.bg').addClass('show');
                    this.showTitle();
                    anime({
                        targets: '.' + this.name + ' .copy1',
                        translateX: [15, 0],
                        opacity: [0, 1],
                        delay: 1200,
                        duration: 500,
                        easing: 'easeOutQuart'
                    });
                    break;
                case 1:
                    delay = Math.max(0, 1200 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .copy2',
                        scale: [1.2, 1],
                        opacity: [0, 1],
                        delay: delay + 400,
                        duration: 700,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy3',
                        scale: [1.15, 1],
                        opacity: [0, 1],
                        delay: delay + 800,
                        duration: 650,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy4',
                        scale: [1.15, 1],
                        opacity: [0, 1],
                        delay: delay + 900,
                        duration: 650,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .effect',
                        scale: [0.65, 1],
                        opacity: [0, 1],
                        delay: delay + 400,
                        duration: 600,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle1',
                        translateY: [30, 0],
                        opacity: [0, 1],
                        delay: delay + 650,
                        duration: 800,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle2',
                        translateY: [40, 0],
                        opacity: [0, 1],
                        delay: delay + 900,
                        duration: 700,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .pear',
                        opacity: [0, 1],
                        delay: delay + 1200,
                        duration: 900,
                        easing: 'easeOutSine'
                    });
                    break;
            }
        }
        else {
            switch (index) {
                case 0:
                    this.el.find('.bg').addClass('show');
                    this.showTitle();
                    break;
                case 1:
                    delay = Math.max(0, 1200 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .copy1',
                        translateX: [15, 0],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 500,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy2',
                        scale: [1.3, 1],
                        opacity: [0, 1],
                        delay: delay + 500,
                        duration: 600,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy3',
                        scale: [1.15, 1],
                        opacity: [0, 1],
                        delay: delay + 800,
                        duration: 650,
                        easing: 'easeOutQuad'
                    });
                    break;
                case 2:
                    delay = Math.max(0, 1200 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .pear',
                        scale: [0.95, 1],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .effect',
                        translateX: [-6, 0],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 450,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy4',
                        scale: [1.15, 1],
                        opacity: [0, 1],
                        delay: delay + 900,
                        duration: 650,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle1',
                        translateY: [30, 0],
                        opacity: [0, 1],
                        delay: delay + 650,
                        duration: 800,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle2',
                        translateY: [40, 0],
                        opacity: [0, 1],
                        delay: delay + 900,
                        duration: 700,
                        easing: 'easeOutQuad'
                    });
                    break;
            }
        }
        return delay;
    };
    return Taste1;
}(Taste));
// ==================================================
var Taste2 = (function (_super) {
    __extends(Taste2, _super);
    function Taste2() {
        var _this = _super.call(this) || this;
        _this.name = 'taste2';
        // this.enabled = false;
        if (viewMode === 'pc') {
            _this.init([150, 650]);
            _this.manifest = [
                { id: 'title', src: 'title.svg' },
                { id: 'point', src: 'point.png' },
                { id: 'pear1', src: 'pear1.png' },
                { id: 'pear1_line', src: 'pear1_line.svg' },
                { id: 'pear2', src: 'pear2.png' },
                { id: 'pear2_line', src: 'pear2_line.svg' },
                { id: 'copy1', src: 'copy1.png' },
                { id: 'copy2', src: 'copy2.png' },
                { id: 'copy3', src: 'copy3.png' },
                { id: 'copy4', src: 'copy4.png' },
                { id: 'copy5', src: 'copy5.png' },
                { id: 'copy6', src: 'copy6.png' },
                { id: 'effect3', src: 'effect3.png' },
                { id: 'circle1', src: 'circle1.png' },
                { id: 'circle2', src: 'circle2.png' },
                { id: 'circle3', src: 'circle3.png' },
                { id: 'spoonfolk', src: 'spoonfolk.png' }
            ];
        }
        else {
            _this.init([100, 250, 650]);
            _this.manifest = [
                { id: 'title', src: 'title.svg' },
                { id: 'point', src: 'point.png' },
                { id: 'pear1', src: 'pear1.png' },
                { id: 'pear2', src: 'pear2.png' },
                { id: 'copy1', src: 'copy1@sp.png' },
                { id: 'copy2', src: 'copy2.png' },
                { id: 'copy3', src: 'copy3@sp.png' },
                { id: 'copy4', src: 'copy4@sp.png' },
                { id: 'copy5', src: 'copy5@sp.png' },
                { id: 'copy6', src: 'copy6@sp.png' },
                { id: 'circle', src: 'circle@sp.png' },
                { id: 'effect3', src: 'effect3@sp.png' },
                { id: 'spoonfolk', src: 'spoonfolk@sp.png' }
            ];
        }
        return _this;
    }
    Taste2.prototype.create = function (queue) {
        _super.prototype.create.call(this, queue);
        this.el.find('.tasteContent').append('<div class="chefkodawari"><a href="#modal5"><img alt="" src="../img/kodawaribtn.svg"></a></div>');
    };
    Taste2.prototype.reset = function () {
        _super.prototype.reset.call(this);
        this.el.find('.pear1_line polygon').attr('style', 'fill:none;stroke:#FFFFFF;stroke-miterlimit:10;');
        this.el.find('.pear2_line polygon').attr('style', 'fill:none;stroke:#FFFFFF;stroke-miterlimit:10;');
    };
    Taste2.prototype.show = function (index) {
        var spendTime = (index === 0) ? 0 : this.showInfo[index].time - this.showInfo[index - 1].time;
        var delay = 0;
        if (viewMode === 'pc') {
            switch (index) {
                case 0:
                    this.showTitle();
                    anime({
                        targets: '.' + this.name + ' .copy1',
                        translateY: [4, 0],
                        opacity: [0, 1],
                        delay: 1500,
                        duration: 400,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy2',
                        scale: [0.95, 1],
                        opacity: [0, 1],
                        delay: 1800,
                        duration: 1500,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy3',
                        scale: [0.7, 1],
                        opacity: [0, 1],
                        delay: 2400,
                        duration: 300,
                        easing: 'easeOutBack'
                    });
                    // pear 1
                    anime({
                        targets: '.' + this.name + ' .pear1_line',
                        scale: [0.9, 1],
                        delay: 1400,
                        duration: 700,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .pear1_line polygon',
                        strokeDashoffset: [1500, 0],
                        delay: 1400,
                        duration: 1000,
                        easing: 'linear'
                    });
                    anime({
                        targets: '.' + this.name + ' .pear1_line',
                        opacity: [1, 0],
                        delay: 2600,
                        duration: 400,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .pear1',
                        opacity: [0, 1],
                        delay: 2400,
                        duration: 400,
                        easing: 'easeOutSine'
                    });
                    break;
                case 1:
                    delay = Math.max(0, 2800 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .copy4',
                        clip: ['rect(0 0 44px 0)', 'rect(0 134px 44px 0)'],
                        translateX: [32, 0],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 500,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy5',
                        clip: ['rect(0 0 83px 0)', 'rect(0 410px 83px 0)'],
                        translateX: [32, 0],
                        opacity: [0, 1],
                        delay: delay + 300,
                        duration: 500,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy6',
                        clip: ['rect(0 0 29px 0)', 'rect(0 177px 29px 0)'],
                        translateX: [32, 0],
                        opacity: [0, 1],
                        delay: delay + 600,
                        duration: 500,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .effect3',
                        scale: [0.4, 1],
                        opacity: [0, 1],
                        delay: delay + 800,
                        duration: 500,
                        easing: 'easeOutQuart'
                    });
                    // pear 2
                    anime({
                        targets: '.' + this.name + ' .pear2_line',
                        scale: [0.9, 1],
                        delay: delay,
                        duration: 700,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .pear2_line polygon',
                        strokeDashoffset: [1220, 0],
                        delay: delay,
                        duration: 1200,
                        easing: 'easeInOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .pear2_line',
                        opacity: [1, 0],
                        delay: delay + 1400,
                        duration: 400,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .pear2',
                        opacity: [0, 1],
                        delay: delay + 1200,
                        duration: 400,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle1',
                        opacity: [0, 1],
                        translateY: [90, 0],
                        delay: delay,
                        duration: 1100,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle2',
                        opacity: [0, 1],
                        translateY: [90, 0],
                        delay: delay + 600,
                        duration: 800,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle3',
                        opacity: [0, 1],
                        translateY: [90, 0],
                        delay: delay + 500,
                        duration: 1000,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .spoonfolk',
                        opacity: [0, 1],
                        translateX: [10, 0],
                        delay: delay + 1800,
                        duration: 350,
                        easing: 'easeOutQuad'
                    });
                    break;
            }
        }
        else {
            switch (index) {
                case 0:
                    this.showTitle();
                    anime({
                        targets: '.' + this.name + ' .copy1',
                        translateY: [4, 0],
                        opacity: [0, 1],
                        delay: 1200,
                        duration: 400,
                        easing: 'easeOutQuad'
                    });
                    break;
                case 1:
                    delay = Math.max(0, 1650 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .copy2',
                        scale: [0.95, 1],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 800,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy3',
                        scale: [0.7, 1],
                        opacity: [0, 1],
                        delay: delay + 600,
                        duration: 300,
                        easing: 'easeOutBack'
                    });
                    // pear 1
                    anime({
                        targets: '.' + this.name + ' .pear1',
                        opacity: [0, 1],
                        scale: [0.98, 1],
                        delay: delay + 600,
                        duration: 400,
                        easing: 'easeOutSine'
                    });
                    break;
                case 2:
                    delay = Math.max(0, 1500 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .circle',
                        opacity: [0, 1],
                        translateY: [60, 0],
                        delay: delay,
                        duration: 1200,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy4',
                        clip: ['rect(0 0 25px 0)', 'rect(0 76px 25px 0)'],
                        translateX: [32, 0],
                        opacity: [0, 1],
                        delay: delay + 100,
                        duration: 600,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy5',
                        clip: ['rect(0 0 65px 0)', 'rect(0 223px 65px 0)'],
                        translateX: [32, 0],
                        opacity: [0, 1],
                        delay: delay + 400,
                        duration: 600,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy6',
                        clip: ['rect(0 0 17px 0)', 'rect(0 100px 17px 0)'],
                        translateX: [32, 0],
                        opacity: [0, 1],
                        delay: delay + 700,
                        duration: 600,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .effect3',
                        scale: [0.4, 1],
                        opacity: [0, 1],
                        delay: delay + 800,
                        duration: 500,
                        easing: 'easeOutQuart'
                    });
                    // pear 2
                    anime({
                        targets: '.' + this.name + ' .pear2',
                        opacity: [0, 1],
                        delay: delay + 1200,
                        duration: 400,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .spoonfolk',
                        opacity: [0, 1],
                        translateX: [10, 0],
                        delay: delay + 1500,
                        duration: 350,
                        easing: 'easeOutQuad'
                    });
                    break;
            }
        }
        return delay;
    };
    return Taste2;
}(Taste));
// ==================================================
var Taste3 = (function (_super) {
    __extends(Taste3, _super);
    function Taste3() {
        var _this = _super.call(this) || this;
        _this.name = 'taste3';
        // this.enabled = false;
        if (viewMode === 'pc') {
            _this.init([150, 400, 500, 850, 1200]);
            _this.manifest = [
                { id: 'circle1', src: 'circle1.png' },
                { id: 'circle2', src: 'circle2.png' },
                { id: 'title', src: 'title.svg' },
                { id: 'point', src: 'point.png' },
                { id: 'leaf1', src: 'leaf1.png' },
                { id: 'leaf2', src: 'leaf2.png' },
                { id: 'apple', src: 'apple.png' },
                { id: 'scene', src: 'scene.png' },
                { id: 'effect', src: 'effect.png' },
                { id: 'copy1', src: 'copy1.png' },
                { id: 'copy2', src: 'copy2.png' },
                { id: 'copy3', src: 'copy3.png' },
                { id: 'copy4', src: 'copy4.png' },
                { id: 'copy5', src: 'copy5.png' },
                { id: 'copy6', src: 'copy6.png' },
                { id: 'copy7', src: 'copy7.png' },
                { id: 'copy8', src: 'copy8.png' },
                { id: 'catch', src: 'catch.png' },
                { id: 'fruit1', src: 'fruit1.png' },
                { id: 'fruit2', src: 'fruit2.png' },
                { id: 'fruit3', src: 'fruit3.png' },
                { id: 'productname', src: 'productname.png' },
                { id: 'product', src: 'product.png' }
            ];
        }
        else {
            _this.init([100, 300, 700, 850, 1050]);
            _this.manifest = [
                { id: 'circle', src: 'circle@sp.png' },
                { id: 'apple', src: 'apple.png' },
                { id: 'title', src: 'title.svg' },
                { id: 'point', src: 'point.png' },
                { id: 'leaf1', src: 'leaf1@sp.png' },
                { id: 'leaf2', src: 'leaf2@sp.png' },
                { id: 'copy1', src: 'copy1@sp.png' },
                { id: 'copy2', src: 'copy2@sp.png' },
                { id: 'copy3', src: 'copy3@sp.png' },
                { id: 'copy4', src: 'copy4@sp.png' },
                { id: 'copy5', src: 'copy5@sp.png' },
                { id: 'copy6', src: 'copy6@sp.png' },
                { id: 'copy7', src: 'copy7@sp.png' },
                { id: 'copy8', src: 'copy8@sp.png' },
                { id: 'effect', src: 'effect@sp.png' },
                { id: 'scene', src: 'scene@sp.png' },
                { id: 'catch', src: 'catch@sp.png' }
            ];
        }
        _this.el.append('<div class="bg"></div>');
        return _this;
    }
    Taste3.prototype.create = function (queue) {
        _super.prototype.create.call(this, queue);
        this.el.find('.tasteContent .copy8').before('<div class="chefkodawari"><a href="#modal6"><img alt="" src="../img/kodawaribtn.svg"></a></div>');
    };
    Taste3.prototype.show = function (index) {
        var spendTime = (index === 0) ? 0 : this.showInfo[index].time - this.showInfo[index - 1].time;
        var delay = 0;
        if (viewMode === 'pc') {
            switch (index) {
                case 0:
                    this.showTitle();
                    break;
                case 1:
                    delay = Math.max(0, 1200 - spendTime);
                    // copy
                    anime({
                        targets: '.' + this.name + ' .copy1',
                        opacity: [0, 1],
                        scale: [1.1, 1],
                        rotate: [10, 0],
                        delay: delay,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy2',
                        opacity: [0, 1],
                        scale: [1.1, 1],
                        rotate: [-5, 0],
                        delay: delay + 100,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy3',
                        opacity: [0, 1],
                        scale: [1.2, 1],
                        rotate: [-8, 0],
                        delay: delay + 180,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy4',
                        opacity: [0, 1],
                        scale: [1.3, 1],
                        delay: delay + 220,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle1',
                        translateY: [30, 0],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 800,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .circle2',
                        translateY: [20, 0],
                        opacity: [0, 1],
                        delay: delay + 200,
                        duration: 700,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .leaf1',
                        opacity: [0, 1],
                        scale: [1.06, 1],
                        rotate: [-3, 0],
                        delay: 1000,
                        duration: 700,
                        easing: 'easeOutQuad'
                    });
                    break;
                case 2:
                    delay = Math.max(0, 500 - spendTime);
                    // copy 5
                    anime({
                        targets: '.' + this.name + ' .copy5',
                        opacity: [0, 1],
                        rotateX: [10, 0],
                        scale: [1.2, 1],
                        skewY: [6, 0],
                        delay: delay + 100,
                        duration: 1000,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy6',
                        opacity: [0, 1],
                        translateX: [-6, 0],
                        delay: delay + 600,
                        duration: 300,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .apple',
                        opacity: [0, 1],
                        delay: delay + 400,
                        duration: 500,
                        easing: 'easeOutSine'
                    });
                    break;
                case 3:
                    delay = Math.max(0, 1000 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .copy7',
                        translateY: [20, 0],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 350,
                        easing: 'easeOutBack'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy8',
                        scale: [1.4, 1],
                        opacity: [0, 1],
                        delay: delay + 300,
                        duration: 1000,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .effect',
                        translateY: [-15, 0],
                        scale: [0.8, 1],
                        opacity: [0, 1],
                        delay: delay + 400,
                        duration: 800,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .leaf2',
                        opacity: [0, 1],
                        delay: delay + 400,
                        duration: 800,
                        easing: 'easeOutQuint'
                    });
                    break;
                case 4:
                    delay = Math.max(0, 500 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .scene',
                        opacity: [0, 1],
                        scale: [0.97, 1],
                        delay: delay + 400,
                        duration: 650,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .catch',
                        opacity: [0, 1],
                        translateY: [20, 0],
                        delay: delay + 1000,
                        duration: 300,
                        easing: 'easeOutBack'
                    });
                    break;
            }
        }
        else {
            switch (index) {
                case 0:
                    this.showTitle();
                    break;
                case 1:
                    delay = Math.max(0, 1200 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .circle',
                        translateY: [30, 0],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 1200,
                        easing: 'easeOutQuad'
                    });
                    // copy
                    anime({
                        targets: '.' + this.name + ' .copy1',
                        opacity: [0, 1],
                        scale: [1.1, 1],
                        rotate: [10, 0],
                        delay: delay,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy2',
                        opacity: [0, 1],
                        scale: [1.1, 1],
                        rotate: [-5, 0],
                        delay: delay + 100,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy3',
                        opacity: [0, 1],
                        scale: [1.2, 1],
                        rotate: [-8, 0],
                        delay: delay + 180,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy4',
                        opacity: [0, 1],
                        scale: [1.3, 1],
                        delay: delay + 220,
                        duration: 600,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .leaf1',
                        opacity: [0, 1],
                        scale: [1.06, 1],
                        rotate: [-3, 0],
                        delay: delay + 200,
                        duration: 700,
                        easing: 'easeOutQuad'
                    });
                    anime({
                        targets: '.' + this.name + ' .apple',
                        opacity: [0, 1],
                        delay: delay + 800,
                        duration: 500,
                        easing: 'easeOutSine'
                    });
                    break;
                case 2:
                    delay = Math.max(0, 2000 - spendTime);
                    // copy 5
                    anime({
                        targets: '.' + this.name + ' .copy5',
                        opacity: [0, 1],
                        rotateX: [10, 0],
                        scale: [1.2, 1],
                        skewY: [6, 0],
                        delay: delay,
                        duration: 1000,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy6',
                        opacity: [0, 1],
                        translateX: [-6, 0],
                        delay: delay + 500,
                        duration: 300,
                        easing: 'easeOutSine'
                    });
                    anime({
                        targets: '.' + this.name + ' .leaf2',
                        opacity: [0, 1],
                        delay: delay + 600,
                        duration: 800,
                        easing: 'easeOutQuint'
                    });
                    break;
                case 3:
                    delay = Math.max(0, 1600 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .copy7',
                        translateY: [20, 0],
                        opacity: [0, 1],
                        delay: delay,
                        duration: 300,
                        easing: 'easeOutBack'
                    });
                    anime({
                        targets: '.' + this.name + ' .copy8',
                        scale: [1.7, 1],
                        opacity: [0, 1],
                        delay: delay + 200,
                        duration: 1000,
                        easing: 'easeOutQuint'
                    });
                    anime({
                        targets: '.' + this.name + ' .effect',
                        translateY: [-15, 0],
                        scale: [0.8, 1],
                        opacity: [0, 1],
                        delay: delay + 250,
                        duration: 800,
                        easing: 'easeOutQuint'
                    });
                    break;
                case 4:
                    delay = Math.max(0, 500 - spendTime);
                    anime({
                        targets: '.' + this.name + ' .scene',
                        opacity: [0, 1],
                        scale: [0.97, 1],
                        delay: delay + 400,
                        duration: 650,
                        easing: 'easeOutQuart'
                    });
                    anime({
                        targets: '.' + this.name + ' .catch',
                        opacity: [0, 1],
                        translateY: [20, 0],
                        delay: delay + 1000,
                        duration: 300,
                        easing: 'easeOutBack'
                    });
                    break;
            }
        }
        return delay;
    };
    return Taste3;
}(Taste));
// ==================================================
// setup
var loadQueue;
var loadBgQueue;
var tastes;
var status;
var viewMode;
var viewSize = 1; // ~900 / 901~1179 / 1180
function setup() {
    status = 'loading';
    var ua = navigator.userAgent;
    if (ua.indexOf('iPhone') > 0 || ua.indexOf('iPod') > 0 || ua.indexOf('Android') > 0 && ua.indexOf('Mobile') > 0) {
        // スマートフォン用コード
        viewMode = 'sp';
    }
    else if (ua.indexOf('iPad') > 0 || ua.indexOf('Android') > 0) {
        // タブレット用コード
        viewMode = 'pc';
        if (ua.indexOf('Android') > 0 && window.outerWidth < 768) {
            viewMode = 'sp';
        }
    }
    else {
        // PC用コード
        viewMode = 'pc';
    }
    // viewMode = 'sp';
    $('#page-body').addClass(viewMode);
    if (viewMode === 'pc') {
        $('#page-body .hero .products li:nth-child(1)').prepend('<h3 class="productname1"></h3>');
        $('#page-body .hero .products li:nth-child(2)').prepend('<h3 class="productname2"></h3>');
        $('#page-body .hero .products li:nth-child(3)').prepend('<h3 class="productname3"></h3>');
        $('#page-body .hero .products li:nth-child(3)').prepend('<p class="season-limited"></p>');
        $('#page-body .heroInner').append('<p class="chefname"><img alt="" src="../img/hero-chefname.svg"></p>');
        $('#page-body .heroInner').append('<p class="scroll"><img alt="" src="../img/scroll.svg"></p>');
        $('#page-body .recipelink').before('<p class="replaybtn"><img alt="" src="../img/replaybtn.svg"></p>');
    }
    else {
        $('#page-body .hero .lead').before($('#page-body .hero .products'));
        $('#page-body .hero .products li:nth-child(1)').append('<h3 class="productname1"></h3>');
        $('#page-body .hero .products li:nth-child(2)').append('<h3 class="productname2"></h3>');
        $('#page-body .hero .products li:nth-child(3)').append('<h3 class="productname3"></h3>');
        $('#page-body .hero .products li:nth-child(3)').append('<p class="season-limited"></p>');
    }
    $('img.chimg').each(function (index) {
        // console.info(img);
        $(this).attr('src', $(this).attr('data-' + viewMode));
    });
    var taste;
    var manifest = [
        { id: 'taste-title', src: 'img/taste-title.png' },
        { id: 'kodawaribtn_click', src: '../img/kodawaribtn_click.svg' }
    ];
    loadQueue = new createjs.LoadQueue();
    loadQueue.setMaxConnections(10);
    tastes = [];
    taste = new Taste1();
    manifest = manifest.concat(taste.getManifest());
    tastes.push(taste);
    taste = new Taste2();
    manifest = manifest.concat(taste.getManifest());
    tastes.push(taste);
    taste = new Taste3();
    manifest = manifest.concat(taste.getManifest());
    tastes.push(taste);
    loadQueue = new createjs.LoadQueue();
    loadQueue.on("progress", loadProgress);
    loadQueue.on("complete", loadComplete);
    loadQueue.loadManifest(manifest);
    loadBgQueue = new createjs.LoadQueue();
    loadBgQueue.setPreferXHR(false);
    if (viewMode === 'pc') {
        loadQueue.loadManifest([
            '../img/hero-bg.jpg'
        ]);
    }
    else {
        loadQueue.loadManifest([
            '../img/hero-bg@sp.jpg'
        ]);
    }
    $(window).on('resize', layout);
    layout();
    $('.loaderOuter').addClass('appear');
}
function loadProgress(evt) {
    // console.info(evt);
    $('#page-body .loading .percent').text(Math.floor(evt.loaded * 100) + '%');
}
function loadComplete() {
    $('#page-body .loading .percent').addClass('complete');
    anime({
        targets: '.loaderOuter',
        opacity: [1, 0],
        delay: 80,
        duration: 200,
        easing: 'easeInQuad',
        complete: function () {
            start();
        }
    });
    $('#page-body .container').addClass('block');
}
function start() {
    status = 'main';
    $('#page-body .loading').remove();
    $('#page-body .container').addClass('show');
    tastes.forEach(function (taste, index) {
        taste.create(loadQueue);
        taste.kodawari();
    });
    $('.tastes .taste-title').append(loadQueue.getResult('taste-title'));
    $('.hero .scroll')
        .addClass('show')
        .on('click', function () {
        $("html,body").animate({ scrollTop: Math.max(500, $(window).height()) - 170 });
    });
    $('.replaybtn').on('click', function (evt) {
        $("html,body").animate({ scrollTop: 0 }, 1000, 'swing', function () {
            replay();
        });
    });
    $('.pagetop').on('click', function (evt) {
        $("html,body").animate({ scrollTop: 0 });
    });
    anime({
        targets: '.hero .title',
        scale: [0.6, 1.0],
        opacity: [0, 1],
        translateY: [40, 0],
        delay: 100,
        duration: 400,
        easing: 'easeOutBack'
    });
    anime({
        targets: '.hero .copy',
        opacity: [0, 1],
        delay: 300,
        duration: 300,
        easing: 'easeInQuad'
    });
    anime({
        targets: '.hero .lead',
        opacity: [0, 1],
        delay: 700,
        duration: 300,
        easing: 'easeInQuad'
    });
    anime({
        targets: '.hero li',
        opacity: [0, 1],
        delay: 700,
        duration: 300,
        easing: 'easeInQuad'
    });
}
function replay() {
    tastes.forEach(function (t) {
        t.reset();
    });
}
function layout() {
    var ww = Math.max(1040, $(window).width());
    var wh = Math.max(500, $(window).height());
    var hh = wh - 155;
    if (status === 'loading') {
        if (viewMode == 'pc') {
            $('.loaderOuter').css({
                top: 155 + ((hh - 130) / 2) + 'px'
            });
        }
        else {
            $('.loaderOuter').css({
                top: 300 + 'px'
            });
        }
    }
    if (viewMode === 'pc') {
        var _viewSize;
        if (ww < 1180) {
            _viewSize = 2;
        }
        else {
            _viewSize = 1;
        }
        $('.hero > .heroInner').css({
            height: hh + 'px'
        });
        var cx = Math.min(ww - 494 - 30, (ww / 2) - 30);
        if (wh < 620) {
            cx = Math.min(ww - 600 - 30, (ww / 2) - 30);
        }
        var ch = 545;
        if (wh < 620) {
            ch = 310;
        }
        else if (wh < 750) {
            ch = 450;
        }
        $('.hero .heroContent').css({
            left: cx + 'px',
            top: ((hh - ch) / 2) - 20 + 'px'
        });
        if (_viewSize != viewSize) {
            $('#page-body').removeClass('size' + viewSize).addClass('size' + _viewSize);
            viewSize = _viewSize;
        }
    }
}
setup();

},{}]},{},[1]);
