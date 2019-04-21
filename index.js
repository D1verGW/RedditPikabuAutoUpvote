// ==UserScript==
// @name         New Userscript
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       https://github.com/D1verGW
// @match        *://www.reddit.com/*
// @grant        none
// ==/UserScript==

function logger () {
    if (window.enableRedditPikabuScriptLog) {
        console.log.call(this, ...arguments);
    }
};

window.enableRedditPikabuScriptLog = true;

const isPostOnTop = function (target, unvisibleCallback) {
    if (!target || !target.nodeType === 1) return console.warn('target is incorrect', target); // validation
    // Все позиции элемента
    var targetPosition = {
            top: window.pageYOffset + target.getBoundingClientRect().top,
            left: window.pageXOffset + target.getBoundingClientRect().left,
            right: window.pageXOffset + target.getBoundingClientRect().right,
            bottom: window.pageYOffset + target.getBoundingClientRect().bottom
        },
        // Получаем позиции окна
        windowPosition = {
            top: window.pageYOffset,
            left: window.pageXOffset,
            right: window.pageXOffset + document.documentElement.clientWidth,
            bottom: window.pageYOffset + document.documentElement.clientHeight
        };

    // Если позиция нижней части элемента меньше позиции верхней чайти окна, то элемент скрыт верхней частью окна браузера
    return targetPosition.bottom < windowPosition.top;
};

const observeDOM = (function () {
    var MutationObserver = window.MutationObserver || window.WebKitMutationObserver;

    return function (obj, callback) {
        if (!obj || !obj.nodeType === 1) return console.warn('observable node incorrect', obj); // validation

        if (MutationObserver) {
            // define a new observer
            var obs = new MutationObserver(function (mutations, observer) {
                callback(mutations);
            })
            // have the observer observe foo for changes in children
            obs.observe(obj, { childList: true, subtree: true });
        }

        else if (window.addEventListener) {
            obj.addEventListener('DOMNodeInserted', callback, false);
            obj.addEventListener('DOMNodeRemoved', callback, false);
        }
    }
})();

(function () {
    'use strict';

    logger('---> init script');

    let isInitObserver = false;

    observeDOM(document.body, () => {
        const postsContainer = document.querySelector('.rpBJOHq2PR60pnwJlUyP0');

        if (postsContainer && !isInitObserver) {
            observeDOM(postsContainer, () => {
                if (location.href !== 'https://www.reddit.com/r/pikabu/'
                    && location.href !== 'https://www.reddit.com/r/Pikabu/'
                    && location.href !== 'https://www.reddit.com/r/pikabu'
                    && location.href !== 'https://www.reddit.com/r/Pikabu'
                ) {
                    return logger('---> not match pikabu subreddit')
                };
                logger('---> match pikabu subreddit');
                isInitObserver = true;
                (Array.from(postsContainer.children)).forEach(post => {
                    if (!isPostOnTop(post)) return;

                    const upvoteElem = post.querySelector("[aria-label^='upvote']");
                    const downvoteElem = post.querySelector("[aria-label^='downvote']");
                    const isUpvote = !!post.querySelector("[aria-label^='upvote'][aria-pressed='true']");
                    const isDownvote = !!post.querySelector("[aria-label^='downvote'][aria-pressed='true']");

                    if (!isUpvote && !isDownvote) {
                        logger('---> upvote');
                        upvoteElem.click();
                    }
                });
            });
        } else if (!postsContainer && isInitObserver) {
            isInitObserver = false;
            logger('---> not match posts container');
        } else if (!postsContainer) {
            logger('---> not match posts container');
        }
    })
})();